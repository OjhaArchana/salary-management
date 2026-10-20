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

export const SORT_FIELDS = [
  "id",
  "firstName",
  "lastName",
  "email",
  "salary",
  "hireDate",
  "country",
  "department",
  "jobTitle",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export interface ListQuery {
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