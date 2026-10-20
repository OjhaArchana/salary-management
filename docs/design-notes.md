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

## Insights API
- GET /api/insights/salary?groupBy=country|department|jobTitle, with optional country/department/jobTitle filters.
- Rows are grouped by (group, currency), so currencies are never mixed. Cross-currency comparison is deliberately out of scope.
- Count/min/max/average use GROUP BY. Median uses SQLite window functions (ROW_NUMBER and COUNT per partition), since SQLite has no median.
- All aggregation happens in the database, so the API returns a handful of rows, not 10,000.
- Measured on the 10,000-row seed: 87.5867 ms for groupBy=jobTitle.
- Trade-off: if the dataset grew by orders of magnitude, I would add precomputed or cached aggregates.

## UI
- Two pages: / (employee table, add/edit dialog, delete) and /insights (salary stats by country, department or job title).
- All data operations are server-side; the browser never holds more than one page of employees.
- Search is debounced (300 ms) and stale requests are aborted, so slow responses cannot overwrite newer ones.
- Insights rows are per currency with an explicit on-screen note, matching the "no currency conversion" decision.
- GET /api/options feeds the filter dropdowns and the form's suggestions.
- Known gaps: no component or end-to-end tests (only the pure helpers are unit-tested); sorting by salary mixes currencies; no auth.

## Multi-select filters
- Filters are sent as repeated query params (?country=India&country=Germany) so values containing commas are safe. A single value still works.
- Validation normalises none/one/many values to string[] and caps each filter at 200 values.
- One shared helper builds `column IN (@col_0, @col_1)` with named parameters. Column names come from a literal union, never from user input.
- UI: checkbox popover per filter, with a search box for long lists, a selected count and a Clear action. Changing a filter resets to page 1.