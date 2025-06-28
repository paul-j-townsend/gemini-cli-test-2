# Todo List

This is a list of tasks to be completed based on the code review from July 27th, 2025.

## Architectural Improvements
- [ ] Centralize hardcoded data (navigation, footer links, features, testimonials) into configuration files.
- [ ] Create reusable components for inline SVGs.
- [ ] Create a reusable component for the footer link lists.
- [ ] Self-host the 'Inter' font using `@next/font/google`.
- [ ] Replace `<img>` tags with Next.js `<Image>` component for image optimization.
- [ ] Replace custom line-clamp utility with the official `@tailwindcss/line-clamp` plugin.
- [ ] Use Tailwind theme colors in `globals.css` instead of hardcoded values.

## Component-Specific Tasks
- [ ] **Header.tsx:** Remove styles that suppress focus outlines to improve accessibility.
- [ ] **Footer.tsx:** Update all placeholder and incorrect links.
- [ ] **index.tsx:** Use semantic HTML (`<ul>` and `<li>`) for the "Trust Indicators" section.
- [ ] **Badges.tsx:** add badges 