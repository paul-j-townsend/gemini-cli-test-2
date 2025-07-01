# Todo List

This is a list of tasks to be completed based on the code review from July 27th, 2025.

**Important: Make sure to use British English throughout all content, components, and documentation.**

## Architectural Improvements
- [x] Centralise hardcoded data (navigation, footer links) into configuration files. (Features and testimonials still need to be centralised)
- [x] Create reusable components for inline SVGs.
- [x] Create a reusable component for the footer link lists.
- [x] Self-host the 'Inter' font using `@next/font/google`.
- [x] Replace `<img>` tags with Next.js `<Image>` component for image optimisation.
- [x] Replace custom line-clamp utility with the official `@tailwindcss/line-clamp` plugin.
- [x] Use Tailwind theme colours in `globals.css` instead of hardcoded values.

## Component-Specific Tasks
- [x] **Header.tsx:** Remove styles that suppress focus outlines to improve accessibility.
- [x] **Footer.tsx:** Update all placeholder and incorrect links.
- [x] **index.tsx:** Use semantic HTML (`<ul>` and `<li>`) for the "Trust Indicators" section.
- [ ] **Badges.tsx:** add badges

## Podcast Admin System
- [x] **Database:** Renamed `podcast_episodes` table to `vsk_podcast_episodes`
- [x] **Episode Management:** Built episode creation, editing, and deletion functionality
- [x] **Audio Upload:** Implemented tabbed audio input (Upload File vs Select Existing)
- [x] **Storage Integration:** Connected to Supabase storage with organized bucket structure
- [x] **File Management:** Added clean filename generation and dropdown population
- [x] **Form Validation:** Default published date to current date/time
- [x] **Storage Policies:** Configured proper RLS policies for audio bucket
- [x] **Upload Functionality:** Working file upload (note: use non-synced local files)

### Known Issues & Workarounds
- ⚠️ **File Upload:** Fails with Google Drive synced files - use local non-synced folders
- ✅ **Select Existing:** Works perfectly with organized bucket structure

### Future Enhancements
- [ ] Add upload progress indicator
- [ ] Implement drag-and-drop file upload
- [ ] Add episode preview/playbook feature
- [ ] Create episode search and filtering
- [ ] Add episode thumbnails/images
- [] combine podcast admin and audio admin into one admin page