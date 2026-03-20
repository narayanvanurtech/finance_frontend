"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import SendEmailModal from "@/components/finance/quotation/SendEmailModal";

import { handleSendEmail } from "@/api/sendEmailApi";


export default function QuotationEmailPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [open, setOpen] = useState(true);

  // Dummy data for demonstration
  const to = "";
  const cc = "";
  const subject = `Performa Invoice - ${quotationId} is awaiting your approval`;
  const id=quotationId;
  const message = `Dear Client,\n\nThank you for contacting us. Your quote can be viewed, printed and downloaded as needed.\n\nRegards,\nYour Company`;

  let token = null

if (typeof window !== "undefined") {
  token = localStorage.getItem("token")
}
  const handleSend = async (data: { to: string; cc: string; subject: string; message: string , id:string }) => {
    const {to,cc,subject,message,id} = data
       handleSendEmail(id,"send-perfomance",subject,message,cc,to)
    router.push(`/finance/performa-invoices`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SendEmailModal
      title="Send Performa-invoice Email"
        open={open}
        onClose={() => router.push(`/finance/performa-invoices/edit/${quotationId}`)}
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
