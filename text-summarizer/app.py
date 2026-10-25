"""
app.py
------
Streamlit web interface for the AI-Based Text Summarization System.

Run with:
    streamlit run app.py
"""

import streamlit as st
from dotenv import load_dotenv

from summarizer import (
    summarize_text,
    count_words,
    count_chars,
    calculate_reduction,
    MAX_TOTAL_WORDS,
    MIN_WORDS,
)

# Load environment variables before anything else
load_dotenv()

# ---------------------------------------------------------------------------
# Page configuration
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="AI Text Summarizer",
    page_icon="📝",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ---------------------------------------------------------------------------
# Custom CSS — minimal, clean styling
# ---------------------------------------------------------------------------
st.markdown(
    """
    <style>
        /* Main container */
        .main .block-container {
            max-width: 800px;
            padding-top: 2rem;
            padding-bottom: 3rem;
        }

        /* Title area */
        .app-title {
            font-size: 2.1rem;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 0.2rem;
        }
        .app-subtitle {
            font-size: 1.05rem;
            color: #555;
            margin-bottom: 1.5rem;
        }

        /* Stat badges */
        .stat-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }
        .stat-badge {
            background: #f0f4ff;
            border: 1px solid #d0daff;
            border-radius: 8px;
            padding: 6px 14px;
            font-size: 0.88rem;
            color: #333;
        }

        /* Summary output box */
        .summary-box {
            background: #f8fff8;
            border: 1px solid #b2dfb2;
            border-radius: 10px;
            padding: 1.2rem 1.4rem;
            font-size: 1rem;
            line-height: 1.7;
            color: #1a1a1a;
            white-space: pre-wrap;
        }

        /* Section separator */
        .section-divider {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 1.8rem 0;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
st.markdown('<p class="app-title">📝 AI-Based Text Summarization System</p>', unsafe_allow_html=True)
st.markdown(
    '<p class="app-subtitle">Turn lengthy text into clear, concise summaries using AI.</p>',
    unsafe_allow_html=True,
)

st.markdown('<hr class="section-divider">', unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Input section
# ---------------------------------------------------------------------------
st.subheader("📄 Input Text")
st.caption(
    f"Paste an article, report, or any text below. "
    f"Minimum {MIN_WORDS} words · Maximum {MAX_TOTAL_WORDS:,} words."
)

input_text = st.text_area(
    label="Text to summarize",
    placeholder="Paste your text here…",
    height=280,
    label_visibility="collapsed",
)

# Live word / character counters
words_in = count_words(input_text)
chars_in = count_chars(input_text)

st.markdown(
    f'<div class="stat-row">'
    f'<span class="stat-badge">📊 Words: <strong>{words_in:,}</strong></span>'
    f'<span class="stat-badge">🔤 Characters: <strong>{chars_in:,}</strong></span>'
    f'</div>',
    unsafe_allow_html=True,
)

# Warn the user as they approach the word limit
if words_in > MAX_TOTAL_WORDS:
    st.error(
        f"⚠️ Your input has **{words_in:,}** words, which exceeds the "
        f"**{MAX_TOTAL_WORDS:,}-word** limit. Please shorten the text before summarizing."
    )
elif words_in > MAX_TOTAL_WORDS * 0.85:
    st.warning(
        f"Your input is close to the {MAX_TOTAL_WORDS:,}-word limit "
        f"({words_in:,} words). Very long texts will be processed in chunks."
    )

# ---------------------------------------------------------------------------
# Generate button
# ---------------------------------------------------------------------------
generate_clicked = st.button("✨ Generate Summary", type="primary", use_container_width=True)

# ---------------------------------------------------------------------------
# Summarization logic
# ---------------------------------------------------------------------------
if generate_clicked:
    # Basic client-side validation to avoid a round-trip for obvious errors
    if not input_text or not input_text.strip():
        st.error("⚠️ Please paste some text before clicking Generate Summary.")
    elif words_in < MIN_WORDS:
        st.error(
            f"⚠️ Your text has only **{words_in}** word(s). "
            f"Please provide at least **{MIN_WORDS}** words to generate a meaningful summary."
        )
    elif words_in > MAX_TOTAL_WORDS:
        st.error(
            f"⚠️ Input exceeds the {MAX_TOTAL_WORDS:,}-word limit. "
            "Please shorten the text."
        )
    else:
        with st.spinner("🔄 Generating summary… please wait."):
            try:
                summary = summarize_text(input_text)

                # ---------------------------------------------------------------
                # Display the summary
                # ---------------------------------------------------------------
                st.markdown('<hr class="section-divider">', unsafe_allow_html=True)
                st.subheader("📋 Generated Summary")

                st.markdown(
                    f'<div class="summary-box">{summary}</div>',
                    unsafe_allow_html=True,
                )

                # ---------------------------------------------------------------
                # Summary statistics
                # ---------------------------------------------------------------
                words_out = count_words(summary)
                reduction = calculate_reduction(words_in, words_out)

                st.markdown("<br>", unsafe_allow_html=True)
                st.markdown(
                    f'<div class="stat-row">'
                    f'<span class="stat-badge">📝 Original words: <strong>{words_in:,}</strong></span>'
                    f'<span class="stat-badge">✅ Summary words: <strong>{words_out:,}</strong></span>'
                    f'<span class="stat-badge">📉 Reduction: <strong>{reduction}%</strong></span>'
                    f'</div>',
                    unsafe_allow_html=True,
                )

                # ---------------------------------------------------------------
                # Download button
                # ---------------------------------------------------------------
                st.download_button(
                    label="⬇️ Download Summary (.txt)",
                    data=summary,
                    file_name="summary.txt",
                    mime="text/plain",
                    use_container_width=True,
                )

                st.success("✅ Summary generated successfully!")

            # --- Specific, user-friendly error handling ---
            except EnvironmentError as e:
                st.error(
                    f"🔑 **API Key Missing**\n\n{e}\n\n"
                    "**How to fix:** Create a `.env` file in the project folder "
                    "with `GEMINI_API_KEY=your_key_here`."
                )
            except ValueError as e:
                st.warning(f"⚠️ **Input Problem**\n\n{e}")
            except RuntimeError as e:
                error_str = str(e)
                if "Authentication" in error_str or "API key" in error_str.lower():
                    st.error(
                        f"🔐 **Authentication Error**\n\n{e}\n\n"
                        "Get your key at https://aistudio.google.com/apikey"
                    )
                elif "Rate limit" in error_str or "quota" in error_str.lower():
                    st.error(
                        f"⏳ **Rate Limit Reached**\n\n{e}"
                    )
                elif "not found" in error_str.lower() or "model" in error_str.lower():
                    st.error(
                        f"🤖 **Model Not Found**\n\n{e}"
                    )
                elif "Network" in error_str or "connection" in error_str.lower():
                    st.error(
                        f"🌐 **Network Error**\n\n{e}"
                    )
                else:
                    st.error(f"❌ **API Error**\n\n{e}")
            except Exception as e:
                # Catch-all — do not expose raw exception details that may leak info
                st.error(
                    "❌ An unexpected error occurred. "
                    "Please check your API key and internet connection, then try again."
                )

# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------
st.markdown('<hr class="section-divider">', unsafe_allow_html=True)
st.caption(
    "Built with [Streamlit](https://streamlit.io) · "
    "Powered by [Google Gemini API](https://ai.google.dev) · "
    "College Project — AI-Based Text Summarization System"
)
