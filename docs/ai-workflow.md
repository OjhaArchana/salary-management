# AI Workflow Log

Tools used: Claude (planning, code generation, review).

## How I use AI on this project
- Plan and make design decisions first, then ask AI to implement small pieces.
- Write tests first where practical and review all generated code before committing.

## Prompts and decisions
- Step 1: asked for a requirements doc covering goal, scope and out-of-scope items. Reviewed it and kept currency conversion, salary history and auth out of scope.
- Step 2: asked for a monorepo scaffold (Express + TypeScript + SQLite API, Next.js UI). Chose Next.js because the brief allows React or Next.js. Fixed a mis-named test file so Vitest would discover it.
- Step 3: asked Claude for a schema, generator and seed plan. Decided myself: integer salaries, indexes on country/department/job_title, seeded PRNG for deterministic data, single-transaction inserts.
- Step 4: built the employee API test-first with Claude, one behaviour per commit (validation, repository, list/search/filter/pagination, routes). Decided myself: zod at the edge, DB-enforced unique email mapped to 409, whitelisted sort fields, capped page size.
- Step 5: built the insights API test-first with Claude. Decided myself: break every row down by currency (no cross-currency averaging, consistent with the requirements doc), compute everything in one SQL query, whitelisted group columns.
- Step 6: built the UI with Claude (Next.js, shadcn/ui). Decided myself: server-driven table (search, filters, sort, pagination all in the API), debounced search with request cancellation, insights split by currency with no conversion, a small options endpoint for the filter lists.

## Enhancements
- Asked Claude for active nav state, icon buttons, styling and multi-select filters, one at a time. For the filters I decided: repeated query params instead of comma lists, backward-compatible single values, one shared IN-clause helper, native checkboxes, and tests written before the change.

## Debugging
- Multi-select returned no rows. The API tests passed and a direct API call worked, so I logged the query builder's input in the browser and found the views were joining filter arrays with commas before calling it. Fixed the types and removed the join.