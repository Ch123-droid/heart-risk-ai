import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#07070d", panel: "#0d0d16" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        beat: { "0%,100%": { transform: "scale(1)" }, "14%": { transform: "scale(1.14)" }, "28%": { transform: "scale(1)" }, "42%": { transform: "scale(1.09)" } },
        ring: { "0%": { transform: "scale(.8)", opacity: ".6" }, "100%": { transform: "scale(2.2)", opacity: "0" } },
      },
      animation: { float: "float 6s ease-in-out infinite", beat: "beat 1.6s ease-in-out infinite", ring: "ring 2.4s ease-out infinite" },
    },
  },
  plugins: [],
};
export default config;
