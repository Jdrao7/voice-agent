# 🎙️ Nova - AI Voice Assistant

A turn-based AI voice agent built with Next.js that allows you to speak to an AI and hear intelligent responses. Powered by Groq's free API for speech-to-text, LLM reasoning, and text-to-speech.

![Nova Voice Agent](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Groq](https://img.shields.io/badge/Groq-Free%20API-orange?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## ✨ Features

- **🎤 Voice Input** - Push-to-talk microphone recording (2-10 seconds)
- **📝 Speech-to-Text** - Groq Whisper transcription
- **🧠 AI Agent** - LLaMA 3.3 70B for intelligent responses
- **🔊 Text-to-Speech** - PlayAI natural voice synthesis
- **💬 Conversation History** - Maintains context across turns
- **🎨 Modern UI** - Dark glassmorphism design with smooth animations

## 🚀 Quick Start

### 1. Get a Groq API Key (Free!)

1. Visit [console.groq.com](https://console.groq.com)
2. Create an account and generate an API key
3. It's completely free with generous rate limits!

### 2. Set Up Environment

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=gsk_your_api_key_here
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

```
Browser
  ↓ (audio blob)
Next.js API (/api/voice)
  ↓
Groq Whisper (STT)
  ↓
Groq LLaMA 3.3 70B (LLM)
  ↓
Groq PlayAI TTS
  ↓
Audio Response
  ↓
Browser Playback
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/voice/route.ts    # Voice pipeline API
│   ├── globals.css           # Modern dark theme
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main UI
├── components/
│   ├── VoiceRecorder.tsx     # Push-to-talk component
│   ├── AudioPlayer.tsx       # Audio playback
│   └── ConversationDisplay.tsx
├── hooks/
│   └── useVoiceRecorder.ts   # MediaRecorder hook
└── lib/
    ├── stt.ts                # Speech-to-text service
    ├── llm.ts                # LLM agent service
    ├── tts.ts                # Text-to-speech service
    └── types.ts              # Shared types & schemas
```

## 🎯 Technical Constraints (By Design)

| Constraint | Reason |
|------------|--------|
| ❌ No WebRTC | Serverless compatibility |
| ❌ No streaming | Simplicity & cost control |
| ❌ No telephony | Personal project scope |
| ✅ Serverless-safe | Reliable on Vercel |
| ✅ Turn-based | Predictable UX |

## 📊 Groq Free Tier Limits

| Service | Model | Requests/Min | Requests/Day |
|---------|-------|--------------|--------------|
| STT | whisper-large-v3-turbo | 20 | 2,000 |
| TTS | playai-tts | 10 | 100 |
| LLM | llama-3.3-70b-versatile | 30 | 14,400 |

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add `GROQ_API_KEY` environment variable
4. Deploy!

## 📝 One-Line Resume Description

> Built a serverless AI voice assistant using Next.js, integrating speech-to-text, LLM reasoning, and text-to-speech in a production-safe, deployable architecture using Groq's free API.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI Services**: Groq (Whisper, LLaMA, PlayAI)
- **Validation**: Zod
- **Icons**: Lucide React

## 📄 License

MIT
