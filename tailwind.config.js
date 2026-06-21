// tailwind.config.js
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  // DaisyUI theme configuration
  daisyui: {
    themes: [
      {
        studenthub: {
          // Vibrant Teal for main interactive elements
          primary: "#009688",

          // Bright Coral for accents and secondary actions
          secondary: "#FF7043",

          // Accent can also be coral for emphasis
          accent: "#FF7043",

          // Charcoal for neutral elements like footers or card backgrounds
          neutral: "#212121",

          // Cool Light Grey for the main page background
          "base-100": "#ECEFF1",

          // Dark charcoal for readable text content
          "base-content": "#212121",

          // Standard utility colors
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
};
