# VisionBridge

**A multimodal reading agent for blind and low-vision readers — in your browser.**

Make any text readable: resize, respace and recolor it; hear it read aloud with live word highlighting; scan a photo of a page to pull out its words; and simplify dense writing into plain lines. Reading, speech and simplifying run offline (speech uses your device voices); scanning and image description use your own free Gemini key. Nothing is uploaded.

## Pages
- **Home** (`index.html`) — landing with a live 3D lens/aperture hero.
- **Read** (`read.html`) — adjustable reader: font size, line/letter/word spacing, serif/sans/mono faces, reading ruler, high-contrast mode, read-aloud.
- **Listen** (`listen.html`) — text-to-speech with voice/speed/pitch and live word highlighting; play/pause/resume/stop.
- **Scan** (`scan.html`) — OCR a photo of a page or describe an image (Gemini), then read or hear the result.
- **Simplify** (`simplify.html`) — short-line plain layout, reading-time; AI plain-language rewrite with a key.
- **Settings** (`settings.html`) — theme, high-contrast, accent, Gemini key, export.

## Highlights (50+ features)
Text-to-speech, voice select, speed & pitch, play/pause/resume/stop, live word highlight, font size, line/letter/word spacing, dyslexia-friendly Atkinson Hyperlegible font, serif/sans/mono faces, reading ruler, high-contrast mode, paste/import, OCR scan, image description, read scan aloud, simplify, key points, reading time, offline + AI simplify, theme, accents, export, 3D lens hero (Three.js), custom cursor, ambient motion, scroll reveals, shortcuts, autosave, offline-first, responsive.

## Deploy (free)
Static site, no build. Upload the folder to GitHub → Netlify/Vercel. `index.html` is the entry. Local: `python3 -m http.server`.

## Tech
Vanilla HTML/CSS/JS + Three.js (bundled locally). Web Speech API for TTS. Gemini (user key) for OCR/description. Fonts: Atkinson Hyperlegible, Space Grotesk, IBM Plex Mono.
