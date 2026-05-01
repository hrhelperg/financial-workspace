"use client";

import { useMemo, useState, type FormEvent } from "react";
import { BriefcaseBusiness, Plus, WalletCards } from "lucide-react";
import {
  formatCurrency,
  getClientBalance,
  initialClients,
  initialInvoices,
  type ClientRecord
} from "@financial-workspace/core";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";

const inputClassName =
  "mt-2 w-full rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm text-[#1f2933] outline-none transition-colors placeholder:text-[#8a948c] focus:border-[#0f766e] focus:ring-2 focus:ring-[#b8e2d8]";
const labelClassName = "text-sm font-semibold text-[#1f2933]";

function field(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() ?? "";
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clientStatusTone(status: ClientRecord["status"]): "amber" | "blue" | "green" {
  if (status === "Active") {
    return "green";
  }

  if (status === "Onboarding") {
    return "blue";
  }

  return "amber";
}

export function ClientsMvp() {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const openBalance = useMemo(
    () => clients.reduce((sum, client) => sum + getClientBalance(client.id, initialInvoices), 0),
    [clients]
  );

  function handleCreateClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = field(formData, "name");

    if (!name) {
      return;
    }

    const newClient: ClientRecord = {
      id: createId("client"),
      name,
      companyName: field(formData, "companyName") || name,
      email: field(formData, "email") || null,
      phone: field(formData, "phone") || null,
      notes: field(formData, "notes") || null,
      status: "Active",
      invoiceCount: 0,
      lastActivity: "Created just now"
    };

    setClients((current) => [newClient, ...current]);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <PanelHeader title="Create client" description="Add the billing relationship before issuing invoices." />
          <form className="mt-5 space-y-4" onSubmit={handleCreateClient}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClassName}>
                Client name
                <input className={inputClassName} name="name" placeholder="Acme Ledger Co." required />
              </label>
              <label className={labelClassName}>
                Company
                <input className={inputClassName} name="companyName" placeholder="Acme Ledger Co." />
              </label>
              <label className={labelClassName}>
                Email
                <input className={inputClassName} name="email" placeholder="finance@example.com" type="email" />
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
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create client
            </button>
          </form>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#647067]">Clients</p>
                <p className="mt-3 text-2xl font-semibold tracking-normal text-[#1f2933]">{clients.length}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e7efff] text-[#2455a4]">
                <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-sm text-[#647067]">Billing relationships in this workspace.</p>
          </Panel>
          <Panel>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#647067]">Open balance</p>
                <p className="mt-3 text-2xl font-semibold tracking-normal text-[#1f2933]">
                  {formatCurrency(openBalance)}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e1f3ef] text-[#0f5f59]">
                <WalletCards className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-sm text-[#647067]">Current receivables tied to clients.</p>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader title="Clients list" description="Accounts, contacts, balances, and recent financial activity." />
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
            <thead>
              <tr className="text-left text-[#58645d]">
                <th className="whitespace-nowrap py-3 pr-4 font-semibold">Client</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Contact</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Open balance</th>
                <th className="whitespace-nowrap py-3 pl-4 text-right font-semibold">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ec]">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="min-w-56 py-4 pr-4">
                    <p className="font-semibold text-[#1f2933]">{client.name}</p>
                    <p className="mt-1 text-[#647067]">{client.lastActivity}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">{client.email ?? "No email"}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill tone={clientStatusTone(client.status)}>{client.status}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[#1f2933]">
                    {formatCurrency(getClientBalance(client.id, initialInvoices))}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 text-right text-[#1f2933]">{client.invoiceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
