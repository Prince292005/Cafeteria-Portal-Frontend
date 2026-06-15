// /src/components/home/CanteenCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Canteen } from "@/services/publicService"; // Import type
const PLACEHOLDER_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjZTU1ZWRlIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiAvPjwvc3ZnPg==";
interface CanteenCardProps {
  canteen: Canteen;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CanteenCard: React.FC<CanteenCardProps> = ({ canteen }) => {
  return (
    // Use next/link to navigate to the dynamic canteen page
    <Link
      href={`/canteen/${canteen.id}`}
      className="card w-full bg-base-100 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
    >
      <figure className="h-48 relative">
        <img
          src={`${API_BASE_URL}${canteen.imageUrl}`} // Fallback if url is missing
          alt={canteen.canteenName}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{canteen.canteenName}</h2>
        <p className="text-sm text-base-content/70 truncate-2-lines">
          {canteen.info}
        </p>
        <div className="card-actions justify-end mt-2">
          <span className="btn btn-primary rounded-lg btn-sm">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CanteenCard;
