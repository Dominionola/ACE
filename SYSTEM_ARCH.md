# ACE - System Architecture

> **IMPORTANT:** All database schemas are maintained in [`supabase/schema.sql`](./supabase/schema.sql). 
> When modifying database structure, update both this document AND the SQL file.

---

## 1. Data Schema (Supabase/Postgres)

### users (Supabase Auth)
- id (uuid, PK)
- email (string)
- full_name (string, from user_metadata)
- created_at (timestamp)

### decks
- id (uuid, PK)
- user_id (uuid, FK -> auth.users.id)
- title (string)
- description (text)
- is_public (boolean)
- tags (array of strings)
- created_at, updated_at (timestamp)

### cards
- id (uuid, PK)
- deck_id (uuid, FK -> decks.id)
- front_content (text)
- back_content (text)
- difficulty_rating (int, 1-5)
- last_reviewed, next_review (timestamp)
- created_at (timestamp)

### documents (PDF Storage)
- id (uuid, PK)
- deck_id (uuid, FK -> decks.id)
- file_name (text)
- file_url (text) — Supabase Storage URL
- extracted_text (text) — Raw content for AI context
- created_at (timestamp)

### quizzes (AI Generated Tests)
- id (uuid, PK)
- deck_id (uuid, FK -> decks.id)
- document_id (uuid, FK -> documents.id, nullable)
- questions (jsonb)
- score (int)
- total_questions (int)
- completed_at, created_at (timestamp)

### grade_history (Past Results)
- id (uuid, PK)
- user_id (uuid, FK -> auth.users.id)
- subject_name (text)
- grade_value (text)
- semester (text)
- feedback_notes (text) — AI generated advice
- created_at (timestamp)

---

## 2. Feature Logic

### Deck Creation
1. **Input:** User submits form with Title and Description.
2. **Action:** Call Server Action `createDeck`.
3. **Validation:** Use Zod schema `InsertDeckSchema`.
4. **DB:** Insert into `decks` table.
5. **UI:** Redirect to `/dashboard/decks/[id]`.

### PDF Study System (RAG Pipeline)
1. **Upload:** User uploads PDF via `FileUpload` component.
2. **Storage:** Save to Supabase Storage bucket `documents`.
3. **Process:** Extract text using `pdf-parse` library.
4. **DB:** Insert record into `documents` table.
5. **Chat:** When user asks question:
   - Fetch `extracted_text` from selected document.
   - Inject into Gemini system prompt as context.
   - Stream AI response to user.

### AI Study Companion (Chat)
1. **Provider:** Google Gemini 1.5 Flash (via `@ai-sdk/google`)
2. **Context:** Document's `extracted_text` field
3. **API Route:** `/api/chat`
4. **UI Hook:** `useChat` from `@ai-sdk/react`

### Quiz Generation (TODO)
1. **Trigger:** User clicks "Generate Quiz" on a Deck/Document.
2. **Process:** Send `extracted_text` to LLM.
3. **Prompt:** Generate 5 multiple choice questions as JSON.
4. **UI:** Render Quiz component, calculate score, save to `quizzes`.

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Vercel AI SDK + Google Gemini |

---

## 4. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

## 2. Technical Standards (Security, Speed & Quality)

### A. Code Quality & TypeScript (STRICT)
1.  **No `any` Policy:** NEVER use the `any` type. Use `unknown` with Zod validation if the type is uncertain. Always define interfaces for Props and DB rows.
2.  **Strict Mode:** Ensure `tsconfig.json` has `strict: true`. The code must pass without type assertions (`as string`).
3.  **Modularity:** Do not write files longer than 200 lines. Break UI into smaller components in `components/ui` or `features/[feature]/components`.

### B. Security & Data Protection
1.  **Authentication:**
    - NEVER accept `user_id` from the client in Server Actions.
    - ALWAYS fetch `user_id` from `auth.getUser()` inside the Action.
2.  **Authorization (RLS):**
    - **CRITICAL:** Every Supabase table MUST have Row Level Security (RLS) enabled.
    - Do not rely on JavaScript filtering. The database query itself must reject unauthorized access.
3.  **Validation:** All Server Action inputs must be validated with **Zod** schemas before reaching the database.

### C. Performance & Scalability
1.  **Database Indexing:** Ensure all Foreign Keys (`user_id`, `deck_id`) are indexed in Supabase/Postgres for fast joins.
2.  **Server Components:** Fetch data in Server Components (`page.tsx`). Pass only serialized JSON to Client Components.
3.  **Optimization:**
    - Use `next/image` for all media.
    - Use `React.cache` for request memoization when fetching the same data in multiple components.
    - Implement `Suspense` boundaries with Skeleton loaders for slow data fetches.

    ### D. AI Implementation (Vercel SDK)
1.  **Core Library:** Use `import { streamText, generateObject } from 'ai'`.
2.  **Streaming:** For Chat interfaces, ALWAYS use `streamText`.
    - Use the `useChat` hook on the client side for handling message history automatically.
3.  **Data Generation:** For Quizzes and Flashcards, ALWAYS use `generateObject`.
    - Pass the Zod schema to the `schema` property to ensure strict JSON output.
4.  **Embeddings:** Use `embed` from `ai` to generate vectors for Supabase storage.