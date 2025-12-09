"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AddClientModal, {
  AddClientForm,
} from "@/components/finance/AddClientModal";
import { useClientStore, Client } from "@/stores/financeStore/useClientStore";
import { MoreHorizontal } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export default function ClientsPage() {
  const clients = useClientStore((state) => state.clients);
  const createClient = useClientStore((state) => state.createClient);
  const updateClient = useClientStore((state) => state.updateClient);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleAddClient = async (data: AddClientForm) => {
    try {
      await createClient({
        businessName: data.businessName,
        gstin: data.gstin,
        address: {
          street: data.street,
        },
        alias: data.alias || data.businessName,
        email: data.email,
      } as any);
      setAddClientModalOpen(false);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleEditClient = async (data: AddClientForm & { id?: number }) => {
    if (editingClient) {
      try {
        // Assuming companyId is available, you may need to get it from auth or context
        const companyId = ""; // TODO: Get from auth/context
        await updateClient(companyId, editingClient._id, {
          businessName: data.businessName,
          gstin: data.gstin,
          address: {
            street: data.street,
          },
          alias: data.alias || data.businessName,
          email: data.email,
        } as any);
        setEditingClient(null);
        setAddClientModalOpen(false);
      } catch (error) {
        console.error("Error updating client:", error);
      }
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setAddClientModalOpen(true);
  };

  const handleModalClose = () => {
    setAddClientModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div
      className="max-w-[98vw] w-full mx-auto rounded-md shadow-sm p-4 sm:p-6 md:p-8"
      style={{
        background: "var(--color-card)",
        color: "var(--color-card-foreground)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Clients
        </h1>
        <Button
          onClick={() => setAddClientModalOpen(true)}
          className="px-4 py-2 rounded font-medium text-sm hover:opacity-90 transition border border-[var(--color-primary)] shadow-sm"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
        >
          + New Client
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-[var(--color-border)] mt-6">
        <table
          className="min-w-full divide-y rounded-lg overflow-hidden text-sm"
          style={{ borderColor: "var(--color-border)" }}
        >
          <thead
            className="sticky top-0 z-10"
            style={{ background: "var(--color-muted)" }}
          >
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider rounded-tl-lg text-[var(--color-muted-foreground)]">
                #
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Name
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                GSTIN
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Address
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Contact
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Email
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider rounded-tr-lg text-[var(--color-muted-foreground)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ background: "var(--color-card)" }}>
            {clients.map((client, idx) => (
              <tr
                key={client._id}
                className={`transition-colors ${
                  idx % 2 === 0
                    ? "bg-[var(--color-card)]"
                    : "bg-[var(--color-muted)]/40"
                } hover:bg-[var(--color-muted)]/60 text-sm`}
              >
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                  {client.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-base">
                  {client.businessName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                  {client.gstin}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                  {client.address?.street || client.address?.city || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                  {client.alias || client.phone || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                  {client.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="p-1 rounded hover:bg-[var(--color-muted)] transition"
                        aria-label="More actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-32 p-1">
                      <button
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--color-muted)] rounded transition"
                        onClick={() => openEditModal(client)}
                      >
                        Edit
                      </button>
                      {/* Add more actions here if needed */}
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-[var(--color-muted-foreground)] text-xs"
                >
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddClientModal
        open={addClientModalOpen}
        onClose={handleModalClose}
        onSubmit={editingClient ? handleEditClient : handleAddClient}
        initialValues={
          editingClient
            ? {
                businessName: editingClient.businessName,
                gstin: editingClient.gstin,
                street: editingClient.address?.street || "",
                alias: editingClient.alias,
                email: editingClient.email,
              }
            : undefined
        }
        mode={editingClient ? "edit" : "add"}
      />
    </div>
  );
}
