# project-yss

Standalone Vercel chat app for the Sysvelocity YSS AI coach.

## Files

- `index.html`: Streaming chat UI served at `/`
- `api/chat.js`: Streaming chat endpoint for Wix
- `lib/systemPrompt.js`: YSS system prompt
- `vercel.json`: Vercel function settings

## Environment variables

Set these in Vercel:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, optional, recommended `gpt-5.2`

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

## Next step

Deploy this version to Vercel, then open the Vercel app URL directly for the full streaming chat experience.
