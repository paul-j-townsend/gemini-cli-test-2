# Todo List

This is a list of tasks to be completed based on the code review from July 27th, 2025.

## Architectural Improvements
- [x] Centralize hardcoded data (navigation, footer links) into configuration files. (Features and testimonials still need to be centralized)
- [x] Create reusable components for inline SVGs.
- [x] Create a reusable component for the footer link lists.
- [x] Self-host the 'Inter' font using `@next/font/google`.
- [x] Replace `<img>` tags with Next.js `<Image>` component for image optimization.
- [x] Replace custom line-clamp utility with the official `@tailwindcss/line-clamp` plugin.
- [x] Use Tailwind theme colors in `globals.css` instead of hardcoded values.

## Component-Specific Tasks
- [x] **Header.tsx:** Remove styles that suppress focus outlines to improve accessibility.
- [x] **Footer.tsx:** Update all placeholder and incorrect links.
- [x] **index.tsx:** Use semantic HTML (`<ul>` and `<li>`) for the "Trust Indicators" section.
- [ ] **Badges.tsx:** add badges