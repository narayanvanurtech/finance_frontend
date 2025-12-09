import React from "react";

type Invoice = {
  id: string;
  label: string;
};

type HeaderBarProps = {
  creditNoteNo: string;
  setCreditNoteNo: (val: string) => void;
  creditNoteDate: string;
  setCreditNoteDate: (val: string) => void;
  linkedInvoice: string;
  setLinkedInvoice: (val: string) => void;
  reason: string;
  setReason: (val: string) => void;
  invoices: Invoice[];
  reasons: string[];
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  creditNoteNo,
  setCreditNoteNo,
  creditNoteDate,
  setCreditNoteDate,
  linkedInvoice,
  setLinkedInvoice,
  reason,
  setReason,
  invoices,
  reasons,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          Credit Note No <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={creditNoteNo}
          onChange={e => setCreditNoteNo(e.target.value)}
          placeholder="A00001"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Credit Note Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={creditNoteDate}
          onChange={e => setCreditNoteDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Link Invoice</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={linkedInvoice}
          onChange={e => setLinkedInvoice(e.target.value)}
        >
          <option value="">Select Invoice</option>
          {invoices.map(inv => (
            <option key={inv.id} value={inv.id}>{inv.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Select reason <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full border rounded px-3 py-2"
          value={reason}
          onChange={e => setReason(e.target.value)}
          required
        >
          <option value="">Select reason</option>
          {reasons.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default HeaderBar;
