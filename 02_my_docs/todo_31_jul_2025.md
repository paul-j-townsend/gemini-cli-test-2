# TODO – 31st July 2025

> **Track all progress in:**  
> `TODO – 31st July 2025 – progress.md`

---

## 🛠️ General Tasks

- [ ] **Fix:** Pass offer price (not full price) to Stripe
- [ ] **Fix:** Purchase CPD Content panel is cut off
- [ ] **Feature:** Remove migration tab
- [ ] **Feature:** Move purchase button to a more prominent position
- [ ] **Feature:** Add learning outcomes to purchase panel
- [ ] **Feature:** Add scrollbar to purchase panel
- [ ] **Fix:** Edit series panel shows 'thumbnail' text twice and unnecessary 'Upload series thumbnail'
- [ ] **Feature:** Add overall user progress page (last login, total time logged in, CPD bought, CPD completed, etc.)
- [ ] **Fix:** Articles admin panel is broken
- [ ] **Fix:** Only one purchase modal should be visible at a time
- [ ] **Feature:** Make podcasts page the opening page; reorder header accordingly
- [ ] **Fix:** Fake stats on various pages
- [ ] **Feature:** Add 'How does it work' section
- [ ] **Feature:** Add 'My Stuff' page and new header item
- [ ] **Test:** Mobile responsiveness
- [ ] **Feature:** Make the series management items clickable

---

## 📁 My Stuff Page Features

- [ ] List of courses purchased
- [ ] Download CPD unit items (report, certificate if quiz complete, transcript)
- [ ] Show time spent
- [ ] Show CPD hours accumulated

---

## 🔄 Streamlining & Consolidation

- [ ] Consolidate audio/video player components  
      (`CompactEpisodeCard`, `MasonryEpisodeCard`, `PodcastPlayerItem`)  
      into a unified `AudioPlayer` component with variants
- [ ] Move duplicated utility functions  
      (`formatTime`, `getDefaultAudioUrl`, `getDefaultThumbnailUrl`)  
      to shared utilities
- [ ] Consolidate individual icon files and large icon library  
      (`BadgeIcons.tsx`) into a single icon system (Lucide React + custom icons)
- [ ] Merge debug endpoints into a single debug service
- [ ] Merge multiple upload endpoints into a single upload service with file type handling
- [ ] Break up large admin files  
      (`ContentManagement.tsx`, `ArticlesManagement.tsx`)  
      into smaller, focused components

---

## 🚀 Immediate Action Plan

1. [ ] **Phase 1:** Create shared utilities for audio functions
2. [ ] **Phase 2:** Build unified `AudioPlayer` component
3. [ ] **Phase 3:** Implement debug service
4. [ ] **Phase 4:** Consolidate icon system

---

## 📈 Expected Impact

- [ ] Reduce codebase size by ~30% (eliminate duplicates)
- [ ] Improve maintainability (single source of truth)
- [ ] Enable faster development (reusable components)
- [ ] Achieve better performance (smaller bundle size)
