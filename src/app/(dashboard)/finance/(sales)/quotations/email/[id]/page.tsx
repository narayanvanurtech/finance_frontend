"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import SendEmailModal from "@/components/finance/quotation/SendEmailModal";
import axios from "axios";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";

export default function QuotationEmailPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [open, setOpen] = useState(true);

  // Dummy data for demonstration
  const to = "";
  const cc = "";
  const subject = `Quote - ${quotationId} is awaiting your approval`;
  const message = `Dear Client,\n\nThank you for contacting us. Your quote can be viewed, printed and downloaded as needed.\n\nRegards,\nYour Company`;

  const token = localStorage.getItem("token")
  const handleSend = async (data: { to: string; cc: string; subject: string; message: string }) => {
  const res =   await axiosInstance.post(`/api/v1/email/sendEmail`,data,{
      headers:{
        "Authorization":`Bearer ${token}`
      },
      withCredentials:true
    })

    console.log("send Email ...=>>>>",res)
    toast.success("Send Email Successfully !")
    alert("Email sent! (API integration pending)");
    router.push(`/finance/quotations`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SendEmailModal
        open={open}
        onClose={() => router.push(`/finance/quotations/edit/${quotationId}`)}
        to={to}
        cc={cc}
        subject={subject}
        message={message}
        onSend={handleSend}
      />
    </div>
  );
}
