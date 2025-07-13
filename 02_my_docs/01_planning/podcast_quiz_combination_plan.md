i want to completley combine the podcast and quiz admin panels, i want to the quizes to be directly connected to a podcast. so no dropdown list selections anywhere for the quizes. i want the quiz details to be inputted on the same panel as the podcast details. ask my more questions o we get this right. i'm not sure if the db schema needs updating or maybe even tables combined so the podcast details are combined with the quiz details.

Feel free to completely clear out db tables

ask me any questions as you go along

Questions to Clarify Your Requirements:

  1. Primary Entity: Should the combined admin panel be primarily focused on "Podcast Episodes"
  (with quiz as embedded content) or "Content Pieces" (equal treatment of both)?
  2. Workflow: When creating new content, what's your preferred approach?
    - Start with podcast details, then add quiz questions inline?
    - Start with quiz questions, then add podcast metadata?
    - Both sections visible simultaneously?
  3. Database Schema: Do you want to:
    - Option A: Merge tables into a single vsk_content table with both podcast and quiz fields
    - Option B: Keep separate tables but always create/edit them together
    - Option C: Your preference?
  4. Navigation: In the admin interface, should this be:
    - A single "Content Management" section (replacing both podcast and quiz sections)?
    - Keep existing navigation but redirect to the unified interface?
  5. Quiz Questions: Should quiz questions be:
    - Inline editing within the main form?
    - A separate tab/section within the same interface?
    - Modal/drawer for editing questions?
  6. Data Migration: Are you okay with clearing existing data as you mentioned, or do you need to
  preserve some content?

  
1 - yes, focus on podcasts
2 - both sections visible at the same time, make the question/answers inputtable one at a time, maybe with some kind of numerical selectors
3 - a
4 - A single "Content Management" section (replacing both podcast and quiz sections)
5 - A separate tab/section within the same interface
6 - yes