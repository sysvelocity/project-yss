# yssai-online-course-modules

Standalone Vercel chat app for the Sysvelocity YSS AI Assist.

Current release: `v1.0.0`

## Files

- `index.html`: Streaming chat UI served at `/`
- `api/chat.js`: Streaming chat endpoint for Wix
- `lib/systemPrompt.js`: YSS system prompt
- `scripts/upload-knowledge.mjs`: One-time vector store upload script
- `vercel.json`: Vercel function settings

## Environment variables

Set these in Vercel:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, optional, recommended `gpt-5.2`
- `OPENAI_VECTOR_STORE_ID`, optional, enables knowledge-file retrieval

## Local development

```bash
npm install
npx vercel dev
```

The local endpoint will be:

```text
http://localhost:3000/api/chat
```

## Request format

POST JSON:

```json
{
  "message": "Bridge Line: ...",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

## Response format

Server-Sent Events stream:

- `delta`: incremental text chunk
- `done`: stream complete
- `error`: streaming error

## Usage

After deployment:

- `https://your-project.vercel.app/` serves the chat UI
- `https://your-project.vercel.app/api/chat` serves the streaming endpoint

If `OPENAI_VECTOR_STORE_ID` is set, the chat endpoint also uses OpenAI file search against that vector store.

## Upload the knowledge file

Run this once from the project folder:

```bash
OPENAI_API_KEY=your_key_here node scripts/upload-knowledge.mjs "/Users/fergalocarroll/Downloads/Draft+Your+Client+Issues+Addressed+Talking+Points.docx"
```

Copy the printed vector store ID into Vercel as:

```text
OPENAI_VECTOR_STORE_ID
```

## Next step

Deploy this version to Vercel, then open the Vercel app URL directly for the full streaming chat experience.
