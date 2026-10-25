import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EF",
        vanilla: "#F5E6C8",
        chocolate: { DEFAULT: "#4A2F23", light: "#7B5443" },
        berry: { DEFAULT: "#E8A0BF", dark: "#C97B9C" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: { soft: "0 10px 40px -10px rgba(74,47,35,0.18)" },
      borderRadius: { "4xl": "2rem" },
    },
  },
};
export default config;
