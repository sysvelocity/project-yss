# yssai-online-course-modules

Standalone Vercel chat app for the Sysvelocity YSS AI Assist.

Current release: `v2.0.4`

This project is now structured as a shared multi-module app. Module 4 is the current live default, and future modules should be added as configuration entries rather than separate cloned apps.

## Files

- `index.html`: Streaming chat UI served at `/`
- `api/chat.js`: Streaming chat endpoint
- `api/module.js`: Public module metadata endpoint
- `lib/modules.js`: Shared module registry and module metadata
- `lib/prompts/module4.js`: Module 4 prompt definition
- `lib/systemPrompt.js`: Backward-compatible re-export of the Module 4 prompt
- `scripts/upload-knowledge.mjs`: One-time vector store upload script
- `vercel.json`: Vercel function settings

## Environment variables

Set these in Vercel:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, optional, recommended `gpt-5.2`
- `MODULE_TOKEN_SECRET`, required, must exactly match the course website signing secret

Knowledge/vector store configuration:

- `MODULE_4_VECTOR_STORE_ID`, recommended for Module 4
- `OPENAI_VECTOR_STORE_ID`, still supported as a fallback for Module 4

Future modules should follow the same pattern:

- `MODULE_1_VECTOR_STORE_ID`
- `MODULE_2_VECTOR_STORE_ID`
- and so on

## Local development

```bash
npm install
npx vercel dev
```

The local endpoints will be:

```text
http://localhost:3000/api/chat
http://localhost:3000/api/module
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
- `https://your-project.vercel.app/modules/module-4` serves Module 4 explicitly
- `https://your-project.vercel.app/api/chat` serves the streaming endpoint
- `https://your-project.vercel.app/api/module?module=module-4` returns Module 4 UI metadata

If `MODULE_4_VECTOR_STORE_ID` is set, the chat endpoint uses that knowledge store for Module 4. If not, it falls back to `OPENAI_VECTOR_STORE_ID` for backward compatibility.

## Module pattern

Each module should be defined in `lib/modules.js` with:

- slug
- module number / title / intro copy
- empty state text
- input placeholder
- prompt
- vector store env var name

That means new modules can be added without cloning the whole app. The shared UI, streaming backend, moderation, scope enforcement, token-based access control, and attachment flow all stay in one codebase.

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
