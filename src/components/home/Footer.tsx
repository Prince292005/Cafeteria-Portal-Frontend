"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, ExternalLink } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="grain bg-[var(--espresso)] text-[var(--paper)]/90">
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12 md:gap-8">
        {/* Identity */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <Image
                src="/dau_logo.jpg"
                alt="DAU Logo"
                width={44}
                height={44}
                className="rounded-md object-contain"
              />
            </div>
            <div>
              <h3 className="font-display text-lg leading-tight">
                Dhirubhai Ambani University
              </h3>
              <p className="text-xs text-[var(--paper)]/55 mt-0.5">
                Cafeteria Management Committee
              </p>
            </div>
          </div>

          <p className="max-w-xs text-sm text-[var(--paper)]/60 leading-relaxed mt-1">
            Dedicated to providing fresh, healthy, and hygienic meals to the
            DAIICT community since 2001.
          </p>
        </div>

        {/* Quick access */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--paper)]/45 mb-4">
            Quick access
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <Link
                href="/complaints"
                className="text-[var(--paper)]/75 hover:text-[var(--turmeric)] transition-colors"
              >
                File a complaint
              </Link>
            </li>
            <li>
              <Link
                href="/complaints-history"
                className="text-[var(--paper)]/75 hover:text-[var(--turmeric)] transition-colors"
              >
                Check status
              </Link>
            </li>
            <li>
              <Link
                href="/feedback"
                className="text-[var(--paper)]/75 hover:text-[var(--turmeric)] transition-colors"
              >
                Share feedback
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--paper)]/45 mb-4">
            Contact
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a
                href="mailto:cafeteria-comm@daiict.ac.in"
                className="flex items-center gap-2 text-[var(--paper)]/75 hover:text-[var(--turmeric)] transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" /> cmc@dau.ac.in
              </a>
            </li>
            <li className="flex items-center gap-2 text-[var(--paper)]/75">
              <MapPin className="w-4 h-4 shrink-0" /> Gandhinagar, Gujarat
            </li>
            <li>
              <a
                href="https://www.daiict.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--turmeric)] hover:text-[var(--paper)] transition-colors"
              >
                Visit main website <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="hairline opacity-40" />

      {/* Copyright Bar */}
      <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row gap-2 justify-between items-center">
        <p className="text-xs text-[var(--paper)]/45">
          © {new Date().getFullYear()} DAU Cafeteria Portal. All rights
          reserved.
        </p>
        <p className="text-xs text-[var(--paper)]/30">
          Built by students, for students.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
