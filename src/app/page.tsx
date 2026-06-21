"use client";

import React from "react"; // Relative imports to prevent build errors
import InfoSection from "../components/home/InfoSection";
import Navbar from "../components/navbar/navbar";
import Footer from "../components/home/Footer";
import CanteenSection from "../components/home/CanteenSection";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <Navbar />
      <main className="flex-grow">
        {/* Canteen Section with Carousel */}
        <CanteenSection />

        {/* Info Section */}
        <InfoSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
