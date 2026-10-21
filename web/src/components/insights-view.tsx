"use client";

import { useEffect, useState } from "react";
import { Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOptions, getSalaryStats } from "@/lib/api";
import { formatSalary } from "@/lib/format";
import { EMPTY_OPTIONS, type GroupBy, type Options, type SalaryStatsRow } from "@/lib/types";
import { MultiSelectFilter } from "./multiSelectFilter";

const GROUPS: { value: GroupBy; label: string; plural: string }[] = [
  { value: "country", label: "Country", plural: "Countries" },
  { value: "department", label: "Department", plural: "Departments" },
  { value: "jobTitle", label: "Job title", plural: "Job titles" },
];

function averagePosition(row: SalaryStatsRow): number {
  if (row.max <= row.min) return 50;
  const position = ((row.average - row.min) / (row.max - row.min)) * 100;
  return Math.min(100, Math.max(0, position));
}

export function InsightsView() {
  const [options, setOptions] = useState<Options>(EMPTY_OPTIONS);
  const [groupBy, setGroupBy] = useState<GroupBy>("country");
  const [country, setCountry] = useState<string[]>([]);
  const [department, setDepartment] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState<string[]>([]);
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
  const groupPlural = GROUPS.find((group) => group.value === groupBy)?.plural ?? "Groups";
  const totalHeadcount = rows?.reduce((sum, row) => sum + row.headcount, 0) ?? 0;
  const distinctGroups = new Set(rows?.map((row) => row.group)).size;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">How we pay people</h1>
        <p className="text-sm text-muted-foreground">
          Salaries are shown in each employee&apos;s local currency, so every group is split by currency. No
          conversion is applied.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <div className="inline-flex rounded-lg border bg-muted/40 p-1">
          {GROUPS.map((group) => (
            <Button
              key={group.value}
              size="sm"
              variant={groupBy === group.value ? "default" : "ghost"}
              onClick={() => setGroupBy(group.value)}
            >
              By {group.label.toLowerCase()}
            </Button>
          ))}
        </div>
        <MultiSelectFilter label="Country" selected={country} options={options.countries} onChange={setCountry} />
        <MultiSelectFilter
          label="Department"
          selected={department}
          options={options.departments}
          onChange={setDepartment}
        />
        <MultiSelectFilter label="Job title" selected={jobTitle} options={options.jobTitles} onChange={setJobTitle} />
      </div>

      {rows && rows.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="text-2xl font-semibold tabular-nums">{totalHeadcount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{groupPlural}</p>
              <p className="text-2xl font-semibold tabular-nums">{distinctGroups}</p>
            </div>
          </div>
        </div>
      )}

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
              <TableHead>{groupLabel}</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
              <TableHead className="text-right">Min</TableHead>
              <TableHead className="text-right">Median</TableHead>
              <TableHead className="text-right">Average</TableHead>
              <TableHead className="text-right">Max</TableHead>
              <TableHead className="w-36">Average position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-14 text-center">
                  <Layers className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                  <p className="font-medium">No data for these filters</p>
                  <p className="text-sm text-muted-foreground">Try removing a filter.</p>
                </TableCell>
              </TableRow>
            )}
            {rows?.map((row) => (
              <TableRow key={`${row.group}-${row.currency}`}>
                <TableCell className="font-medium">{row.group}</TableCell>
                <TableCell>
                  <span className="inline-flex rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {row.currency}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.headcount.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatSalary(row.min, row.currency)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatSalary(row.median, row.currency)}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatSalary(row.average, row.currency)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatSalary(row.max, row.currency)}
                </TableCell>
                <TableCell>
                  <div
                    className="relative h-1.5 w-28 rounded-full bg-muted"
                    title={`Average sits ${Math.round(averagePosition(row))}% of the way from min to max`}
                  >
                    <div
                      className="absolute top-1/2 h-3.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                      style={{ left: `${averagePosition(row)}%` }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}