---
trigger: always_on
---

# ⚡️ ACE PROJECT RULES & CONTEXT (V2)

## 0. UI & STYLING MANDATES
1. **Source of Truth:** ALWAYS read `style_guide.md` before writing any UI code.
2. **Strict Color/Shape Enforcement:** - NEVER use default Tailwind grays. Use `cream-` and `ace-` variables.
   - Backgrounds: `bg-cream-50`. Cards: `rounded-3xl`. Buttons: `rounded-full`.
3. **Tech Stack:** Tailwind v4 (CSS variables), Next.js 15, Supabase.

## 1. Data Schema (Supabase/Postgres)

### users (Existing)
- id, email, full_name, created_at

### decks (Existing)
- id, user_id, title, description, is_public

### documents (NEW: PDF Storage)
- id (uuid, PK)
- deck_id (uuid, FK -> decks.id)
- file_name (string)
- file_url (string) -- *Supabase Storage URL*
- extracted_text (text) -- *Raw content for AI context*
- embedding (vector) -- *For Semantic Search (pgvector)*

### quizzes (NEW: AI Generated Tests)
- id (uuid, PK)
- deck_id (uuid, FK)
- score (int)
- created_at (timestamp)

### grade_history (NEW: Past Results)
- id (uuid, PK)
- user_id (uuid, FK)
- subject_name (string)
- grade_value (string or float) -- *e.g., "A" or "85"*
- semester (string)
- feedback_notes (text) -- *AI generated advice*

## 2. Feature Logic

### PDF Study System (RAG Pipeline)
1. **Upload:** User uploads PDF. Save to Supabase Storage bucket `documents`.
2. **Process:** - Trigger Server Action `processDocument`.
   - Extract text using `pdf-parse`.
   - (Optional) Generate embeddings via OpenAI/Supabase.
3. **Chat:** When user asks question:
   - Search `extracted_text` for keywords.
   - Inject relevant text into System Prompt.
   - Prompt: "Answer the user's question based ONLY on the provided document context."

### Quiz Generation
1. **Trigger:** User clicks "Generate Quiz" on a Deck or Document.
2. **Process:** Send `extracted_text` to LLM.
3. **Prompt:** "Generate 5 multiple choice questions based on this text. Return JSON format."
4. **UI:** Render Quiz component. On submit, calculate score and save to `quizzes`.

### Grade Analysis & Strategy
1. **Input:** User logs past grades (Manual form or CSV upload).
2. **Analysis:** Server Action `analyzePerformance` sends history to LLM.
3. **Prompt:** "Analyze this student's grade trend. Identify weak subjects and suggest a study schedule."
4. **Output:** Save response to `feedback_notes` and display as a "Strategy Report."

## 3. Technical Constraints
- **Files:** Use `react-dropzone` for uploads.
- **AI:** Use `ai` SDK (Vercel AI SDK) for streaming responses.
- **Security:** Ensure RLS (Row Level Security) prevents users from seeing others' grades/documents.

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