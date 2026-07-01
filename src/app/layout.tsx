// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { UserProvider } from "@/contexts/authContext";
import { Toaster } from "react-hot-toast";

// Plus Jakarta Sans — body & UI text. Clean, humanist, reads as designed rather than generated.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

// Fraunces — editorial serif for display headings. Gives the site a premium,
// publication-grade feel rather than a generic SaaS-template look.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Cafeteria Portal | DAIICT",
  description: "Student-run Cafeteria Management Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={`${jakarta.variable} ${fraunces.variable}`}
    >
      <body className={jakarta.className}>
        <Toaster position="top-center" reverseOrder={false} />
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
