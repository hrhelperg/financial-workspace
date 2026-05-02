import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { createTranslator } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import type { ClientListItem } from "@/server/clients";
import { formatDate } from "@/server/format";

const statusTones: Record<ClientListItem["status"], "amber" | "blue" | "green" | "neutral"> = {
  active: "green",
  archived: "neutral",
  lead: "blue",
  paused: "amber"
};

export function ClientsTable({ clients, locale }: { clients: ClientListItem[]; locale: Locale }) {
  const t = createTranslator(locale);
  const statusLabels: Record<ClientListItem["status"], string> = {
    active: t("common.statuses.active"),
    archived: t("common.statuses.archived"),
    lead: t("common.statuses.lead"),
    paused: t("common.statuses.paused")
  };

  return (
    <Panel>
      <PanelHeader
        title={t("clients.listTitle")}
        description={t("clients.listDescription")}
      />
      <div className="mt-5 overflow-x-auto">
        {clients.length === 0 ? (
          <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
            {t("clients.empty")}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
            <thead>
              <tr className="text-left text-[#58645d]">
                <th className="whitespace-nowrap py-3 pr-4 font-semibold">{t("clients.client")}</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("common.labels.email")}</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("clients.phone")}</th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("common.labels.status")}</th>
                <th className="whitespace-nowrap py-3 pl-4 text-right font-semibold">{t("common.labels.created")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1ec]">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="min-w-56 py-4 pr-4">
                    <p className="font-semibold text-[#1f2933]">{client.name}</p>
                    {client.companyName && client.companyName !== client.name ? (
                      <p className="mt-1 text-[#647067]">{client.companyName}</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">
                    {client.email ?? <span className="text-[#8a948c]">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#1f2933]">
                    {client.phone ?? <span className="text-[#8a948c]">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill tone={statusTones[client.status]}>{statusLabels[client.status]}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 text-right text-[#647067]">
                    {formatDate(client.createdAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  );
}
