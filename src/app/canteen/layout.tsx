import React from "react";
// Changing to relative paths to ensure resolution regardless of alias config
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/home/Footer";

export default function CanteensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Main content area (where page.tsx or not-found.tsx renders) */}
      <Navbar />
      <main className="flex-grow">{children}</main>

      {/* Shared Footer for this section */}
      <Footer />
    </div>
  );
}
