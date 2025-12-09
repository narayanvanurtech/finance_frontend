import React from "react";

type HeaderBarProps = {
  challanNumber: string;
  setChallanNumber: (val: string) => void;
  reference: string;
  setReference: (val: string) => void;
  challanType: string;
  setChallanType: (val: string) => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  challanNumber,
  setChallanNumber,
  reference,
  setReference,
  challanType,
  setChallanType,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          Delivery Challan no#
        </label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={challanNumber}
          onChange={(e) => setChallanNumber(e.target.value)}
          placeholder="DC-00002"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Reference#</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Reference number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Challan Type</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={challanType}
          onChange={(e) => setChallanType(e.target.value)}
          placeholder="Type (e.g. Original, Duplicate)"
        />
      </div>
    </div>
  );
};

export default HeaderBar;
