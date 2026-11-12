# Transcrit les vocaux WhatsApp du client (hébreu) avec faster-whisper, modèle large-v3.
#   python scripts/transcrire-vocaux.py            → retours-client/_transcription.json
# Windows bloque la bibliothèque PyAV (décodage audio de faster-whisper) : on lit donc les fichiers .ogg (Opus)
# avec soundfile, on les ramène à 16 kHz, et on donne le signal directement au modèle.
import glob
import json
import os
import sys
import types

import numpy as np
import soundfile as sf

# faster_whisper importe « av » au chargement, mais n'en a pas besoin quand on lui passe un tableau numpy
sys.modules.setdefault("av", types.ModuleType("av"))
from faster_whisper import WhisperModel  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "retours-client")
MODEL = sys.argv[1] if len(sys.argv) > 1 else "large-v3"
# Vocabulaire du sujet, pour aider le modèle sur les noms propres et les termes du site
PROMPT = "הודעה קולית על האתר של קומי קומי הפקות: דף הבית, קטגוריות, כותרות, פונט, תמונות, בר מצווה, בת מצווה, ימי הולדת, פול מון, ליצנים, תקליטן, בר מתוקים, דוכני מזון, פורים, אירועים עסקיים, הצעת מחיר, וואטסאפ."


def load_16k(path):
    audio, sr = sf.read(path, dtype="float32", always_2d=True)
    audio = audio.mean(axis=1)
    if sr == 16000:
        return audio
    if sr % 16000:
        raise SystemExit(f"fréquence inattendue : {sr}")
    k = sr // 16000
    # filtre passe-bas (sinus cardinal fenêtré) avant de garder 1 échantillon sur k
    n = np.arange(-120, 121)
    h = np.sinc(n / k * 0.94) * np.hamming(len(n))
    h /= h.sum()
    return np.convolve(audio, h, mode="same")[::k].astype("float32")


model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
out = []
for f in sorted(glob.glob(os.path.join(ROOT, "*.ogg"))):
    audio = load_16k(f)
    segments, info = model.transcribe(audio, language="he", beam_size=5, initial_prompt=PROMPT, condition_on_previous_text=True, temperature=[0.0, 0.2, 0.4])
    segs = [{"start": round(s.start, 1), "end": round(s.end, 1), "text": s.text.strip()} for s in segments]
    out.append({"file": os.path.basename(f), "duration": round(len(audio) / 16000, 1), "segments": segs})
    print(os.path.basename(f), len(segs), "segments", flush=True)

dest = os.path.join(ROOT, f"_transcription-{MODEL}.json")
with open(dest, "w", encoding="utf-8") as fh:
    json.dump(out, fh, ensure_ascii=False, indent=1)
print("écrit :", dest)
