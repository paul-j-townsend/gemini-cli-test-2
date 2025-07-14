# Latest Episodes Panel - Issues & Fixes

## 🚨 Critical Issues

### Data Layer Issues

- [ ] **Update to Unified Content API**: PodcastService still uses old `vsk_podcast_episodes` table instead of new unified `vsk_content` table
- [ ] **Fix Data Structure Mismatch**: Components expect `quiz_id` but unified content uses `content_id`
- [ ] **Remove Mock Data Fallbacks**: Mockb podcasts are shown when real data fails, masking actual data issues
- [ ] **Fix Service Client Methods**: All `podcastService` methods need to use unified content API endpoints

### Database Integration Issues  

- [ ] **Inconsistent Data Sources**: Some components fetch from old tables, others from new unified tables
- [ ] **Missing Error Handling**: No graceful degradation when unified content API fails
- [ ] **Outdated Query Fragments**: `PODCAST_QUIZ_QUERY_FRAGMENT` references old table structure
- [ ] **Legacy Column References**: Code still references old column names that don't exist in unified schema

## ⚠️ Major Issues

### Performance & Loading Issues

- [ ] **Inefficient Audio Loading**: Audio attempts to load even when no source is available
- [ ] **Multiple Retry Attempts**: Excessive retry logic creates console spam and poor UX
- [ ] **No Progressive Loading**: All episodes load at once, causing performance issues
- [ ] **Missing Lazy Loading**: Images and audio load immediately regardless of viewport visibility

### User Experience Issues

- [ ] **Poor Error Messages**: Generic error messages don't help users understand what's wrong
- [ ] **Broken Audio Controls**: Play/pause buttons show even when no audio is available
- [ ] **Inconsistent Loading States**: Loading skeletons don't match actual content layout
- [ ] **No Content Indicators**: Users can't tell which episodes have audio/quizzes available

### Navigation & Routing Issues

- [ ] **Missing Episode Detail Pages**: Clicking episodes doesn't navigate to dedicated episode pages
- [ ] **No Deep Linking**: Can't share direct links to specific episodes
- [ ] **Poor Quiz Integration**: Quiz modal overlays instead of dedicated quiz pages
- [ ] **No Progress Persistence**: Audio progress is lost when navigating away

## 🔧 Enhancement Issues

### Mobile Experience

- [ ] **Poor Touch Controls**: Audio controls too small for mobile interaction
- [ ] **Responsive Layout Issues**: 2-column grid breaks on small screens
- [ ] **Missing Swipe Gestures**: No intuitive mobile navigation patterns
- [ ] **Accessibility Problems**: Missing ARIA labels and keyboard navigation

### Visual Design Issues

- [ ] **Inconsistent Card Heights**: Episode cards have varying heights causing layout issues
- [ ] **Poor Image Handling**: Missing image optimization and fallback states
- [ ] **Weak Visual Hierarchy**: Important information (completion status, audio availability) not prominent
- [ ] **No Visual Feedback**: Hover and active states missing or inconsistent

### Content Discovery Issues

- [ ] **No Filtering Options**: Users can't filter by category, completion status, or content type
- [ ] **No Search Functionality**: No way to search through episodes
- [ ] **Missing Sorting Options**: Can't sort by date, duration, or completion status
- [ ] **No Pagination**: All episodes load at once with no pagination for performance

### Quiz Integration Issues

- [ ] **Modal Quiz Experience**: Quiz opens in modal instead of dedicated page
- [ ] **No Quiz Preview**: Users can't preview quiz difficulty or question count
- [ ] **Missing Progress Indicators**: No indication of quiz completion progress
- [ ] **Poor Completion Feedback**: Minimal feedback when quiz is completed

## 🎯 Implementation Plan

### Phase 1: Critical Data Migration (High Priority)

1. [ ] Update `podcastService` to use unified content API (`/api/admin/content`)
2. [ ] Replace all `vsk_podcast_episodes` queries with `vsk_content` queries  
3. [ ] Update data mapping to use `content_id` instead of `quiz_id`
4. [ ] Remove mock data fallbacks and implement proper error handling

### Phase 2: Core Functionality Fixes (High Priority)

1. [ ] Implement proper loading states without content jumping
2. [ ] Add conditional audio controls (only show when audio exists)
3. [ ] Fix responsive layout for mobile devices
4. [ ] Add proper error boundaries and user-friendly error messages

### Phase 3: Enhanced User Experience (Medium Priority)

1. [ ] Implement episode detail pages with dedicated URLs
2. [ ] Add progressive loading and lazy loading for images
3. [ ] Implement proper quiz page routing (not modal)
4. [ ] Add filtering and sorting options

### Phase 4: Polish & Optimization (Lower Priority)

1. [ ] Implement audio progress persistence
2. [ ] Add advanced search functionality
3. [ ] Implement swipe gestures for mobile
4. [ ] Add comprehensive accessibility features

## 🔍 Code Quality Issues

### Component Architecture

- [ ] **Tight Coupling**: PodcastPlayer and PodcastPlayerItem are tightly coupled
- [ ] **Props Drilling**: Props passed down multiple levels unnecessarily
- [ ] **Missing TypeScript**: Some interfaces incomplete or inconsistent
- [ ] **No Error Boundaries**: Components crash entirely on errors

### State Management

- [ ] **Local State Overuse**: Audio state should be in context for cross-component access
- [ ] **Missing Optimistic Updates**: UI doesn't update optimistically
- [ ] **No Caching Strategy**: Same data fetched multiple times
- [ ] **Inconsistent Loading States**: Different components handle loading differently

### Performance Issues

- [ ] **Unnecessary Re-renders**: Components re-render when dependencies haven't changed
- [ ] **Missing Memoization**: Expensive calculations run on every render
- [ ] **Heavy Bundle Size**: Importing entire icon libraries instead of specific icons
- [ ] **No Code Splitting**: All components loaded upfront

## 📱 Accessibility Issues

- [ ] **Missing ARIA Labels**: Screen readers can't navigate audio controls effectively
- [ ] **No Keyboard Navigation**: Tab navigation doesn't work for audio controls
- [ ] **Poor Color Contrast**: Some text doesn't meet WCAG guidelines
- [ ] **Missing Focus Indicators**: Users can't see which element has focus
- [ ] **No Alternative Text**: Images missing descriptive alt text

## 🧪 Testing Issues

- [ ] **No Unit Tests**: Components have no automated tests
- [ ] **No Integration Tests**: No tests for data fetching and state management
- [ ] **No Accessibility Tests**: No automated accessibility checking
- [ ] **No Performance Tests**: No benchmarks for loading times or responsiveness
