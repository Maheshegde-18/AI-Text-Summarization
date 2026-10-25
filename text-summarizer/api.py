"""
api.py
------
Flask REST API for the AI-Based Text Summarization System.
Bridges the React frontend to summarizer.py.

Endpoints:
  GET  /health          or /api/health
  POST /summarize       or /api/summarize

Guarantees valid JSON responses on both success and error conditions.
"""

import os
from pathlib import Path
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException

# Always load .env from the directory where api.py resides
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

from summarizer import (
    summarize_text,
    count_words,
    count_chars,
    calculate_reduction,
    _get_model_id,
    MAX_TOTAL_WORDS,
    MIN_WORDS,
)

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)


# ---------------------------------------------------------------------------
# Ensure CORS headers are on every response
# ---------------------------------------------------------------------------

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
    return response


# ---------------------------------------------------------------------------
# Global error handlers — guarantee JSON response format across all errors
# ---------------------------------------------------------------------------

@app.errorhandler(400)
def handle_400(e):
    return jsonify({"error": "Bad request format. Please provide valid JSON."}), 400


@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "API route not found."}), 404


@app.errorhandler(405)
def handle_405(e):
    return jsonify({"error": "Method not allowed for this endpoint."}), 405


@app.errorhandler(500)
def handle_500(e):
    return jsonify({"error": "Internal server error. Please check server logs."}), 500


@app.errorhandler(Exception)
def handle_unhandled_exception(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), e.code
    msg = str(e)
    return jsonify({"error": f"Server processing error: {msg}"}), 500


# ---------------------------------------------------------------------------
# API Routes (Mapped to both root and /api prefixes)
# ---------------------------------------------------------------------------

@app.route("/", methods=["GET"])
def index():
    """Root info endpoint."""
    return jsonify({
        "status": "ok",
        "service": "AI Text Summarizer API",
        "model": _get_model_id(),
        "endpoints": {
            "health": ["/health", "/api/health"],
            "summarize": ["/summarize", "/api/summarize"],
        },
    }), 200


@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint for frontend status indicator."""
    return jsonify({
        "status": "ok",
        "service": "AI Text Summarizer API",
        "model": _get_model_id(),
    }), 200


@app.route("/summarize", methods=["POST", "OPTIONS"])
@app.route("/api/summarize", methods=["POST", "OPTIONS"])
def summarize():
    """
    Summarize input text using Gemini API.
    Consistently returns JSON with { "summary": ..., "stats": ... } or { "error": ... }.
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict) or "text" not in data:
        return jsonify({
            "error": "Request body must be valid JSON containing a 'text' field."
        }), 400

    input_text = data.get("text", "")
    if not isinstance(input_text, str):
        return jsonify({"error": "'text' field must be a string."}), 400

    try:
        summary = summarize_text(input_text)
    except ValueError as e:
        # Input validation issues (too short, too long, empty)
        return jsonify({"error": str(e)}), 422
    except EnvironmentError as e:
        # Missing API key
        return jsonify({"error": str(e)}), 503
    except RuntimeError as e:
        # API-level errors (auth, rate limits, model not found, network)
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        # Unanticipated exceptions
        return jsonify({"error": f"Summarization failed: {str(e)}"}), 500

    original_words = count_words(input_text)
    summary_words = count_words(summary)
    reduction = calculate_reduction(original_words, summary_words)

    return jsonify({
        "summary": summary,
        "stats": {
            "originalWords": original_words,
            "originalChars": count_chars(input_text),
            "summaryWords": summary_words,
            "summaryChars": count_chars(summary),
            "reductionPercent": reduction,
        },
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("API_PORT", 5000))
    print(f"Starting AI Text Summarizer API on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
