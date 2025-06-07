from flask import Flask, request, send_file, jsonify
from TTS.api import TTS
from io import BytesIO
import soundfile as sf
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load Coqui TTS model (once)
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False, gpu=False)

@app.route("/tts", methods=["POST"])
def text_to_speech():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing text field"}), 400

        text = data["text"].strip()
        print("🔊 Generating TTS for:", text)

        # Generate waveform
        wav = tts.tts(text)

        # Save to in-memory buffer
        buffer = BytesIO()
        sf.write(buffer, wav, samplerate=22050, format='WAV')
        buffer.seek(0)

        return send_file(buffer, mimetype="audio/wav")
    
    except Exception as e:
        print("🔥 TTS Error:", e)
        return jsonify({"error": "TTS failed"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
