import "server-only";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { and, asc, eq } from "drizzle-orm";
import { clients, db, invoices, invoiceDirectionValues, type Invoice } from "@financial-workspace/db";
import { requireWorkspaceMember } from "./workspace";

export type FiscalExportInvoice = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  status: Invoice["status"];
  totalAmount: string;
  currency: string;
  storagePath: string | null;
};

export type FiscalExportFolder = {
  fiscalYear: number;
  direction: Invoice["direction"];
  path: string;
  invoiceCount: number;
  totalAmount: string;
  invoices: FiscalExportInvoice[];
};

export type FiscalExportPackage = {
  workspaceId: string;
  folders: FiscalExportFolder[];
};

type ZipEntrySource = Uint8Array | AsyncIterable<Uint8Array>;

type ZipEntry = {
  name: string;
  source: ZipEntrySource;
};

type CentralDirectoryEntry = {
  crc32: number;
  nameBytes: Buffer;
  offset: number;
  size: number;
};

type ExportInvoiceRow = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  direction: Invoice["direction"];
  status: Invoice["status"];
  issueDate: string;
  fiscalYear: number;
  totalAmount: string;
  currency: string;
  storagePath: string | null;
};

function folderKey(fiscalYear: number, direction: Invoice["direction"]) {
  return `${fiscalYear}:${direction}`;
}

function folderPath(fiscalYear: number, direction: Invoice["direction"]) {
  return `fiscal/${fiscalYear}/${direction}`;
}

function emptyFolder(fiscalYear: number, direction: Invoice["direction"]): FiscalExportFolder {
  return {
    fiscalYear,
    direction,
    path: folderPath(fiscalYear, direction),
    invoiceCount: 0,
    totalAmount: "0.00",
    invoices: []
  };
}

export async function getFiscalExportPackage(): Promise<FiscalExportPackage> {
  const { workspace } = await requireWorkspaceMember();

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: clients.name,
      direction: invoices.direction,
      status: invoices.status,
      issueDate: invoices.issueDate,
      fiscalYear: invoices.fiscalYear,
      totalAmount: invoices.totalAmount,
      currency: invoices.currency,
      storagePath: invoices.storagePath
    })
    .from(invoices)
    .innerJoin(clients, and(eq(clients.id, invoices.clientId), eq(clients.workspaceId, workspace.id)))
    .where(eq(invoices.workspaceId, workspace.id))
    .orderBy(asc(invoices.fiscalYear), asc(invoices.direction), asc(invoices.issueDate));

  const years = new Set<number>();
  const folders = new Map<string, FiscalExportFolder>();

  rows.forEach((invoice) => {
    years.add(invoice.fiscalYear);
    const key = folderKey(invoice.fiscalYear, invoice.direction);
    const folder = folders.get(key) ?? emptyFolder(invoice.fiscalYear, invoice.direction);
    const nextTotal = Number(folder.totalAmount) + Number(invoice.totalAmount);

    folder.invoiceCount += 1;
    folder.totalAmount = Number.isFinite(nextTotal) ? nextTotal.toFixed(2) : folder.totalAmount;
    folder.invoices.push({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      issueDate: invoice.issueDate,
      status: invoice.status,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      storagePath: invoice.storagePath
    });

    folders.set(key, folder);
  });

  years.forEach((year) => {
    invoiceDirectionValues.forEach((direction) => {
      const key = folderKey(year, direction);
      folders.set(key, folders.get(key) ?? emptyFolder(year, direction));
    });
  });

  return {
    workspaceId: workspace.id,
    folders: Array.from(folders.values()).sort((a, b) => {
      if (a.fiscalYear !== b.fiscalYear) {
        return b.fiscalYear - a.fiscalYear;
      }

      return a.direction.localeCompare(b.direction);
    })
  };
}

export async function exportFiscalPackage(fiscalYear: number) {
  const { workspace } = await requireWorkspaceMember();
  const rows = await getFiscalExportRows(workspace.id, fiscalYear);
  const entries = await createFiscalZipEntries(rows);

  return {
    fileName: `Financial_Workspace_${fiscalYear}.zip`,
    stream: readableStreamFromAsyncIterable(generateZip(entries))
  };
}

async function getFiscalExportRows(workspaceId: string, fiscalYear: number): Promise<ExportInvoiceRow[]> {
  return db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: clients.name,
      direction: invoices.direction,
      status: invoices.status,
      issueDate: invoices.issueDate,
      fiscalYear: invoices.fiscalYear,
      totalAmount: invoices.totalAmount,
      currency: invoices.currency,
      storagePath: invoices.storagePath
    })
    .from(invoices)
    .innerJoin(clients, and(eq(clients.id, invoices.clientId), eq(clients.workspaceId, workspaceId)))
    .where(and(eq(invoices.workspaceId, workspaceId), eq(invoices.fiscalYear, fiscalYear)))
    .orderBy(asc(invoices.direction), asc(invoices.issueDate), asc(invoices.invoiceNumber));
}

async function createFiscalZipEntries(rows: ExportInvoiceRow[]): Promise<ZipEntry[]> {
  const entries: ZipEntry[] = [
    { name: "incoming/", source: new Uint8Array() },
    { name: "outgoing/", source: new Uint8Array() },
    { name: "summary.csv", source: encodeText(createSummaryCsv(rows)) }
  ];

  for (const invoice of rows) {
    const pdf = await getInvoicePdfSource(invoice.storagePath);

    if (pdf) {
      entries.push({
        name: `${invoice.direction}/${safeFileName(invoice.invoiceNumber)}.pdf`,
        source: pdf
      });
    } else {
      entries.push({
        name: `${invoice.direction}/${safeFileName(invoice.invoiceNumber)}.json`,
        source: encodeText(JSON.stringify(createInvoiceMetadata(invoice), null, 2))
      });
    }
  }

  return entries;
}

function createSummaryCsv(rows: ExportInvoiceRow[]) {
  const header = ["invoice_number", "client_name", "amount", "direction", "status", "issue_date"];
  const lines = rows.map((invoice) =>
    [
      invoice.invoiceNumber,
      invoice.clientName,
      invoice.totalAmount,
      invoice.direction,
      invoice.status,
      invoice.issueDate
    ]
      .map(csvEscape)
      .join(",")
  );

  return `${header.join(",")}\n${lines.join("\n")}${lines.length > 0 ? "\n" : ""}`;
}

function createInvoiceMetadata(invoice: ExportInvoiceRow) {
  return {
    invoice_number: invoice.invoiceNumber,
    client_name: invoice.clientName,
    amount: invoice.totalAmount,
    currency: invoice.currency,
    direction: invoice.direction,
    status: invoice.status,
    issue_date: invoice.issueDate,
    fiscal_year: invoice.fiscalYear,
    storage_path: invoice.storagePath,
    pdf_status: "missing"
  };
}

async function getInvoicePdfSource(storagePath: string | null): Promise<AsyncIterable<Uint8Array> | null> {
  if (!storagePath || !process.env.FISCAL_DOCUMENT_STORAGE_ROOT) {
    return null;
  }

  const storageRoot = resolve(process.env.FISCAL_DOCUMENT_STORAGE_ROOT);
  const filePath = resolve(storageRoot, storagePath);

  if (relative(storageRoot, filePath).startsWith("..")) {
    return null;
  }

  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile() ? createReadStream(filePath) : null;
  } catch {
    return null;
  }
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "invoice";
}

function csvEscape(value: string) {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  crcTable[index] = crc >>> 0;
}

function updateCrc32(crc: number, chunk: Uint8Array) {
  let next = crc;

  for (const byte of chunk) {
    next = crcTable[(next ^ byte) & 0xff] ^ (next >>> 8);
  }

  return next;
}

async function* generateZip(entries: ZipEntry[]): AsyncGenerator<Uint8Array> {
  const centralDirectory: CentralDirectoryEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, "utf8");
    const localHeader = createLocalHeader(nameBytes);
    const entryOffset = offset;
    let crc = 0xffffffff;
    let size = 0;

    yield localHeader;
    offset += localHeader.length;

    for await (const chunk of toAsyncChunks(entry.source)) {
      crc = updateCrc32(crc, chunk);
      size += chunk.length;
      yield chunk;
      offset += chunk.length;
    }

    const finalCrc = (crc ^ 0xffffffff) >>> 0;
    const descriptor = createDataDescriptor(finalCrc, size);

    yield descriptor;
    offset += descriptor.length;
    centralDirectory.push({ crc32: finalCrc, nameBytes, offset: entryOffset, size });
  }

  const centralDirectoryOffset = offset;

  for (const entry of centralDirectory) {
    const header = createCentralDirectoryHeader(entry);
    yield header;
    offset += header.length;
  }

  yield createEndOfCentralDirectory({
    centralDirectoryOffset,
    centralDirectorySize: offset - centralDirectoryOffset,
    entryCount: centralDirectory.length
  });
}

async function* toAsyncChunks(source: ZipEntrySource): AsyncGenerator<Uint8Array> {
  if (source instanceof Uint8Array) {
    yield source;
    return;
  }

  for await (const chunk of source) {
    yield chunk instanceof Uint8Array ? chunk : Buffer.from(chunk);
  }
}

function createLocalHeader(nameBytes: Buffer) {
  const header = Buffer.alloc(30 + nameBytes.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0808, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(0, 18);
  header.writeUInt32LE(0, 22);
  header.writeUInt16LE(nameBytes.length, 26);
  header.writeUInt16LE(0, 28);
  nameBytes.copy(header, 30);
  return header;
}

function createDataDescriptor(crc32: number, size: number) {
  const descriptor = Buffer.alloc(16);
  descriptor.writeUInt32LE(0x08074b50, 0);
  descriptor.writeUInt32LE(crc32, 4);
  descriptor.writeUInt32LE(size, 8);
  descriptor.writeUInt32LE(size, 12);
  return descriptor;
}

function createCentralDirectoryHeader(entry: CentralDirectoryEntry) {
  const header = Buffer.alloc(46 + entry.nameBytes.length);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0808, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(entry.crc32, 16);
  header.writeUInt32LE(entry.size, 20);
  header.writeUInt32LE(entry.size, 24);
  header.writeUInt16LE(entry.nameBytes.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.offset, 42);
  entry.nameBytes.copy(header, 46);
  return header;
}

function createEndOfCentralDirectory(input: {
  centralDirectoryOffset: number;
  centralDirectorySize: number;
  entryCount: number;
}) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(input.entryCount, 8);
  header.writeUInt16LE(input.entryCount, 10);
  header.writeUInt32LE(input.centralDirectorySize, 12);
  header.writeUInt32LE(input.centralDirectoryOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

function readableStreamFromAsyncIterable(iterable: AsyncIterable<Uint8Array>) {
  const iterator = iterable[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const result = await iterator.next();

      if (result.done) {
        controller.close();
      } else {
        controller.enqueue(result.value);
      }
    },
    async cancel() {
      await iterator.return?.();
    }
  });
}
