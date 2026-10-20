# Salary Management System: Requirements

## 1. Goal

ACME's HR team manages salary data for 10,000 employees across multiple countries in Excel files, which is slow and error-prone. This project gives the HR Manager a web application to **maintain employee salary records** and to **answer questions about how the organization pays people**, without touching a spreadsheet.

**User persona:** the HR Manager of ACME (a single, trusted internal user).

**Success looks like:** the HR Manager can find any employee in seconds, add or correct a record in under a minute, and get salary insights for any country, department or job title without exporting data.

## 2. Scope and Features

**In scope**

1. **Employee records (CRUD):** create, view, edit and delete employees with: name, email, job title, department, country, salary, currency, hire date.
2. **Find employees fast:** search by name or email, filter by country, department and job title, sort, and server-side pagination, since 10,000 rows cannot be loaded at once.
3. **Salary insights:** minimum, maximum, average, median and headcount, grouped by country, department and job title. This directly answers "how does the org pay people?".
4. **Realistic seed data:** a script that generates 10,000 employees across multiple countries, with plausible salary ranges and currencies per country.
5. **Quality bar:** unit tests for core logic (validation, filtering, insight calculations), a deployed instance and a short demo video.

## 3. Deliberately Left Out (and why)

| Left out | Reasoning |
|---|---|
| **Currency conversion** | Exchange rates change daily and the right rate is a business decision. Each salary is stored in its local currency and insights are shown per country, so no figure is ever misleading. Cross-country comparison is a natural follow-up. |
| **Salary history / audit trail** | The core need is current pay. History adds a data model and UI that is a separate feature. Noted as the first extension. |
| **Authentication and roles** | There is exactly one persona. Auth would add effort without helping to judge the core problem. A production rollout would add SSO first. |
| **Bulk import/export of Excel** | Valuable for migration, but the seed script covers data for this exercise. Listed as a future feature. |
| **Payroll, bonuses, equity, taxes** | Different problem domain. This system tracks base salary only. |
| **Org chart / manager hierarchy** | Not needed to answer pay questions. |

## 4. Assumptions (to be confirmed with Incubyte)

- Salary is a single annual base amount per employee, in that employee's local currency.
- Only current salary is tracked, with no history.
- No login is required for the HR Manager.
- The employee fields listed above are sufficient.

## 5. Technical Approach (brief)

- **Backend:** Node.js with TypeScript and a REST API, with SQLite as the relational database (zero setup, fast enough for 10,000 rows, easy to swap later).
- **Frontend:** React/Next.js with a component library.
- **Performance:** indexes on country, department and job title; pagination and aggregations done in the database, not in the browser.
- **Testing:** fast, deterministic unit tests using an in-memory database, written test-first where practical.
- **Process:** small, incremental commits; design notes, trade-offs and AI prompts committed under `/docs`.
