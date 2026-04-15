import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"]
      },
      colors: {
        ink: "#0f172a",
        ocean: "#0b4f6c",
        sand: "#f2e9dc",
        flare: "#ff6b35",
        mint: "#2ec4b6"
      },
      boxShadow: {
        card: "0 16px 60px -24px rgba(15, 23, 42, 0.45)"
      }
    }
  },
  plugins: []
} satisfies Config;
