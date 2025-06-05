# backend/whisper/whisper_server.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import os

app = Flask(__name__)
CORS(app)  # ← This enables CORS for all routes (development only)

# Load Whisper model once
model = WhisperModel("base")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    temp_path = "temp.wav"
    audio_file.save(temp_path)

    # Run transcription
    segments, _ = model.transcribe(temp_path)
    text = "".join(seg.text for seg in segments)

    # Clean up
    os.remove(temp_path)
    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
