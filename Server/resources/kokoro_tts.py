from flask import Flask, request, send_file, Blueprint
from kokoro import KPipeline
import soundfile as sf
import io
import numpy as np

kokoro_tts = Blueprint('kokoro_tts', __name__)

# 1. Initialize the model pipeline ONCE at startup.
# 'a' stands for American English. 
print("Loading Kokoro model...")
pipeline = KPipeline(lang_code='a') 
print("Kokoro ready!")

@kokoro_tts.route('/generate-tts', methods=['POST'])
def generate_tts():
    data = request.json
    text = data.get('text', 'Hello, this is a test.')
    # af_heart is a great default American female voice
    voice = data.get('voice', 'af_heart') 

    try:
        # 2. Generate the audio chunks
        generator = pipeline(text, voice=voice, speed=1.0, split_pattern=r'\n+')
        
        audio_chunks = []
        for i, (graphemes, phonemes, audio) in enumerate(generator):
            audio_chunks.append(audio)
            
        # Combine chunks if it was a multi-sentence text
        full_audio = np.concatenate(audio_chunks) if audio_chunks else np.array([])

        # 3. Write to an in-memory WAV buffer
        buffer = io.BytesIO()
        sf.write(buffer, full_audio, 24000, format='wav')
        buffer.seek(0)

        # 4. Stream back to the frontend
        return send_file(
            buffer, 
            mimetype='audio/wav', 
            as_attachment=False
        )
        
    except Exception as e:
        return {"error": str(e)}, 500