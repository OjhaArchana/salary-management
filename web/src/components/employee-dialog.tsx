"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, createEmployee, updateEmployee } from "@/lib/api";
import type { Employee, EmployeeInput, Options } from "@/lib/types";

type FieldName = keyof EmployeeInput;
type FieldErrors = Partial<Record<FieldName, string>>;

interface FieldDef {
  name: FieldName;
  label: string;
  type?: string;
  list?: string;
  placeholder?: string;
  maxLength?: number;
}

const FIELDS: FieldDef[] = [
  { name: "firstName", label: "First name" },
  { name: "lastName", label: "Last name" },
  { name: "email", label: "Email", type: "email" },
  { name: "jobTitle", label: "Job title", list: "job-titles" },
  { name: "department", label: "Department", list: "departments" },
  { name: "country", label: "Country", list: "countries" },
  { name: "currency", label: "Currency (3-letter code)", placeholder: "INR", maxLength: 3 },
  { name: "salary", label: "Annual salary", type: "number" },
  { name: "hireDate", label: "Hire date", type: "date" },
];

function initialValues(employee: Employee | null): Record<FieldName, string> {
  return {
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    jobTitle: employee?.jobTitle ?? "",
    department: employee?.department ?? "",
    country: employee?.country ?? "",
    currency: employee?.currency ?? "",
    salary: employee ? String(employee.salary) : "",
    hireDate: employee?.hireDate ?? "",
  };
}

interface EmployeeDialogProps {
  employee: Employee | null; 
  options: Options;
  onClose: () => void;
  onSaved: () => void;
}

export function EmployeeDialog({ employee, options, onClose, onSaved }: EmployeeDialogProps) {
  const [values, setValues] = useState(() => initialValues(employee));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setValue(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: name === "currency" ? value.toUpperCase() : value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const missing: FieldErrors = {};
    for (const field of FIELDS) {
      if (!values[field.name].trim()) missing[field.name] = "Required";
    }
    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      return;
    }

    const input: EmployeeInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      jobTitle: values.jobTitle,
      department: values.department,
      country: values.country,
      currency: values.currency,
      salary: Number(values.salary),
      hireDate: values.hireDate,
    };

    setSaving(true);
    setErrors({});
    setFormError(null);
    try {
      if (employee) await updateEmployee(employee.id, input);
      else await createEmployee(input);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length > 0) {
        const mapped: FieldErrors = {};
        for (const fieldError of err.fieldErrors) mapped[fieldError.field as FieldName] = fieldError.message;
        setErrors(mapped);
      } else if (err instanceof ApiError && err.status === 409) {
        setErrors({ email: err.message });
      } else {
        setFormError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>Salary is stored in the employee&apos;s local currency.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type ?? "text"}
                  list={field.list}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  value={values[field.name]}
                  onChange={(event) => setValue(field.name, event.target.value)}
                  aria-invalid={Boolean(errors[field.name])}
                />
                {errors[field.name] && <p className="text-sm text-red-600">{errors[field.name]}</p>}
              </div>
            ))}
          </div>

          <datalist id="job-titles">
            {options.jobTitles.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          <datalist id="departments">
            {options.departments.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          <datalist id="countries">
            {options.countries.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}