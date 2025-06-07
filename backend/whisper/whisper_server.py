from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from faster_whisper import WhisperModel
import os
import tempfile
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Load Whisper model once on startup
model = WhisperModel("base")

@app.after_request
def set_response_headers(response):
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Content-Security-Policy"] = "frame-ancestors 'none';"
    return response

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return make_response(jsonify({"error": "No audio file provided"}), 400)

    audio_file = request.files["audio"]

    # Optional: Check audio file mime-type or extension
    # if audio_file.mimetype not in ["audio/wav", "audio/x-wav"]:
    #     return make_response(jsonify({"error": "Unsupported audio format"}), 415)

    temp_path = None
    try:
        # Save to a secure temp file (delete=False to control deletion)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            temp_path = tmp.name
            audio_file.save(temp_path)

        # Transcribe audio file
        segments, _ = model.transcribe(temp_path)
        text = "".join(seg.text for seg in segments).strip()

        return jsonify({"text": text})

    except Exception as e:
        print("🔥 Transcription Error:", repr(e))
        traceback.print_exc()
        return make_response(jsonify({"error": "Transcription failed"}), 500)

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
