"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteEmployee, getOptions, listEmployees } from "@/lib/api";
import { avatarColor, departmentBadge, initials } from "@/lib/avatar";
import { formatSalary } from "@/lib/format";
import { EMPTY_OPTIONS, type Employee, type Options, type Page, type SortField } from "@/lib/types";
import { EmployeeDialog } from "./employee-dialog";
import { MultiSelectFilter } from "./multiSelectFilter";

const PAGE_SIZE = 25;

const COLUMNS: { label: string; field: SortField }[] = [
  { label: "Name", field: "lastName" },
  { label: "Job title", field: "jobTitle" },
  { label: "Department", field: "department" },
  { label: "Country", field: "country" },
  { label: "Salary", field: "salary" },
  { label: "Hired", field: "hireDate" },
];

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

export function EmployeesView() {
  const [options, setOptions] = useState<Options>(EMPTY_OPTIONS);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string[]>([]);
  const [department, setDepartment] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Employee | "new" | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    getOptions()
      .then(setOptions)
      .catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    listEmployees(
      { page, pageSize: PAGE_SIZE, search, country, department, jobTitle, sortBy, sortDir },
      controller.signal,
    )
      .then((result) => {
        if (result.items.length === 0 && result.total > 0 && page > 1) {
          setPage(result.totalPages);
          return;
        }
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(errorMessage(err));
        setLoading(false);
      });
    return () => controller.abort();
  }, [page, search, country, department, jobTitle, sortBy, sortDir, refreshKey]);

  function changeFilter(setter: (value: string[]) => void) {
    return (value: string[]) => {
      setter(value);
      setPage(1);
    };
  }

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  async function handleDelete(employee: Employee) {
    if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`)) return;
    try {
      await deleteEmployee(employee.id);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter and manage salary records across every country.
          </p>
        </div>
        <Button className="shadow-sm" onClick={() => setEditing("new")}>
          <Plus className="mr-1 h-4 w-4" />
          Add employee
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-64 pl-9"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <MultiSelectFilter
          label="Country"
          selected={country}
          options={options.countries}
          onChange={changeFilter(setCountry)}
        />
        <MultiSelectFilter
          label="Department"
          selected={department}
          options={options.departments}
          onChange={changeFilter(setDepartment)}
        />
        <MultiSelectFilter
          label="Job title"
          selected={jobTitle}
          options={options.jobTitles}
          onChange={changeFilter(setJobTitle)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div
        className={`overflow-hidden rounded-xl border bg-card shadow-sm transition-opacity ${
          loading ? "opacity-60" : ""
        }`}
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {COLUMNS.map(({ label, field }) => (
                <TableHead key={field} className={field === "salary" ? "text-right" : ""}>
                  <button type="button" className="font-medium hover:underline" onClick={() => toggleSort(field)}>
                    {label}
                    {sortBy === field ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                  </button>
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length + 1} className="py-14 text-center">
                  <UsersRound className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                  <p className="font-medium">No employees found</p>
                  <p className="text-sm text-muted-foreground">
                    Try removing a filter or searching for something else.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                        `${employee.firstName}${employee.lastName}`,
                      )}`}
                    >
                      {initials(employee.firstName, employee.lastName)}
                    </span>
                    <div>
                      <div className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{employee.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.jobTitle}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${departmentBadge(
                      employee.department,
                    )}`}
                  >
                    {employee.department}
                  </span>
                </TableCell>
                <TableCell>{employee.country}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatSalary(employee.salary, employee.currency)}
                </TableCell>
                <TableCell className="text-muted-foreground">{employee.hireDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Edit employee"
                      aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
                      onClick={() => setEditing(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      title="Delete employee"
                      aria-label={`Delete ${employee.firstName} ${employee.lastName}`}
                      onClick={() => handleDelete(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {data.total.toLocaleString()} employees · Page {data.page} of {Math.max(data.totalPages, 1)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {editing !== null && (
        <EmployeeDialog
          key={editing === "new" ? "new" : editing.id}
          employee={editing === "new" ? null : editing}
          options={options}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setRefreshKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}