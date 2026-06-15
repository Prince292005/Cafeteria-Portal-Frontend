import React from "react";

// This is the layout for pages inside the (auth) group, like /login and /register.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full w-full items-center justify-center bg-gray-100 p-4">
      {children}
    </main>
  );
}
