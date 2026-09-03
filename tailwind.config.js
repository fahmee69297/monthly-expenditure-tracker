/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b12",
        panel: "#111521",
        panel2: "#171c2a",
        line: "#252b3b",
        muted: "#8f98ad",
        accent: "#8b5cf6",
        cyan: "#22d3ee",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,.25)",
      },
      animation: {
        loading: "loading 1.5s ease-in-out infinite",
      },
      keyframes: {
        loading: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
