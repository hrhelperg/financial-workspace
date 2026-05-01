"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { inputClassName, labelClassName, primaryButtonClassName } from "@/components/form-styles";

type FieldErrors = Record<string, string>;

type ApiErrorResponse = {
  errors?: Array<{ field: string; message: string }>;
};

export function ClientForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      companyName: formData.get("companyName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      notes: formData.get("notes")
    };

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        const errors = body?.errors ?? [];
        const nextFieldErrors: FieldErrors = {};
        let general: string | null = null;

        errors.forEach((error) => {
          if (error.field === "_") {
            general = error.message;
          } else {
            nextFieldErrors[error.field] = error.message;
          }
        });

        setFieldErrors(nextFieldErrors);
        setGeneralError(general ?? "Could not create client.");
        return;
      }

      router.push("/clients");
      router.refresh();
    } catch {
      setGeneralError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          Client name
          <input className={inputClassName} name="name" placeholder="Acme Ledger Co." required />
          {fieldErrors.name ? <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.name}</span> : null}
        </label>
        <label className={labelClassName}>
          Company
          <input className={inputClassName} name="companyName" placeholder="Acme Ledger Co." />
        </label>
        <label className={labelClassName}>
          Email
          <input className={inputClassName} name="email" placeholder="finance@example.com" type="email" />
          {fieldErrors.email ? <span className="mt-1 block text-xs text-[#a13d3d]">{fieldErrors.email}</span> : null}
        </label>
        <label className={labelClassName}>
          Phone
          <input className={inputClassName} name="phone" placeholder="+1 555 0100" />
        </label>
      </div>
      <label className={labelClassName}>
        Notes
        <textarea
          className={`${inputClassName} min-h-24 resize-y`}
          name="notes"
          placeholder="Billing preferences or operating context"
        />
      </label>
      {generalError ? (
        <p className="rounded-md border border-[#f0c4c4] bg-[#ffe7e7] px-3 py-2 text-sm text-[#a13d3d]">
          {generalError}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <button className={primaryButtonClassName} disabled={submitting} type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {submitting ? "Creating…" : "Create client"}
        </button>
      </div>
    </form>
  );
}
