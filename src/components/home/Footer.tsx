"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ExternalLink,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral text-neutral-content">
      <div className="footer p-10 container mx-auto">
        <aside className="flex flex-col gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              {/* Ensure dau_logo.jpg exists in your /public folder */}
              <Image
                src="/dau_logo.jpg"
                alt="DAU Logo"
                width={100}
                height={100}
                className="rounded-md object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-xl tracking-tight">
                Dhirubhai Ambani University
              </h3>
              <p className="text-xs opacity-70">
                Cafeteria Management Committee (CMC)
              </p>
            </div>
          </div>

          <p className="max-w-xs text-sm opacity-80 leading-relaxed mt-2">
            Dedicated to providing fresh, healthy, and hygienic meals to the
            DAIICT community since 2001.
          </p>
        </aside>

        <nav>
          <header className="footer-title text-white opacity-100">
            Quick Access
          </header>
          <Link
            href="/complaints"
            className="link link-hover flex items-center gap-2"
          >
            File a Complaint
          </Link>
          <Link
            href="/complaints-history"
            className="link link-hover flex items-center gap-2"
          >
            Check Status
          </Link>
          <Link
            href="/feedback"
            className="link link-hover flex items-center gap-2"
          >
            Share Feedback
          </Link>
        </nav>

        <nav>
          <header className="footer-title text-white opacity-100">
            Contact Us
          </header>
          <a
            href="mailto:cafeteria-comm@daiict.ac.in"
            className="link link-hover flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> cmc@dau.ac.in
          </a>
          <a className="flex items-center gap-2 cursor-default">
            <MapPin className="w-4 h-4" /> Gandhinagar, Gujarat
          </a>
          <a
            href="https://www.daiict.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover flex items-center gap-2 mt-2 text-primary-content/80"
          >
            Visit Main Website <ExternalLink className="w-3 h-3" />
          </a>
        </nav>
      </div>

      {/* Copyright Bar */}
      <div className="footer px-10 py-4 border-t border-neutral-content/10 bg-neutral-focus text-neutral-content flex flex-col md:flex-row justify-between items-center">
        <aside>
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} DAU Cafeteria Portal. All rights
            reserved.
          </p>
        </aside>
      </div>
    </footer>
  );
};

export default Footer;
