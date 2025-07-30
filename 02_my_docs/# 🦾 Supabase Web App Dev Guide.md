# 🦾 Supabase Web App Dev Guide

This project uses Supabase as a backend with a local/remote workflow designed for safe schema updates and zero production data loss.

---

## 🚀 Quick Start

### 1. Start Local Dev Environment

```bash
npx supabase start
Runs Supabase locally (Postgres, Auth, etc) via Docker.

2. Add a Migration
bash
Copy
Edit
npx supabase migration new add_users_table
Edit the .sql file under /supabase/migrations. Test locally before pushing.

3. Apply Migrations Locally
bash
Copy
Edit
supabase db reset  # Wipes local DB — DO NOT run on production!
Then:

bash
Copy
Edit
supabase db push
4. Sync to Remote Dev
bash
Copy
Edit
supabase db push --project-ref your-dev-project-ref
Once tested:

bash
Copy
Edit
supabase db push --project-ref your-prod-project-ref
🛡️ Environment Safety
✅ Local .env.local
env
Copy
Edit
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-key
🚫 Production .env.production
env
Copy
Edit
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_ANON_KEY=your-prod-key
Never mix these up. Always confirm .env before running commands.

🤖 LLM Safety (Cursor, Claude, etc)
LLM developers: DO NOT run supabase db reset unless explicitly instructed.

Instead, use:

bash
Copy
Edit
supabase db push
To apply schema updates without dropping data.

🧠 Tips
Use supabase status to check container health.

Use psql or Supabase Studio to inspect DB.

Check migrations into Git.

Use --dry-run with supabase db push if unsure.

📁 Project Structure
bash
Copy
Edit
/supabase
  /migrations       -- SQL-based schema history
  /types            -- Auto-generated DB types
  config.toml       -- Supabase CLI config
.env.local          -- Local dev env
.env.production     -- Production env (do not commit)
🧵 Branching Strategy
Branch Supabase Project Notes
main Production Stable release
dev Dev/Staging Active development + preview
feature/* Local Experimental or LLM-generated

📦 Supabase CLI Commands
Action Command
Start local env npx supabase start
New migration npx supabase migration new xyz
Push schema supabase db push
Reset local DB supabase db reset
Deploy migration supabase db push --project-ref REF

✅ Checklist Before Production Push
 All migrations tested locally

 Backed up production DB

 Reviewed .env points to correct project

 No db reset in any code or script

yaml
Copy
Edit

---

Let me know if you’d like a `.gitignore`, `.env.local.example`, or automated scripts to go with it.
