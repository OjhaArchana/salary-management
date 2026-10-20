import { COUNTRIES, DEPARTMENTS, FIRST_NAMES, LAST_NAMES } from "./data";
import type { NewEmployee } from "./insert";
import { mulberry32 } from "./random";

function pick<T>(items: readonly T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

const HIRE_START = Date.UTC(2015, 0, 1);
const HIRE_END = Date.UTC(2026, 8, 30);

export function generateEmployees(count: number, seed = 42): NewEmployee[] {
  const rand = mulberry32(seed);
  const employees: NewEmployee[] = [];

  for (let i = 1; i <= count; i++) {
    const firstName = pick(FIRST_NAMES, rand);
    const lastName = pick(LAST_NAMES, rand);
    const department = pick(DEPARTMENTS, rand);
    const role = pick(department.roles, rand);
    const country = pick(COUNTRIES, rand);

    const baseline = role.min + rand() * (role.max - role.min);
    const salary = Math.round((baseline * country.factor) / 1000) * 1000;
    const hireDate = new Date(HIRE_START + rand() * (HIRE_END - HIRE_START)).toISOString().slice(0, 10);

    employees.push({
      firstName,
      lastName,
      // The running number keeps emails unique even when names repeat.
      email: `${firstName}.${lastName}.${i}@acme.com`.toLowerCase(),
      jobTitle: role.title,
      department: department.name,
      country: country.name,
      currency: country.currency,
      salary,
      hireDate,
    });
  }
  return employees;
}