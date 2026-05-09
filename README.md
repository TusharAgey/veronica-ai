<div align="center">
  <br/>
  <img src="" alt="Veronica AI" width="700" style="border-radius: 20px; box-shadow: 0 20px 60px rgba(99,102,241,0.3);" />
  <br/>
  <h1>Veronica AI</h1>
  <p><em>Your Personal Glassmorphism Virtual Assistant</em></p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Three.js-r183-000000?logo=three.js&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/Flask-3-000000?logo=flask&logoColor=white" alt="Flask" />
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </p>
  <p>
    <a href="https://tusharagey.github.io/veronica-ai">🌐 GitHub Pages</a>
  </p>
</div>

---

## Features

- **🤖 Multi-Bot AI Chat** — Chat with Code Bot (programming expert), Space Pirate (cheeky explorer), and Dizzy (friendly companion). Streaming LLM responses with Markdown rendering, syntax-highlighted code blocks, and one-click copy.
- **🎙️ Voice Hologram** — Full-screen Three.js 3D holographic assistant with real-time audio visualization. Voice-activated via Web Speech API, responds with Kokoro neural TTS.
- **🔐 Encrypted Password Manager** — Store passwords with AES-256-GCM client-side encryption. Browse, decrypt, and reveal on demand with a session key.
- **📓 Encrypted Journal** — Private diary entries encrypted with AES-256-GCM before leaving your device. Browse and decrypt past entries securely.
- **🎨 Glassmorphism UI** — Premium glass-surface design: `backdrop-blur` panels, MagicCard with mouse-tracking radial gradients, engraved glass inputs, and animated toast notifications.
- **🌌 Spatial Environment** — Cinematic crossfading backgrounds (Corporate Office, High-Tech Lab, Sci-Fi Corridor, Deep Galaxy) cycling every 60 seconds.
- **🌙 Dual Themes** — Switch between Studio (bright glass) and Obsidian (deep dark glass). Adjustable blur transparency.
- **🔊 Text-to-Speech** — Kokoro neural TTS engine running locally on the server for natural voice output.

---

## Quick Start

### Server

```bash
python3 -m venv venv
source venv/bin/activate
cd Server
pip install -r requirements.txt
python app.py
```

The Flask server starts on `http://0.0.0.0:8080` with SQLite auto-initialization, mDNS/Zeroconf network discovery, and Waitress production serving. Logs are written to `userlog.log`.

> Use `--no-broadcast` to skip mDNS registration.

### UI

```bash
cd magic-ui
npm install
npm run dev
```

Vite dev server starts on `http://localhost:5173` with HMR, auto SSL, and proxy routes (`/api` → Flask `:8080`, `/llama` → llama.cpp `:6792`).

### LLM Server

Run a [llama.cpp server](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) for AI chat:

```bash
./llama-server -m /path/to/model.gguf \
  --port 6792 \
  -t 4 \
  -c 1024 \
  --parallel 1 \
  --mmap \
  -np 1 \
  --flash-attn on \
  --cache-ram 0 \
  --reasoning off \
  --host 0.0.0.0
```

**Tested model:** `Phi-3.5-mini-instruct.IQ4_XS.gguf` (1024 context window)

### Quick Scripts

```bash
./start.sh        # Server + UI
```

---

## Tech Stack

| Frontend                                   | Backend                             | AI / ML                        |
| ------------------------------------------ | ----------------------------------- | ------------------------------ |
| React 19 · TypeScript 6 · Vite 8           | Flask 3 · Waitress · SQLAlchemy 1.4 | llama.cpp · Phi-3.5-mini       |
| Redux Toolkit · RTK Query · Framer Motion  | SQLite · Kokoro TTS · Zeroconf      | Web Speech API · Web Audio API |
| Three.js r183 · Tailwind CSS 3 · shadcn/ui | —                                   | —                              |
| Lucide React · React Markdown · Geist Font | —                                   | —                              |

---

## Contributing

1. Pick an open issue
2. Fork the repo and create a feature branch
3. Follow the existing code style (modular components, Tailwind CSS, Flask blueprints, Redux Toolkit slices)
4. Test your changes
5. Submit a pull request with a clear description

---

## License

MIT License — see [LICENSE](LICENSE).

---

<div align="center">
  <sub>Built by <a href="https://github.com/TusharAgey">Tushar Agey</a></sub>
</div>
