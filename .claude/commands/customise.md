---
description: "Customise for the purchasing records"
---

# /customise

Read CLAUDE.md and the existing migration. Ask what field, rule or wording the owner wants. Explain the affected records. Write an additive migration in supabase/migrations with the next number; never rewrite an applied migration. Update the CLI, any affected views, document specifications and command recipe. Add a behaviour test for the changed rule. Run npm test against temporary data before npm run migrate applies it to the operator's authorised database. Never delete records or weaken approval checks without a reviewed replacement. Record the change in the README. Secrets stay in environment variables.
