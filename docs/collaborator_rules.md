# VendorBridge - Collaborator Coordination Rules

To prevent merge conflicts and maintain a clean git history, please follow these guidelines:

## Core Division of Labor
*   **Agent Scope:** Strictly **Frontend Development** (`frontend/src/` components, routes, state hooks, contexts, views). Do not modify files in the `backend/` directory.
*   **Collaborators Scope:** Strictly **Backend Development** (`backend/` API routes, database schemas, controllers, middlewares).

## Git & Version Control Rules
1. **Frequent Pulls:** Run `git pull origin main --rebase` before starting any task to fetch remote updates from other collaborators.
2. **Auto-Push:** Push every commit immediately after making modifications to keep remote branches in sync.
3. **Target Directories:** Make sure all frontend updates use inline Tailwind classes. Do not create separate `.css` modules.
