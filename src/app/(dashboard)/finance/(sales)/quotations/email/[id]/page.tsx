"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import SendEmailModal from "@/components/finance/quotation/SendEmailModal";

import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { handleSendEmail } from "@/api/sendEmailApi";


export default function QuotationEmailPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [open, setOpen] = useState(true);

  // Dummy data for demonstration
  const to = "";
  const cc = "";
  const subject = `Quote - ${quotationId} is awaiting your approval`;
  const id=quotationId;
  const message = `Dear Client,\n\nThank you for contacting us. Your quote can be viewed, printed and downloaded as needed.\n\nRegards,\nYour Company`;

  const handleSend = async (data: { to: string; cc: string; subject: string; message: string , id:string }) => {
    const {to,cc,subject,message,id} = data
       handleSendEmail(id,"send-quotation",subject,message,cc,to)
    router.push(`/finance/quotations`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SendEmailModal
      title="Send Quotation Email"
        open={open}
        onClose={() => router.push(`/finance/quotations/edit/${quotationId}`)}
        to={to}
        cc={cc}
        id={id}
        subject={subject}
        message={message}
        onSend={handleSend}
      />
    </div>
  );
}
