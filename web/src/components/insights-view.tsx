"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOptions, getSalaryStats } from "@/lib/api";
import { formatSalary } from "@/lib/format";
import { EMPTY_OPTIONS, type GroupBy, type Options, type SalaryStatsRow } from "@/lib/types";
import { FilterSelect } from "./filter-select";

   const GROUPS: { value: GroupBy; label: string; plural: string }[] = [
     { value: "country", label: "Country", plural: "Countries" },
     { value: "department", label: "Department", plural: "Departments" },
     { value: "jobTitle", label: "Job title", plural: "Job titles" },
   ];

export function InsightsView() {
  const [options, setOptions] = useState<Options>(EMPTY_OPTIONS);
  const [groupBy, setGroupBy] = useState<GroupBy>("country");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [rows, setRows] = useState<SalaryStatsRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOptions()
      .then(setOptions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getSalaryStats({ groupBy, country, department, jobTitle }, controller.signal)
      .then((result) => {
        setRows(result.rows);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      });
    return () => controller.abort();
  }, [groupBy, country, department, jobTitle]);

  const groupLabel = GROUPS.find((group) => group.value === groupBy)?.label ?? "Group";
  const totalHeadcount = rows?.reduce((sum, row) => sum + row.headcount, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">How we pay people</h1>
        <p className="text-sm text-muted-foreground">
          Salaries are shown in each employee&apos;s local currency, so every group is split by currency. No
          conversion is applied.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {GROUPS.map((group) => (
            <Button
              key={group.value}
              size="sm"
              variant={groupBy === group.value ? "default" : "outline"}
              onClick={() => setGroupBy(group.value)}
            >
              By {group.label.toLowerCase()}
            </Button>
          ))}
        </div>
        <FilterSelect label="Countries" value={country} options={options.countries} onChange={setCountry} />
        <FilterSelect label="Departments" value={department} options={options.departments} onChange={setDepartment} />
        <FilterSelect label="Job titles" value={jobTitle} options={options.jobTitles} onChange={setJobTitle} />
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
              <TableHead>{groupLabel}</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
              <TableHead className="text-right">Min</TableHead>
              <TableHead className="text-right">Median</TableHead>
              <TableHead className="text-right">Average</TableHead>
              <TableHead className="text-right">Max</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No data for these filters.
                </TableCell>
              </TableRow>
            )}
            {rows?.map((row) => (
              <TableRow key={`${row.group}-${row.currency}`}>
                <TableCell className="font-medium">{row.group}</TableCell>
                <TableCell>{row.currency}</TableCell>
                <TableCell className="text-right tabular-nums">{row.headcount.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{formatSalary(row.min, row.currency)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatSalary(row.median, row.currency)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatSalary(row.average, row.currency)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatSalary(row.max, row.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rows && rows.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {totalHeadcount.toLocaleString()} employees across {rows.length} rows
        </p>
      )}
    </div>
  );
}