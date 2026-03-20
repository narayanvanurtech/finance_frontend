"use client";

import dynamic from "next/dynamic";

// ssr: false completely prevents server-side rendering of this page
const LoginPage = dynamic(
  () => import("../../../components/auth/LoginPage"), // your actual component
  { ssr: false }
);

export default function Page() {
  return <LoginPage />;
}