"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteEmployee, getOptions, listEmployees } from "@/lib/api";
import { formatSalary } from "@/lib/format";
import { EMPTY_OPTIONS, type Employee, type Options, type Page, type SortField } from "@/lib/types";
import { EmployeeDialog } from "./employee-dialog";
import { MultiSelectFilter } from "./multiSelectFilter";
import { Pencil, Trash2 } from "lucide-react";

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

  // Debounce the search box so we do not query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reload the dropdown values after any add, edit or delete (a new country may appear).
  useEffect(() => {
    getOptions()
      .then(setOptions)
      .catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    listEmployees(
      {
        page,
        pageSize: PAGE_SIZE,
        search,
        country: country,
        department: department,
        jobTitle: jobTitle,
        sortBy,
        sortDir,
      },
      controller.signal,
    )
      .then((result) => {
        // Deleting the last row on the last page leaves an empty page: step back.
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input className="w-64" placeholder="Search by name or email" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
           <MultiSelectFilter label="Country" selected={country} options={options.countries} onChange={changeFilter(setCountry)} />
   <MultiSelectFilter label="Department" selected={department} options={options.departments} onChange={changeFilter(setDepartment)} />
   <MultiSelectFilter label="Job title" selected={jobTitle} options={options.jobTitles} onChange={changeFilter(setJobTitle)} />
        <Button className="ml-auto" onClick={() => setEditing("new")}>
          Add employee
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

    <div className={`overflow-hidden rounded-lg border bg-card shadow-sm transition-opacity ${loading ? "opacity-60" : ""}`}>        
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
                <TableCell colSpan={COLUMNS.length + 1} className="py-8 text-center text-muted-foreground">
                  No employees match your filters.
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">{employee.email}</div>
                </TableCell>
                <TableCell> <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{employee.jobTitle}</span></TableCell>
                <TableCell> <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{employee.department}</span></TableCell>
                <TableCell> <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{employee.country}</span></TableCell>
                <TableCell className="text-right tabular-nums">{formatSalary(employee.salary, employee.currency)}</TableCell>
                <TableCell>{employee.hireDate}</TableCell>
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
            <Button variant="outline" size="sm" disabled={page >= data.totalPages || loading} onClick={() => setPage(page + 1)}>
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
