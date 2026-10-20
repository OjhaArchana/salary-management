import type { EmployeeInput } from "./types";

export function makeEmployee(overrides: Partial<EmployeeInput> = {}): EmployeeInput {
  return {
    firstName: "Asha",
    lastName: "Rao",
    email: "asha.rao@acme.com",
    jobTitle: "Software Engineer",
    department: "Engineering",
    country: "India",
    currency: "INR",
    salary: 2000000,
    hireDate: "2022-04-01",
    ...overrides,
  };
}