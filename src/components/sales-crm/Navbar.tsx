"use client";

import React from "react";
import { Plus, Bell, Calendar, MessageCircle } from "lucide-react";
import { Tooltip } from "@mui/material";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BadgeAlert, Mail, Phone, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Helper to convert path segment to readable label
  function toLabel(segment: string) {
    const map: Record<string, string> = {
      home: "Home",
      leads: "Leads",
      deals: "Deals",
      contacts: "Contacts",
      tasks: "Tasks",
      meetings: "Meetings",
      calls: "Calls",
      reports: "Reports",
      settings: "Settings",
      support: "Support",
      pricing: "Pricing",
      analytics: "Analytics",
      users: "Users",
      companydetails: "Company Details",
      "proforma-invoice": "Proforma Invoice",
      "purchase-order": "Purchase Order",
      "sales-report": "Sales Report",
      // Add more compound words as needed
    };

    // If found in map, return it
    if (map[segment.toLowerCase()]) {
      return map[segment.toLowerCase()];
    }

    // Handle hyphenated words by capitalizing each part
    if (segment.includes("-")) {
      return segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Handle underscored words
    if (segment.includes("_")) {
      return segment
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Default capitalization
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  // Build breadcrumb segments from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  // Regex to detect MongoDB ObjectId (24 hex chars)
  const isMongoId = (segment: string) => /^[a-f\d]{24}$/i.test(segment);
  // Filter out MongoDB IDs from breadcrumb
  const breadcrumbItems =
    pathSegments.length === 0
      ? ["home"]
      : pathSegments.filter((segment) => !isMongoId(segment));

  return (
    <>
      <nav className="w-full h-16 bg-white text-gray-900 flex items-center justify-between px-4 z-40 relative shadow">
        {/* Left: Breadcrumb - Made more flexible */}
        <div className="flex items-center flex-1 min-w-0 mr-4">
          <nav
            className="flex items-center text-sm text-indigo-800 font-medium space-x-1 overflow-hidden"
            aria-label="Breadcrumb"
          >
            <span className="whitespace-nowrap">Home</span>
            {breadcrumbItems.map((segment: string, idx: number) => {
              // Skip 'home' as it's already rendered
              if (segment.toLowerCase() === "home") return null;
              const isLast = idx === breadcrumbItems.length - 1;
              return (
                <span key={idx} className="flex items-center min-w-0">
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
                  <span
                    className={`${
                      isLast
                        ? "text-indigo-900 font-semibold"
                        : "text-indigo-800"
                    } whitespace-nowrap truncate`}
                    title={toLabel(segment)} // Show full text on hover
                  >
                    {toLabel(segment)}
                  </span>
                </span>
              );
            })}
          </nav>
        </div>

        {/* Right: Static Elements - Made more compact */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="hidden md:flex flex-col items-center justify-center text-xs text-gray-800">
            <div className="bg-gray-100 text-[10px] font-medium px-2 py-[2px] rounded-full">
              Enterprise Trial
            </div>
            <Link href="/pricing" passHref>
              <span className="mt-2 text-[11px] font-semibold text-indigo-600 hover:underline tracking-wide cursor-pointer">
                Upgrade
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-full hover:bg-indigo-50 transition border border-indigo-400/30">
                  <img
                    src="https://imgs.search.brave.com/-m0Hs9SKqp8ypHWL4Zzr4_B6dAoJrLO38o3aAMgLJmc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQx/Mzc2NDU5NS9waG90/by9zdWNjZXNzZnVs/LW1hdHVyZS1idXNp/bmVzcy13b21hbi1s/b29raW5nLWF0LWNh/bWVyYS5qcGc_cz02/MTJ4NjEyJnc9MCZr/PTIwJmM9RFZmWWZG/WWJ2S3N6ZGRBdWZa/bzNYTHh0eDFXZ3pl/aUlaNmNTeEFtbEI1/WT0"
                    alt="Sarah Parker"
                    style={{ width: 28, height: 28, borderRadius: "50%" }}
                  />
                  <div className="text-[10px]">
                    <div className="font-semibold leading-tight whitespace-nowrap text-gray-900">
                      Sarah Parker
                    </div>
                    <div className="text-[9px] text-gray-500">
                      Available Now
                    </div>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 shadow-lg shadow-indigo-900/5 border-indigo-100/50">
                <div className="px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Hi, I'm Sarah
                    </h3>
                    <span className="px-2 py-1 text-[10px] bg-green-100 text-green-700 rounded-full">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    With over 5 years in customer success, I've helped 300+
                    teams get the most out of our CRM.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Available: 9 AM - 5 PM EST
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      <a
                        href="mailto:support@vtmcrm.com"
                        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        support@vtmcrm.com
                      </a>
                      <span>•</span>
                      <a
                        href="https://wa.me/+919876543210"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3 text-gray-500" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <button className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 flex items-center gap-2 rounded-lg transition-colors duration-200 group mt-1">
                    <div className="p-1.5 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors duration-200">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        Request Callback
                      </div>
                      <div className="text-xs text-gray-500">
                        Get a call from our support team
                      </div>
                    </div>
                  </button>
                  <Link href={"/support"}>
                    <button className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 flex items-center gap-2 rounded-lg transition-colors duration-200 group mt-1">
                      <div className="p-1.5 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors duration-200">
                        <BadgeAlert className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          Report an Issue
                        </div>
                        <div className="text-xs text-gray-500">
                          Submit a technical problem
                        </div>
                      </div>
                    </button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Tooltip title="Notifications" arrow>
            <div className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition">
              <Bell className="w-5 h-5 text-gray-500" />
            </div>
          </Tooltip>
        </div>
      </nav>
    </>
  );
}
