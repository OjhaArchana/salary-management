# Design Notes

## Data model
- Salary stored as integer whole currency units, with the currency in its own column (no floats, no conversion).
- Indexes on country, department and job_title, which are the filter and group-by columns.

## Seeding
- Seeded PRNG gives repeatable data. Inserts run in one transaction (fast, atomic).