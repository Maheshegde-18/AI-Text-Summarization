"""
summarizer.py
-------------
Handles all Gemini API communication for the AI-Based Text Summarization System.

Responsibilities:
- Load API key and model ID from environment variables (.env).
- Validate input text before sending to the API.
- Build a clear summarization prompt preserving key facts and arguments.
- Call the Gemini API via official google-genai SDK (generate_content & Interactions API).
- Handle long inputs by chunking along paragraph/sentence boundaries.
- Sanitize and map API exceptions to user-friendly error messages without exposing keys.
"""

import os
import re
import textwrap
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# Always load .env from the project directory
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

# ---------------------------------------------------------------------------
# Configuration constants
# ---------------------------------------------------------------------------

# Maximum words per individual API call and overall document limit
MAX_WORDS_PER_CHUNK = 3000
MAX_TOTAL_WORDS = 10000

# Minimum word count required before attempting summarization
MIN_WORDS = 20

# Default model ID configured for the application
DEFAULT_MODEL = "gemini-3.8-flash"


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def count_words(text: str) -> int:
    """Return the number of whitespace-separated words in *text*."""
    return len(text.split()) if text and text.strip() else 0


def count_chars(text: str) -> int:
    """Return the total character count of *text*."""
    return len(text) if text else 0


def calculate_reduction(original_words: int, summary_words: int) -> float:
    """Return the percentage reduction from original to summary word count."""
    if original_words == 0:
        return 0.0
    reduction = (1 - summary_words / original_words) * 100
    return max(0.0, round(reduction, 1))


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _get_api_key() -> str:
    """
    Read GEMINI_API_KEY from the environment.

    Raises:
        EnvironmentError: If the key is missing or empty.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set. "
            "Create a .env file with GEMINI_API_KEY=<your_key> "
            "or set the environment variable before running the app."
        )
    return api_key


def _get_model_id() -> str:
    """
    Read GEMINI_MODEL_ID from the environment, defaulting to gemini-3.8-flash.
    """
    model = os.environ.get("GEMINI_MODEL_ID", "").strip()
    return model if model else DEFAULT_MODEL


def _build_prompt(text: str, is_chunk: bool = False, chunk_index: int = 1, total_chunks: int = 1) -> str:
    """
    Build the summarization prompt to send to Gemini.

    Args:
        text:          The text to summarize.
        is_chunk:      True when this is one chunk of a larger document.
        chunk_index:   1-based index of the current chunk.
        total_chunks:  Total number of chunks.

    Returns:
        A fully-formed prompt string.
    """
    if is_chunk:
        context = (
            f"The following is part {chunk_index} of {total_chunks} "
            "of a longer document. Summarize only this part concisely, "
            "preserving key facts, names, dates, arguments, and conclusions."
        )
    else:
        context = (
            "Summarize the following text concisely and accurately. "
            "Preserve all important facts, names, dates, arguments, and conclusions. "
            "Do not introduce any information that is not present in the original text. "
            "Write the summary in clear, plain English."
        )

    prompt = textwrap.dedent(f"""
        {context}

        TEXT TO SUMMARIZE:
        \"\"\"
        {text}
        \"\"\"

        SUMMARY:
    """).strip()
    return prompt


def _combine_chunk_summaries_prompt(summaries: list[str]) -> str:
    """Build a prompt that merges multiple chunk summaries into one final summary."""
    numbered = "\n\n".join(
        f"[Part {i + 1}]\n{s}" for i, s in enumerate(summaries)
    )
    return textwrap.dedent(f"""
        The following are sequential summaries of different parts of a single document.
        Combine them into one coherent, concise final summary.
        Preserve all important facts, names, dates, arguments, and conclusions.
        Do not introduce any information not present in the provided summaries.
        Write in clear, plain English.

        PART SUMMARIES:
        \"\"\"
        {numbered}
        \"\"\"

        FINAL COMBINED SUMMARY:
    """).strip()


def _split_into_chunks(text: str, max_words: int) -> list[str]:
    """
    Split *text* into chunks that each contain at most *max_words* words.

    Splitting prefers paragraph boundaries, then sentence boundaries.
    Text is never silently discarded.

    Returns:
        A list of non-empty text chunks.
    """
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]

    chunks: list[str] = []
    current_parts: list[str] = []
    current_word_count = 0

    for para in paragraphs:
        para_words = count_words(para)

        if para_words > max_words:
            sentences = re.split(r"(?<=[.!?])\s+", para)
            for sentence in sentences:
                s_words = count_words(sentence)
                if current_word_count + s_words > max_words and current_parts:
                    chunks.append(" ".join(current_parts))
                    current_parts = []
                    current_word_count = 0
                current_parts.append(sentence)
                current_word_count += s_words
        else:
            if current_word_count + para_words > max_words and current_parts:
                chunks.append("\n\n".join(current_parts))
                current_parts = []
                current_word_count = 0
            current_parts.append(para)
            current_word_count += para_words

    if current_parts:
        chunks.append("\n\n".join(current_parts))

    return [c for c in chunks if c.strip()]


def _call_gemini(client: genai.Client, model_id: str, prompt: str) -> str:
    """
    Send a prompt to the Gemini API and return the response text.
    Calls client.models.generate_content or client.interactions.create.

    Args:
        client:   An initialized genai.Client instance.
        model_id: The Gemini model identifier string.
        prompt:   The full prompt text to send.

    Returns:
        The generated summary text from the model.

    Raises:
        ValueError:        If the API returns an empty response.
        RuntimeError:      On authentication, rate-limit, network, or model errors.
    """
    try:
        # First attempt via client.models.generate_content
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            try:
                response = client.models.generate_content(
                    model=model_id,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.3,
                        max_output_tokens=1024,
                    ),
                )
                output = getattr(response, "text", None)
                if output and isinstance(output, str) and output.strip():
                    return output.strip()
                if output == "":
                    raise ValueError(
                        "The API returned an empty response. "
                        "The input text may have triggered a content safety filter, "
                        "or the model produced no text. Please try again with different phrasing."
                    )
            except (ValueError, RuntimeError):
                raise
            except Exception as model_err:
                # If models.generate_content fails and interactions is available, try interactions
                if hasattr(client, "interactions") and hasattr(client.interactions, "create"):
                    try:
                        interaction = client.interactions.create(
                            model=model_id,
                            input=prompt,
                        )
                        inter_out = getattr(interaction, "output_text", None)
                        if inter_out and isinstance(inter_out, str) and inter_out.strip():
                            return inter_out.strip()
                    except Exception:
                        pass
                # Re-raise to trigger outer exception handling
                raise model_err

        # Fallback if only interactions is present
        if hasattr(client, "interactions") and hasattr(client.interactions, "create"):
            interaction = client.interactions.create(
                model=model_id,
                input=prompt,
            )
            inter_out = getattr(interaction, "output_text", None)
            if inter_out and isinstance(inter_out, str) and inter_out.strip():
                return inter_out.strip()

    except Exception as exc:
        if isinstance(exc, ValueError):
            raise exc

        error_message = str(exc)

        # 503 Model Unavailable / High demand
        if "503" in error_message or "UNAVAILABLE" in error_message or "high demand" in error_message.lower():
            raise RuntimeError(
                f"Model '{model_id}' is temporarily experiencing high demand (HTTP 503). "
                "Please wait a few moments and try again."
            ) from exc

        # Authentication / API key
        if "API_KEY" in error_message or "INVALID_ARGUMENT" in error_message or "api key" in error_message.lower() or "401" in error_message or "403" in error_message:
            raise RuntimeError(
                "Authentication failed. Please check that your GEMINI_API_KEY in .env "
                "is valid and has active access to the Gemini API."
            ) from exc

        # Rate limits / Quota
        if "RESOURCE_EXHAUSTED" in error_message or "quota" in error_message.lower() or "429" in error_message:
            raise RuntimeError(
                "Rate limit exceeded (HTTP 429). You have reached your Gemini API quota. "
                "Please wait a moment before trying again."
            ) from exc

        # Model not found or deprecated
        if "NOT_FOUND" in error_message or "404" in error_message or "is not found" in error_message.lower() or "is no longer available" in error_message.lower():
            raise RuntimeError(
                f"Model '{model_id}' was not found or is no longer available. "
                "Please update GEMINI_MODEL_ID in your .env file to a valid supported model (such as gemini-3.8-flash)."
            ) from exc

        # Network / Timeout / Disconnected
        if "ConnectionError" in type(exc).__name__ or "Timeout" in type(exc).__name__ or "timed out" in error_message.lower() or "disconnected" in error_message.lower():
            raise RuntimeError(
                "Network error: Unable to reach Google Gemini API servers. "
                "Please check your internet connection and try again."
            ) from exc

        # Sanitize any accidental API key patterns
        sanitized = re.sub(r'AIza[0-9A-Za-z-_]{35}', '[REDACTED_API_KEY]', error_message)
        raise RuntimeError(f"Gemini API error: {sanitized}") from exc

    raise ValueError(
        "The API returned an empty response. "
        "The input text may have triggered a content safety filter, "
        "or the model produced no text. Please try again with different phrasing."
    )


# ---------------------------------------------------------------------------
# Public summarization function
# ---------------------------------------------------------------------------

def summarize_text(input_text: str) -> str:
    """
    Generate a concise summary of *input_text* using the Gemini API.

    Args:
        input_text: The raw text to summarize.

    Returns:
        The generated summary string.

    Raises:
        ValueError:        For empty input or inputs outside allowable word ranges.
        EnvironmentError:  If GEMINI_API_KEY is missing.
        RuntimeError:      For API-level errors (auth, quota, network, model).
    """
    if not input_text or not input_text.strip():
        raise ValueError("Please enter some text before generating a summary.")

    word_count = count_words(input_text)

    if word_count < MIN_WORDS:
        raise ValueError(
            f"The text is too short to summarize (only {word_count} word(s)). "
            f"Please provide at least {MIN_WORDS} words."
        )

    if word_count > MAX_TOTAL_WORDS:
        raise ValueError(
            f"The input contains {word_count:,} words, which exceeds the "
            f"configured maximum of {MAX_TOTAL_WORDS:,} words. "
            "Please shorten the text and try again."
        )

    api_key = _get_api_key()
    model_id = _get_model_id()
    client = genai.Client(api_key=api_key)

    if word_count <= MAX_WORDS_PER_CHUNK:
        prompt = _build_prompt(input_text)
        return _call_gemini(client, model_id, prompt)
    else:
        chunks = _split_into_chunks(input_text, MAX_WORDS_PER_CHUNK)
        total_chunks = len(chunks)

        chunk_summaries: list[str] = []
        for i, chunk in enumerate(chunks):
            prompt = _build_prompt(chunk, is_chunk=True, chunk_index=i + 1, total_chunks=total_chunks)
            chunk_summary = _call_gemini(client, model_id, prompt)
            chunk_summaries.append(chunk_summary)

        if len(chunk_summaries) == 1:
            return chunk_summaries[0]

        combine_prompt = _combine_chunk_summaries_prompt(chunk_summaries)
        return _call_gemini(client, model_id, combine_prompt)
