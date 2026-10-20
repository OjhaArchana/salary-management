# AI Workflow Log

Tools used: Claude (planning, code generation, review).

## How I use AI on this project
- Plan and make design decisions first, then ask AI to implement small pieces.
- Write tests first where practical and review all generated code before committing.

## Prompts and decisions
- Step 1: asked for a requirements doc covering goal, scope and out-of-scope items. Reviewed it and kept currency conversion, salary history and auth out of scope.
- Step 2: asked for a monorepo scaffold (Express + TypeScript + SQLite API, Next.js UI). Chose Next.js because the brief allows React or Next.js. Fixed a mis-named test file so Vitest would discover it.