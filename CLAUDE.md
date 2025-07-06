# CLAUDE.md - Your AI Development Assistant Guide (React/JavaScript/Supabase)

This document outlines best practices and guidelines for effectively collaborating with an AI development assistant (like Claude or Gemini) on React/JavaScript projects utilizing Supabase.

## 1. Introduction

This guide is designed to help you leverage AI assistance for common development tasks, ensuring efficient, safe, and idiomatic code changes within your project. The AI aims to understand your intent, adhere to project conventions, and provide actionable solutions.

## 2. Core Principles for AI Interaction

*   **Context is King:** Always provide sufficient context. This includes relevant file paths, code snippets, error messages, and a clear description of the problem or desired feature.
*   **Adhere to Conventions:** The AI will prioritize existing project conventions (formatting, naming, architectural patterns, libraries). If you want to deviate, explicitly state it.
*   **Safety First:** The AI will prioritize safe operations. For critical commands (e.g., file deletion, database modifications), it will explain the action before execution.
*   **Idiomatic Changes:** Changes will aim to be idiomatic to the existing codebase.
*   **Minimal Output:** The AI will strive for concise responses, focusing on actions and direct answers.
*   **Iterative Process:** Complex tasks may require multiple steps. Be prepared for an iterative dialogue.

## 3. React/JavaScript Specifics

When requesting changes or assistance with React/JavaScript code, consider the following:

*   **Component Structure:** Specify if changes should affect functional components, class components, hooks, or utility functions.
*   **State Management:** Clearly describe how state should be managed (e.g., `useState`, `useReducer`, `Context API`).
*   **Lifecycle:** Mention relevant lifecycle considerations (e.g., `useEffect` dependencies, cleanup functions).
*   **Event Handling:** Specify event types and desired behavior.
*   **Styling:** Indicate preferred styling methods (e.g., Tailwind CSS classes, CSS Modules, inline styles).
*   **Testing:** If tests exist, mention them. The AI can help write or modify tests if requested and if the project has a clear testing setup (e.g., Jest, React Testing Library).

## 4. Supabase Specifics

Supabase integration requires careful attention to detail:

*   **Client Usage:**
    *   `supabase`: For client-side operations (e.g., user authentication, public data access).
    *   `supabaseAdmin`: For server-side operations (e.g., API routes, Edge Functions) that require service role privileges (bypasses Row Level Security).
*   **Database Operations (CRUD):**
    *   **`select()`:** Specify columns (`'id, name'`), relationships (`'*, profiles(*)'`), and filters (`.eq()`, `.gt()`, `.in()`).
    *   **`insert()`:** Provide the object to insert.
    *   **`update()`:** Provide the object with changes and the `eq()` filter for the target row.
    *   **`delete()`:** Use with caution, always specify the `eq()` filter.
*   **Realtime:** If real-time updates are needed, specify the table and events to listen for.
*   **Authentication:**
    *   **User Management:** Refer to `auth.users` table for user data.
    *   **Row Level Security (RLS):** Be aware of RLS policies. If an operation fails due to RLS, consider using `supabaseAdmin` on the server-side or adjusting RLS policies.
*   **Storage:** For file uploads/downloads, specify the bucket and file paths.
*   **Edge Functions:** If interacting with Edge Functions, provide the function name and expected payload.
*   **Common Pitfalls:**
    *   **`camelCase` vs `snake_case`:** Supabase database columns are typically `snake_case` (e.g., `user_id`, `completed_at`), while JavaScript/TypeScript code often uses `camelCase` (e.g., `userId`, `completedAt`). Ensure your queries and data mapping match the database's naming convention. The AI will attempt to infer this, but explicit guidance helps.
    *   **UUIDs:** Supabase uses UUIDs for IDs. Ensure any IDs you provide in queries are valid UUID strings, not integers or arbitrary strings.
    *   **Error Handling:** Always include robust error handling for Supabase operations.

## 5. General Development Workflow with AI

1.  **Understand the Request:** Clearly state your goal.
    *   "Fix bug: Delete button not working on user profile page."
    *   "Add feature: Implement a search bar for articles."
    *   "Refactor: Convert this class component to a functional component with hooks."
2.  **Provide Context:**
    *   List affected files and their absolute paths.
    *   Include relevant code snippets.
    *   Paste full error messages and console logs.
    *   Describe the current behavior and the desired behavior.
3.  **AI's Plan:** The AI will propose a plan. Review it carefully.
    *   "I will examine `src/components/DeleteButton.tsx` and `src/api/deleteUser.ts`."
    *   "My plan is to: 1. Read the component. 2. Identify the API call. 3. Check the API route handler. 4. Add logging for debugging."
4.  **Iterate and Implement:** The AI will execute steps. Provide feedback and additional context as needed.
    *   "The delete button is still not working. Here are the new console logs..."
5.  **Verify:** After changes, verify the solution.
    *   Run tests (`npm test`, `yarn test`).
    *   Run linting/type-checking (`npm run lint`, `tsc`).
    *   Manually test the feature in the browser.
    *   Check network requests and console for errors.
6.  **Debugging Strategies:**
    *   **Console Logs:** Use `console.log()` extensively to inspect variable values, function calls, and execution flow.
    *   **Network Tab:** In your browser's developer tools, check the "Network" tab for API request/response details and status codes.
    *   **Supabase Logs:** Check your Supabase project's logs for backend errors.

## 6. Tips for Effective Prompting

*   **Be Specific:** Instead of "Fix the app," say "The 'Add Item' button on `/dashboard` page is not adding items to the list. The console shows 'TypeError: Cannot read property of undefined'."
*   **Provide Code:** Always paste relevant code directly into the chat.
*   **Specify File Paths:** Use absolute paths for clarity (e.g., `/src/components/MyComponent.tsx`).
*   **Desired Output:** If you want a specific code structure or a detailed explanation, ask for it.
*   **Break Down Complex Tasks:** For large features, break them into smaller, manageable steps.
*   **Confirm Understanding:** If unsure about the AI's plan, ask for clarification.

## 7. Troubleshooting Common Issues

*   **`relation "public.table_name" does not exist`:** The table name in your Supabase query does not match an existing table in your database. Double-check spelling and schema (`public.`).
*   **`invalid input syntax for type uuid: "1"`:** You are trying to insert a non-UUID string into a UUID column. Ensure IDs are valid UUIDs.
*   **`406 Not Acceptable`:** Often indicates a mismatch between expected and provided data types or column names (e.g., `camelCase` vs `snake_case`).
*   **Authentication Errors:** Check RLS policies, API keys (anon vs service role), and user authentication state.
*   **Environment Variables:** Ensure all necessary environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are correctly set in your `.env.local` file and are accessible in the relevant contexts (client-side vs. server-side).

## 8. Project-Specific Notes (Add Your Own)

*   [Add project-specific conventions, common libraries, or unique setup details here.]
*   [Example: "All new components must be functional components using React Hooks."]
*   [Example: "We use `react-query` for data fetching. All data mutations should use `useMutation`."]

---
**Remember:** The AI is a tool. Your clear communication and understanding of the project are crucial for successful collaboration.
