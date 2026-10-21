export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  hireDate: string;
}

export type EmployeeInput = Omit<Employee, "id">;

export type SortField =
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "salary"
  | "hireDate"
  | "country"
  | "department"
  | "jobTitle";

export interface EmployeeListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  country?: string[];
  department?: string[];
  jobTitle?: string[];
  sortBy?: SortField;
  sortDir?: "asc" | "desc";
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type GroupBy = "country" | "department" | "jobTitle";

export interface SalaryStatsQuery {
  groupBy: GroupBy;
  country?: string[];
  department?: string[];
  jobTitle?: string[];
}

export interface SalaryStatsRow {
  group: string;
  currency: string;
  headcount: number;
  min: number;
  max: number;
  average: number;
  median: number;
}

export interface Options {
  countries: string[];
  departments: string[];
  jobTitles: string[];
}

export const EMPTY_OPTIONS: Options = { countries: [], departments: [], jobTitles: [] };

export interface FieldError {
  field: string;
  message: string;
}