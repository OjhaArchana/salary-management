import { buildQuery } from "./query";
import type {
  Employee,
  EmployeeInput,
  EmployeeListQuery,
  FieldError,
  GroupBy,
  Options,
  Page,
  SalaryStatsQuery,
  SalaryStatsRow,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldError[];

  constructor(message: string, status: number, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Could not reach the server", 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? "Request failed", res.status, body.errors ?? []);
  return body as T;
}

export const listEmployees = (query: EmployeeListQuery, signal?: AbortSignal) =>
  request<Page<Employee>>(`/api/employees${buildQuery(query)}`, { signal });

export const createEmployee = (input: EmployeeInput) =>
  request<Employee>("/api/employees", { method: "POST", body: JSON.stringify(input) });

export const updateEmployee = (id: number, input: Partial<EmployeeInput>) =>
  request<Employee>(`/api/employees/${id}`, { method: "PATCH", body: JSON.stringify(input) });

export const deleteEmployee = (id: number) =>
  request<void>(`/api/employees/${id}`, { method: "DELETE" });

export const getOptions = () => request<Options>("/api/options");

export const getSalaryStats = (query: SalaryStatsQuery, signal?: AbortSignal) =>
  request<{ groupBy: GroupBy; rows: SalaryStatsRow[] }>(
    `/api/insights/salary${buildQuery(query)}`,
    { signal }
  );