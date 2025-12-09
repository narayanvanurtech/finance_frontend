"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DetailsSidebar from "@/components/sales-crm/DetailsSidebar";
import LeadSummary from "@/components/sales-crm/LeadSummary";
import LeadInformationPage from "@/components/sales-crm/LeadInformationPage";
import NoteSection from "@/components/sales-crm/NoteSection";
import AttachmentSection from "@/components/sales-crm/AttachmentSection";
import OpenActivities from "@/components/sales-crm/OpenActivities";
import ClosedActivities from "@/components/sales-crm/ClosedActivities";
import InvitedMeetings from "@/components/sales-crm/InvitedMeetings";
import DetailsSubNavbar from "@/components/sales-crm/DeatilsSubNavbar";
import AssignLeadsDialog from "@/components/sales-crm/AssignLeadsDialog";
import { getLeadById } from "@/api/leadsApi";
import { Lead } from "@/api/leadsApi";
import { useLeadsStore } from "@/stores/salesCrmStore/useLeadsStore";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";
import ConfirmationDialog from "@/components/sales-crm/ConfirmationDialog";

const DetailsPage = () => {
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const {
    assignLead,
    fetchLeadById,
    deleteLead,
    currentLead,
    isLoading: storeLoading,
  } = useLeadsStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Use company ID from auth store or fall back to a default if needed
  const companyId = user?.companyId;

  useEffect(() => {
    const loadLeadDetails = async () => {
      if (id && companyId) {
        // Only proceed if we have both required IDs
        try {
          setIsLoading(true);
          setError(null);
          await fetchLeadById(id as string, companyId);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch lead details"
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadLeadDetails();
  }, [id, companyId]);

  const toggleCollapse = () => setCollapsed(!collapsed);

  const scrollToSection = (id: string) => {
    const section = sectionRefs.current[id];
    if (section) {
      setActiveSection(id);
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

      // Highlight the section temporarily
      section.classList.add("bg-blue-50", "ring-2", "ring-blue-200");
      setTimeout(() => {
        section.classList.remove("bg-blue-50", "ring-2", "ring-blue-200");
      }, 1500);
    }
  };

  const setSectionRef = (id: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current[id] = el;
  };

  // Handle hash changes in URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && sectionRefs.current[hash]) {
        scrollToSection(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!leadToDelete || isDeleting || !companyId) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const success = await deleteLead(leadToDelete.id, companyId);
      if (success) {
        setShowDeleteModal(false);
        setLeadToDelete(null);
        setSuccessMessage({
          title: "Success",
          message: `Lead "${leadToDelete.name}" has been successfully deleted.`,
        });
        setShowSuccessDialog(true);

        // After successful deletion, navigate back to leads list
        router.replace("/sales-crm/leads");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete lead";
      setDeleteError(errorMessage);
      console.error("Failed to delete lead:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setLeadToDelete(null);
    setDeleteError(null);
  };

  if (isLoading || storeLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Lead not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <DetailsSubNavbar
        onConvertClick={() => setIsAssignDialogOpen(true)}
        onDeleteClick={() => {
          setLeadToDelete({
            id: currentLead._id,
            name:
              currentLead.fullName ||
              `${currentLead.firstName} ${currentLead.lastName}`,
          });
          setShowDeleteModal(true);
        }}
      />

      <AssignLeadsDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        onAssign={async (email) => {
          try {
            await assignLead(id as string, email);
            setIsAssignDialogOpen(false);

            // Refresh lead data with companyId
            if (companyId) {
              await fetchLeadById(id as string, companyId);
            }

            setSuccessMessage({
              title: "Success",
              message: `Lead has been successfully assigned to ${email}.`,
            });
            setShowSuccessDialog(true);

            // Auto hide success message after 3 seconds
            setTimeout(() => {
              setShowSuccessDialog(false);
              setSuccessMessage({ title: "", message: "" });
            }, 3000);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Failed to assign lead"
            );
          }
        }}
        selectedCount={1}
      />

      {/* Success Dialog */}
      <ConfirmationDialog
        show={showSuccessDialog}
        title={successMessage.title}
        message={successMessage.message}
        onConfirm={() => {
          setShowSuccessDialog(false);
          setSuccessMessage({ title: "", message: "" });
        }}
        onCancel={() => {
          setShowSuccessDialog(false);
          setSuccessMessage({ title: "", message: "" });
        }}
        confirmText="OK"
        cancelText="Cancel"
        type="success"
      />

      {/* Delete Confirmation Dialog */}
      {leadToDelete && (
        <ConfirmationDialog
          show={showDeleteModal}
          title="Delete Lead"
          message={
            <>
              {deleteError ? (
                <div className="text-red-600 mb-4">{deleteError}</div>
              ) : (
                <>
                  Are you sure you want to delete <br />
                  <span className="font-medium">"{leadToDelete?.name}"</span>?
                </>
              )}
            </>
          }
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          type="danger"
          disableConfirm={isDeleting}
          disableCancel={isDeleting}
        />
      )}

      <div className="flex flex-1 h-full overflow-hidden">
        <DetailsSidebar
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
          onItemClick={(sectionId) => {
            scrollToSection(sectionId);
          }}
          activeSection={activeSection}
        />

        <div className="flex-1 overflow-auto transition-all duration-300">
          <div className="p-6 mx-auto space-y-5">
            <h1 className="text-lg font-semibold text-black">Lead Details</h1>
            <div
              id="lead-summary"
              ref={(el) => setSectionRef("lead-summary", el)}
              className="scroll-mt-16"
            >
              <LeadSummary lead={currentLead} />
            </div>
            <div
              id="lead-information"
              ref={(el) => setSectionRef("lead-information", el)}
              className="scroll-mt-16"
            >
              <LeadInformationPage lead={currentLead} />
            </div>
            <div
              id="notes-section"
              ref={(el) => setSectionRef("notes-section", el)}
              className="scroll-mt-16"
            >
              <NoteSection
                notes={
                  Array.isArray(currentLead.notes)
                    ? currentLead.notes
                    : []
                }
                leadId={currentLead._id}
              />
            </div>
            <div
              id="attachments-section"
              ref={(el) => setSectionRef("attachments-section", el)}
              className="scroll-mt-16"
            >
              <AttachmentSection
                attachments={currentLead.attachments || null}
                leadId={currentLead._id}
              />
            </div>
            <div
              id="open-activities-section"
              ref={(el) => setSectionRef("open-activities-section", el)}
              className="scroll-mt-16"
            >
              <OpenActivities leadId={currentLead._id} />
            </div>
            <div
              id="closed-activities-section"
              ref={(el) => setSectionRef("closed-activities-section", el)}
              className="scroll-mt-16"
            >
              <ClosedActivities leadId={currentLead._id} />
            </div>
            <div
              id="invited-meetings-section"
              ref={(el) => setSectionRef("invited-meetings-section", el)}
              className="scroll-mt-16"
            >
              <InvitedMeetings
                meetings={currentLead.openMeetings || []}
                leadId={currentLead._id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
