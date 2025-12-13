## 1. Data Schema (Supabase/Postgres)

### users
- id (uuid, PK)
- email (string)
- full_name (string)
- created_at (timestamp)

### decks
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- title (string)
- description (text)
- is_public (boolean)
- tags (array of strings)

### cards
- id (uuid, PK)
- deck_id (uuid, FK -> decks.id)
- front_content (text/markdown)
- back_content (text/markdown)
- difficulty_rating (int, 1-5)
- last_reviewed (timestamp)
- next_review (timestamp)

## 2. Feature Logic

### Deck Creation
1. **Input:** User submits a form with Title and Description.
2. **Action:** Call Server Action `createDeck`.
3. **Validation:** Use Zod schema `InsertDeckSchema`.
4. **DB:** Insert into `decks` table.
5. **UI:** Redirect to `/decks/[id]` upon success.

### AI Study Companion (Chat)
1. **Context:** User is on a specific Deck page.
2. **Input:** User asks a question about the cards.
3. **Process:**
   - Fetch all cards in current deck.
   - Send card content + user query to OpenAI/Anthropic API.
   - System Prompt: "You are a helpful tutor explaining these specific flashcards..."
4. **Output:** Stream text response back to UI.