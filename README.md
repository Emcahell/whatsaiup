# Whatsaiup

A multi-provider AI chat client built with Next.js. Chat with models from OpenAI, Google (Gemini), Anthropic (Claude), DeepSeek, and Groq through a unified interface.

## Features

- **Multi-provider support**: Add AI models from OpenAI, Google, Anthropic, and DeepSeek
- **Chat management**: Organize conversations per model with read/unread tracking
- **Search**: Filter through your AI contacts and conversations
- **Dark/Light mode**: Theme toggle with a Material You-inspired design system
- **Internationalization**: Full English and Spanish support
- **Image input**: Attach images to messages (supported by OpenAI, Google, and Anthropic)
- **Streaming responses**: Real-time token-by-token streaming for all providers
- **Local storage**: All data (API keys, conversations, messages) stored locally in IndexedDB

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. **Add an AI model**: Go to the contacts screen and add a new model with your API key
2. **Start a conversation**: Select a contact and send a message
3. **Attach images**: Click the image icon in the input bar to attach images (supported providers only)
4. **Search**: Use the search icon in the header to filter contacts and conversations
5. **Switch language**: Open the menu to toggle between English and Spanish

## Architecture

- `app/` — Next.js App Router pages
- `components/` — React components
- `context/` — Theme and language context providers
- `lib/ai/` — AI provider clients (OpenAI, Google, Anthropic, DeepSeek)
- `lib/db/` — IndexedDB operations (models, conversations, messages)
- `lib/` — Shared types, time utilities, and provider configurations

## Tech Stack

- [Next.js](https://nextjs.org) — React framework
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) — Client-side storage
- [Material Symbols](https://fonts.google.com/icons) — Icons

## Contributing

Contributions are welcome! Whether it's improving existing features, fixing a bug, adding new functionality, or integrating a new AI provider, feel free to open an issue or submit a pull request.
