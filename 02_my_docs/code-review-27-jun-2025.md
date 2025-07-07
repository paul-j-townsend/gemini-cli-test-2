# Code Review - 27th July 2025

This document outlines the findings and recommendations from a code review conducted on the Vet Sidekick project. The review focuses on improving code quality, maintainability, performance and accessibility.

## Overall Architecture & Best Practices

### 1. Configuration Management

**Observation:**
Hardcoded data such as navigation links, footer links, features and testimonials are currently scattered throughout the components (`Header.tsx`, `Footer.tsx`, `index.tsx`).

**Recommendation:**
Centralize all hardcoded data into dedicated configuration or data files (e.g., `src/config/navigation.ts`, `src/data/features.ts`). This will make the data easier to manage, update and potentially fetch from a CMS in the future.

**Example (`src/config/navigation.ts`):**
```typescript
export const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '/podcasts', label: 'Podcasts' },
  // ... other items
];
```

### 2. Component Reusability

**Observation:**
Inline SVGs are used extensively across multiple components. Additionally, the footer contains repetitive code for rendering link lists.

**Recommendation:**
- **SVG Components:** Extract all inline SVGs into their own reusable React components. This cleans up the JSX and makes the SVGs easier to manage and reuse.
- **Footer Link List Component:** Create a dedicated component to render the lists of links in the footer to avoid code duplication.

### 3. Performance Optimization

**Observation:**
- The 'Inter' font is loaded directly from Google Fonts in `src/styles/globals.css`.
- Images, especially from external sources like Unsplash, are not optimized.

**Recommendation:**
- **Font Optimization:** Self-host the 'Inter' font using `@next/font/google` for improved performance and to avoid a separate network request.
- **Image Optimization:** Use the Next.js `<Image>` component for all images (both local and remote). This will enable automatic image optimization, including resizing, optimization and serving in modern formats like WebP.

### 4. Styling

**Observation:**
- A custom line-clamp utility is implemented in `globals.css`.
- A hardcoded color is used in the audio player's progress bar style.

**Recommendation:**
- **Tailwind Plugin:** Replace the custom `.line-clamp-*` utilities with the official `@tailwindcss/line-clamp` plugin.
- **Theme Colors:** Use Tailwind's `theme()` function in `globals.css` to reference colors from your theme, ensuring consistency. For example, change `#fbbf24` to `theme('colors.yellow.400')`.

## Component-Specific Feedback

### `Header.tsx`

**Observation:**
Accessibility is hindered by styles that remove focus indicators, such as `onFocus={(e) => e.target.blur()}` and `!focus:ring-0`.

**Recommendation:**
Remove all styles that suppress or remove focus outlines. Ensure that all interactive elements have a clear and consistent visible focus state to meet accessibility standards. This is crucial for users who rely on keyboard navigation.

### `Footer.tsx`

**Observation:**
Several links in the footer are either placeholders (`href="#"`) or incorrect.

**Recommendation:**
Update all footer links to point to their correct destinations. This includes the Privacy Policy, Terms of Service and all social media links.

### `index.tsx`

**Observation:**
The "Trust Indicators" on the homepage are implemented using non-semantic `<div>` elements.

**Recommendation:**
Improve the accessibility of this section by using more semantic HTML. A `<ul>` with `<li>` elements would be more appropriate for this list of indicators. 