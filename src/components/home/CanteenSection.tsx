"use client";

import React, { useState, useEffect, useRef } from "react";
// Using relative path to prevent alias resolution errors
import { getPublicCanteens, Canteen } from "../../services/publicService";
import CanteenCard from "./CanteenCard";

const CanteenSection: React.FC = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        const data = await getPublicCanteens();
        setCanteens(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCanteens();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Scroll by roughly the width of one card (w-80 is 320px) plus gap (24px)
      const scrollAmount = 344;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="canteens" className="py-16 bg-base-100">
      <div className="container mx-auto px-4 relative">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Explore Our <span className="text-primary">Canteens</span>
          </h2>
          <div className="h-1.5 w-20 bg-primary mt-4 rounded-full opacity-80"></div>
          <p className="text-base-content/70 mt-4 max-w-2xl text-lg">
            Discover a variety of dining options available on campus. Browse the
            list below to view menus, info, and more.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-dots loading-lg text-primary"></span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-error max-w-md mx-auto shadow-lg mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error: {error}</span>
          </div>
        )}

        {/* Canteen Slider */}
        {!loading && !error && canteens.length > 0 && (
          <div className="relative group px-2 md:px-8">
            {/* Left Arrow Button (Visible on Desktop Hover) */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-neutral shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex hover:scale-110"
              aria-label="Scroll Left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 py-6 px-2 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {canteens.map((canteen) => (
                <div
                  key={canteen.id}
                  className="flex-none w-full sm:w-80 snap-center transition-transform duration-300 hover:-translate-y-1"
                >
                  <CanteenCard canteen={canteen} />
                </div>
              ))}
            </div>

            {/* Right Arrow Button (Visible on Desktop Hover) */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-neutral shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex hover:scale-110"
              aria-label="Scroll Right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && canteens.length === 0 && (
          <div className="text-center py-16 bg-base-200/50 rounded-box border border-base-200">
            <p className="text-xl font-semibold text-base-content/60">
              No canteens available at the moment.
            </p>
            <p className="text-base-content/40 mt-2">
              Please check back later.
            </p>
          </div>
        )}
      </div>

      {/* Inline Styles to Hide Scrollbar but allow scrolling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default CanteenSection;
