"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useUser } from "@/contexts/authContext";
import { Power, LogIn, UserPlus, LayoutDashboard, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, loading, logout } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      logout();
      setIsOpen(false);
      toast.success("Logged out successfully");
      router.replace("/");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  // Close menu when clicking a link
  const closeMenu = () => setIsOpen(false);

  // Common button transition classes
  const btnTransition =
    "transition-all duration-200 ease-in-out active:scale-95";

  return (
    <div className="navbar bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 px-4 border-b border-base-200/50">
      {/* --- 1. NAVBAR HEADER (Logo + Mobile Toggle) --- */}
      <div className="flex-1 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold text-neutral hover:text-primary transition-colors tracking-tight"
          onClick={closeMenu}
        >
          <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
            <LayoutDashboard size={20} />
          </span>
          Cafeteria Portal
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="btn btn-ghost btn-circle md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- 2. DESKTOP MENU (Hidden on Mobile) --- */}
      <div className="flex-none hidden md:flex">
        {loading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-9 w-24 bg-base-200 rounded-full"></div>
            <div className="h-9 w-24 bg-base-200 rounded-full"></div>
          </div>
        ) : (
          <ul className="menu menu-horizontal items-center gap-3 px-1">
            {isAuthenticated ? (
              <>
                <li className="mr-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-base-100 border border-base-200 rounded-full cursor-default hover:bg-base-100">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-xs font-bold text-base-content/70 uppercase tracking-wide">
                      {user?.studentId}
                    </span>
                  </div>
                </li>

                {user?.role === "ROLE_ADMIN" && (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className={`btn btn-sm btn-neutral text-white rounded-full shadow-md shadow-neutral/20 ${btnTransition}`}
                    >
                      <LayoutDashboard size={16} />
                      <span className="hidden lg:inline">Admin Panel</span>
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    onClick={handleLogout}
                    className={`btn btn-sm btn-ghost rounded-full text-base-content/90 hover:text-red-500 hover:bg-error/10 border border-transparent hover:border-error/20 ${btnTransition}`}
                  >
                    <Power size={16} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className={`btn btn-sm btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-full px-5 ${btnTransition}`}
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className={`btn btn-sm btn-primary text-white rounded-full px-6 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 ${btnTransition}`}
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}
      </div>

      {/* --- 3. MOBILE MENU DROPDOWN --- */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-base-200 shadow-lg p-4 md:hidden animate-in slide-in-from-top-5 duration-200">
          <ul className="flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                {/* Mobile User Badge */}
                <li className="flex justify-center pb-2 border-b border-base-200">
                  <div className="flex items-center gap-2 px-4 py-2 bg-base-100 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="font-bold text-sm text-base-content/70">
                      {user?.studentId}
                    </span>
                  </div>
                </li>

                {user?.role === "ROLE_ADMIN" && (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMenu}
                      className="btn btn-neutral w-full rounded-xl text-white justify-start pl-6"
                    >
                      <LayoutDashboard size={18} />
                      Admin Dashboard
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost w-full rounded-xl text-error hover:bg-error/10 justify-start pl-6"
                  >
                    <Power size={18} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="btn btn-ghost w-full rounded-xl justify-start pl-6 text-base-content/80"
                  >
                    <LogIn size={18} />
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="btn btn-primary w-full rounded-xl text-white shadow-lg shadow-primary/20 justify-start pl-6"
                  >
                    <UserPlus size={18} />
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
