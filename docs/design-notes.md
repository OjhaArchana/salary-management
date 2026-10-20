# Design Notes

## Data model
- Salary stored as integer whole currency units, with the currency in its own column (no floats, no conversion).
- Indexes on country, department and job_title, which are the filter and group-by columns.

## Seeding
- Seeded PRNG gives repeatable data. Inserts run in one transaction (fast, atomic).

## Employee API
- Layers: routes (HTTP) -> validation (zod) -> repository/list (SQL). Each is unit-tested on its own.
- Endpoints: GET/POST /api/employees, GET/PATCH/DELETE /api/employees/:id. PATCH for partial updates.
- Pagination is server-side (LIMIT/OFFSET, max 100 per page, id tie-break for stable order).
- Sort fields and filter columns are whitelisted, so no user input is interpolated into SQL.
- Search uses LIKE '%term%' with escaped wildcards. Fine at 10k rows; full-text search would be the upgrade at larger scale.
- OFFSET pagination slows on very deep pages; keyset pagination is the upgrade if that ever matters.