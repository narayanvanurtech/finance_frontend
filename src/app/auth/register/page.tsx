"use client";

import dynamic from "next/dynamic";

// ssr: false prevents server-side rendering — fixes "res is not defined"
// because RegisterPage uses localStorage, window, and browser APIs
const RegisterPage = dynamic(
  () => import("../../../components/auth/RegisterPage"), // your actual component path
  { ssr: false }
);

export default function Page() {
  return <RegisterPage />;
}