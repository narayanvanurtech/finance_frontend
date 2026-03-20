import type { Metadata } from "next";
import { Inter, Fira_Mono } from "next/font/google";
import "../globals.css";
import LenisProvider from "@/components/Common/LenisProvider";
import Header from "@/components/Common/Header";
import Faq from "@/components/Common/Faq";

import FloatingChatButton from "@/components/Common/FloatingChatButton";
import Footer from "@/components/Common/Footer";

// import PushNotificationProvider from "@/components/common/PushNotificationProvider";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const firaMono = Fira_Mono({
  variable: "--font-fira-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "VTM CRM",
  description: "A CRM for VTM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <PushNotificationProvider /> */}
      <LenisProvider/>
      <Header />
      {children}
      <Faq/>
      <Footer />
      <FloatingChatButton />
    </>
  );
}
