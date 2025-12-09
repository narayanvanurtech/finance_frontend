"use client";

import React, { useState } from "react";
import EditableField from "@/components/sales-crm/EditableField";
import ReadOnlyField from "@/components/sales-crm/ReadOnlyField";
import { Lead } from "@/api/leadsApi";

interface LeadInformationPageProps {
  lead: Lead;
}

const LeadInformationPage: React.FC<LeadInformationPageProps> = ({ lead }) => {
  const [leadInfo, setLeadInfo] = useState({
    "Lead Owner": lead.leadOwner,
    "Owner Email": lead.leadOwner,
    Title: lead.title,
    "Lead Source": lead.source,
    Industry: lead.industry,
    "Modified Date": new Date(lead.updatedAt).toLocaleString(),
    Website: lead.website,
    "Lead Status": lead.status,
    "Priority": lead.priority,
    "Status": lead.status,
    "Created Date": new Date(lead.createdAt).toLocaleString(),
    "FollowUp Date": lead.followUpDate,
    "Converted Date": lead.isConverted ? "Converted" : "Not Converted",
    Street: lead.address.street,
    State: lead.address.state,
    Country: lead.address.country,
    City: lead.address.city,
    "Zip Code": lead.address.postalCode,
    Description: "Lead description",
    // Social Media
    Facebook: lead.socialProfiles.facebook || "",
    Instagram: lead.socialProfiles.instagram || "",
    LinkedIn: lead.socialProfiles.linkedIn || "",
    Twitter: lead.socialProfiles.twitter || "",
  });

  const handleSaveField = (label: string, newValue: string) => {
    setLeadInfo((prev) => ({ ...prev, [label]: newValue }));
  };

  return (
    <div className="space-y-5">
      {/* General Information */}
      <div className="bg-white p-6 rounded shadow-md border border-gray-100">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            General Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {Object.entries(leadInfo).map(([label, value]) => {
            // Grouping General Information Fields
            if (
              [
                "Lead Owner",
                "Owner Email",
                "Lead Source",
                "Industry",
                "Modified Date",
                "Company",
                "Lead Status",
                "Priority",
                "Status",
                "Created Date",
                "FollowUp Date",
                "Converted Date",
              ].includes(label)
            ) {
              return (
                <ReadOnlyField
                  key={label}
                  label={label}
                  value={value}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white p-6 rounded shadow-md border border-gray-100">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Address Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {["Street", "State", "Country", "City", "Zip Code"].map((label) => (
            <ReadOnlyField
              key={label}
              label={label}
              value={leadInfo[label as keyof typeof leadInfo]}
            />
          ))}
        </div>
      </div>

      {/* Description Information */}
      {/* <div className="bg-white p-6 rounded shadow-md border border-gray-100">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Description Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-4">
          <ReadOnlyField
            label="Description"
            value={leadInfo["Description"]}
          />
        </div>
      </div> */}

      {/* Social Media Information */}
      <div className="bg-white p-6 rounded shadow-md border border-gray-100">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Social Media Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {["Facebook", "Instagram", "LinkedIn", "Twitter"].map((label) => (
            <ReadOnlyField
              key={label}
              label={label}
              value={leadInfo[label as keyof typeof leadInfo]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadInformationPage;
