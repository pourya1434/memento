/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Cozy dark-navy palette taken from the reference design.
        ink: {
          900: "#222a33", // page background
          800: "#283039", // raised surface
          700: "#2f3842", // borders / hover
          600: "#3a4450",
        },
        accent: {
          // bright royal blue used for headings & links
          DEFAULT: "#3f78e0",
          soft: "#5b8ef0",
        },
        // warm coral for sub-headings, like the reference
        coral: "#e0655a",
        body: "#b9c0c9",
        muted: "#727d8a",
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        fa: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease both",
      },
    },
  },
  plugins: [],
};
