"use client";

// UPDATED: Changed paths to be relative
import { useUser } from "@/contexts/authContext";
import Navbar from "@/components/navbar/navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Error from "next/error";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything until auth state is loaded
    if (loading || false) {
      return;
    }

    // 1. If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // 2. If authenticated but not an ADMIN, redirect to homepage
    // This is the crucial role-based access control check
    if (user?.role !== "ROLE_ADMIN") {
      router.push("/"); // Or you could show a "/unauthorized" page
      return;
    }

    // 3. If authenticated AND an ADMIN, they can stay
  }, [isAuthenticated, user, loading, router]);

  // Show a loading state while we verify the user's role
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-lg loading-spinner"></span>
      </div>
    );
  }

  // If user is authenticated and is an Admin, show the admin page.
  // We also check 'isAuthenticated' and 'user?.role' again as a final check
  // to prevent a flash of content before the useEffect redirect can happen.
  if (isAuthenticated && user?.role === "ROLE_ADMIN") {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {/* All admin pages will be rendered here */}
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  // Fallback: show nothing or a loader while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="loading loading-lg loading-spinner"></span>
    </div>
  );
}
