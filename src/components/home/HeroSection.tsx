// src/components/home/HeroSection.tsx

import React from "react";
import { ChevronDown } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <div className="hero min-h-[70vh]">
      <div className="hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="hero-content text-center text-white">
        <div className="max-w-lg">
          <h1 className="mb-5 text-4xl font-extrabold md:text-6xl">
            Your Campus, Your Cafeteria
          </h1>
          <p className="mb-8 text-lg font-light">
            Explore daily menus, submit feedback, and file complaints. All in
            one place, managed by students, for students.
          </p>
          {/* Using btn-accent to make the main CTA pop */}
          <a href="#menu" className="btn btn-accent text-white rounded-sm">
            See Today's Menu
            <ChevronDown />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
