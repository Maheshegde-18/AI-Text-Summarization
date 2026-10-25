"""
tests/test_summarizer.py
------------------------
Unit tests for the AI-Based Text Summarization System.

Covers:
- count_words()
- count_chars()
- calculate_reduction()
- Input validation inside summarize_text()
- Long-text chunking (_split_into_chunks)
- Mocked Gemini API calls through summarize_text()

Run with:
    python -m pytest tests/ -v
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Ensure the parent directory is on sys.path so we can import summarizer
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import summarizer
from summarizer import (
    calculate_reduction,
    count_chars,
    count_words,
    summarize_text,
    _split_into_chunks,
    MAX_TOTAL_WORDS,
    MAX_WORDS_PER_CHUNK,
    MIN_WORDS,
)


# ---------------------------------------------------------------------------
# Helper: generate a text with a given word count
# ---------------------------------------------------------------------------

def make_text(word_count: int) -> str:
    """Return a simple text string with exactly *word_count* words."""
    return " ".join(["word"] * word_count)


# ---------------------------------------------------------------------------
# Tests: count_words
# ---------------------------------------------------------------------------

class TestCountWords(unittest.TestCase):

    def test_normal_sentence(self):
        self.assertEqual(count_words("Hello world this is a test"), 6)

    def test_empty_string(self):
        self.assertEqual(count_words(""), 0)

    def test_whitespace_only(self):
        self.assertEqual(count_words("   \n\t  "), 0)

    def test_single_word(self):
        self.assertEqual(count_words("Python"), 1)

    def test_extra_spaces(self):
        self.assertEqual(count_words("  one   two   three  "), 3)

    def test_none_equivalent(self):
        # None is not a valid input but count_words should not crash on falsy values
        self.assertEqual(count_words(None), 0)  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# Tests: count_chars
# ---------------------------------------------------------------------------

class TestCountChars(unittest.TestCase):

    def test_normal_string(self):
        self.assertEqual(count_chars("Hello"), 5)

    def test_empty_string(self):
        self.assertEqual(count_chars(""), 0)

    def test_spaces_counted(self):
        self.assertEqual(count_chars("a b"), 3)

    def test_none_returns_zero(self):
        self.assertEqual(count_chars(None), 0)  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# Tests: calculate_reduction
# ---------------------------------------------------------------------------

class TestCalculateReduction(unittest.TestCase):

    def test_fifty_percent_reduction(self):
        self.assertEqual(calculate_reduction(100, 50), 50.0)

    def test_no_reduction(self):
        self.assertEqual(calculate_reduction(100, 100), 0.0)

    def test_full_reduction(self):
        self.assertEqual(calculate_reduction(100, 0), 100.0)

    def test_zero_original(self):
        # Should not divide by zero
        self.assertEqual(calculate_reduction(0, 0), 0.0)

    def test_rounding(self):
        result = calculate_reduction(3, 2)
        self.assertAlmostEqual(result, 33.3, places=1)

    def test_negative_result_clamped_to_zero(self):
        # Summary longer than original should not produce negative reduction
        result = calculate_reduction(10, 20)
        self.assertEqual(result, 0.0)


# ---------------------------------------------------------------------------
# Tests: _split_into_chunks
# ---------------------------------------------------------------------------

class TestSplitIntoChunks(unittest.TestCase):

    def test_short_text_is_single_chunk(self):
        text = make_text(100)
        chunks = _split_into_chunks(text, max_words=500)
        self.assertEqual(len(chunks), 1)

    def test_text_split_into_multiple_chunks(self):
        # Create text with 2000 words in separate paragraphs to force chunking
        para = make_text(600)
        text = "\n\n".join([para] * 4)  # 2400 words across 4 paragraphs
        chunks = _split_into_chunks(text, max_words=700)
        self.assertGreater(len(chunks), 1)

    def test_no_words_discarded(self):
        para = make_text(500)
        text = "\n\n".join([para] * 5)  # 2500 words
        chunks = _split_into_chunks(text, max_words=700)
        total_words = sum(count_words(c) for c in chunks)
        # Allow minor variation due to whitespace normalization, but no words lost
        self.assertGreaterEqual(total_words, 2490)

    def test_returns_list(self):
        chunks = _split_into_chunks("Hello world.", max_words=100)
        self.assertIsInstance(chunks, list)

    def test_empty_string_returns_empty_list(self):
        chunks = _split_into_chunks("", max_words=100)
        self.assertEqual(chunks, [])


# ---------------------------------------------------------------------------
# Tests: summarize_text — input validation (no API calls needed)
# ---------------------------------------------------------------------------

class TestSummarizeTextValidation(unittest.TestCase):

    def test_empty_input_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            summarize_text("")
        self.assertIn("Please enter some text", str(ctx.exception))

    def test_whitespace_only_raises_value_error(self):
        with self.assertRaises(ValueError):
            summarize_text("   \n\t  ")

    def test_too_short_raises_value_error(self):
        short_text = make_text(MIN_WORDS - 1)
        with self.assertRaises(ValueError) as ctx:
            summarize_text(short_text)
        self.assertIn("too short", str(ctx.exception))

    def test_too_long_raises_value_error(self):
        long_text = make_text(MAX_TOTAL_WORDS + 1)
        with self.assertRaises(ValueError) as ctx:
            summarize_text(long_text)
        self.assertIn("exceeds", str(ctx.exception))

    def test_missing_api_key_raises_environment_error(self):
        """Without a real key in the environment, EnvironmentError should be raised."""
        # Temporarily clear the key
        original = os.environ.pop("GEMINI_API_KEY", None)
        try:
            with self.assertRaises(EnvironmentError) as ctx:
                summarize_text(make_text(MIN_WORDS + 5))
            self.assertIn("GEMINI_API_KEY", str(ctx.exception))
        finally:
            if original:
                os.environ["GEMINI_API_KEY"] = original


# ---------------------------------------------------------------------------
# Tests: summarize_text — mocked API calls
# ---------------------------------------------------------------------------

class TestSummarizeTextMocked(unittest.TestCase):
    """
    Tests that mock the Gemini client so no real API key is needed.
    These verify the integration logic without making network calls.
    """

    def _make_mock_response(self, text: str) -> MagicMock:
        """Return a mock that mimics a Gemini API response object."""
        mock_resp = MagicMock()
        mock_resp.text = text
        return mock_resp

    @patch("summarizer.genai.Client")
    def test_successful_summary(self, MockClient):
        """Mocked API should return the summary text."""
        os.environ["GEMINI_API_KEY"] = "test-key-mock"
        mock_instance = MockClient.return_value
        mock_instance.models.generate_content.return_value = self._make_mock_response(
            "This is a concise summary."
        )

        result = summarize_text(make_text(MIN_WORDS + 10))

        self.assertEqual(result, "This is a concise summary.")
        mock_instance.models.generate_content.assert_called_once()

    @patch("summarizer.genai.Client")
    def test_empty_api_response_raises_value_error(self, MockClient):
        """Empty API response should raise ValueError."""
        os.environ["GEMINI_API_KEY"] = "test-key-mock"
        mock_instance = MockClient.return_value
        mock_instance.models.generate_content.return_value = self._make_mock_response("")

        with self.assertRaises(ValueError) as ctx:
            summarize_text(make_text(MIN_WORDS + 10))
        self.assertIn("empty response", str(ctx.exception))

    @patch("summarizer.genai.Client")
    def test_api_authentication_error(self, MockClient):
        """API key error should be wrapped in a RuntimeError."""
        os.environ["GEMINI_API_KEY"] = "test-key-mock"
        mock_instance = MockClient.return_value
        mock_instance.models.generate_content.side_effect = Exception(
            "Request had invalid authentication credentials. API_KEY not valid."
        )

        with self.assertRaises(RuntimeError) as ctx:
            summarize_text(make_text(MIN_WORDS + 10))
        self.assertIn("Authentication", str(ctx.exception))

    @patch("summarizer.genai.Client")
    def test_api_rate_limit_error(self, MockClient):
        """Rate limit / quota errors should surface as RuntimeError."""
        os.environ["GEMINI_API_KEY"] = "test-key-mock"
        mock_instance = MockClient.return_value
        mock_instance.models.generate_content.side_effect = Exception(
            "RESOURCE_EXHAUSTED: Quota exceeded."
        )

        with self.assertRaises(RuntimeError) as ctx:
            summarize_text(make_text(MIN_WORDS + 10))
        self.assertIn("Rate limit", str(ctx.exception))

    @patch("summarizer.genai.Client")
    def test_api_model_not_found_error(self, MockClient):
        """Missing model errors should surface as RuntimeError."""
        os.environ["GEMINI_API_KEY"] = "test-key-mock"
        mock_instance = MockClient.return_value
        mock_instance.models.generate_content.side_effect = Exception(
            "NOT_FOUND: models/gemini-99-flash is not found."
        )

        with self.assertRaises(RuntimeError) as ctx:
            summarize_text(make_text(MIN_WORDS + 10))
        self.assertIn("not found", str(ctx.exception).lower())

    @patch("summarizer.genai.Client")
    def test_long_text_triggers_chunking(self, MockClient):
        """Text exceeding MAX_WORDS_PER_CHUNK should trigger multiple API calls."""
        os.environ["GEMINI_API_KEY"] = "test-key-mock"
        mock_instance = MockClient.return_value

        call_count = {"n": 0}

        def side_effect(**kwargs):
            call_count["n"] += 1
            return self._make_mock_response(f"Chunk summary {call_count['n']}.")

        mock_instance.models.generate_content.side_effect = side_effect

        # Build text slightly larger than MAX_WORDS_PER_CHUNK
        para = make_text(MAX_WORDS_PER_CHUNK // 2 + 50)
        long_text = "\n\n".join([para] * 3)  # 3 paragraphs → chunking required

        result = summarize_text(long_text)

        # Multiple API calls should have been made (chunks + combine)
        self.assertGreater(mock_instance.models.generate_content.call_count, 1)
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    unittest.main(verbosity=2)
