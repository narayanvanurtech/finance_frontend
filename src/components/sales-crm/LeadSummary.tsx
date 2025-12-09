"use client";

import React, { useState } from "react";
import EditableField from "@/components/sales-crm/EditableField";
import { Lead } from "@/api/leadsApi";

interface LeadSummaryProps {
  lead: Lead;
}

const LeadSummary: React.FC<LeadSummaryProps> = ({ lead }) => {
  const [formData, setFormData] = useState({
    "First Name": lead.firstName,
    "Last Name": lead.lastName,
    "Company Name": lead.companyName, 
    Email: lead.email,
    Phone: lead.phone,
  });

  // Update formData when lead prop changes
  React.useEffect(() => {
    setFormData({
      "First Name": lead.firstName,
      "Last Name": lead.lastName,
      "Company Name": lead.companyName,
      Email: lead.email,
      Phone: lead.phone,
    });
  }, [lead]);

  const handleSaveField = (label: string, newValue: string) => {
    setFormData((prev) => ({ ...prev, [label]: newValue }));
  };

  return (
    <div className="bg-white p-6 rounded shadow-md space-y-4 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-lg font-semibold">Lead Summary</h2>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableField
          label="First Name"
          value={formData["First Name"]}
          onSave={(newValue) => handleSaveField("First Name", newValue)}
          entityId={lead._id}
          fieldName="firstName"
        />
        <EditableField
          label="Last Name"
          value={formData["Last Name"]}
          onSave={(newValue) => handleSaveField("Last Name", newValue)}
          entityId={lead._id}
          fieldName="lastName"
        />
        <EditableField
          label="Company Name"
          value={formData["Company Name"]} 
          onSave={(newValue) => {
            handleSaveField("Company Name", newValue);
            // Update both company fields in the lead object
            lead.companyName = newValue;
          }}
          entityId={lead._id}
          fieldName="companyName"
        />
        <EditableField
          label="Email"
          value={formData.Email}
          onSave={(newValue) => handleSaveField("Email", newValue)}
          entityId={lead._id}
          fieldName="email"
        />
        <EditableField
          label="Phone"
          value={formData.Phone}
          onSave={(newValue) => handleSaveField("Phone", newValue)}
          entityId={lead._id}
          fieldName="phone"
        />
      </div>
    </div>
  );
};

export default LeadSummary;