// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@/contexts/authContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cafeteria Portal | DAIICT", // Added DAIICT for context
  description: "Student-run Cafeteria Management Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Set the default theme for the entire application here
    <html lang="en" data-theme="studenthub" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
