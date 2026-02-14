/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    // Ensure this points to your source code
    "./app/**/*.{js,tsx,ts,jsx}",
    // If you use a `src` directory, add: './src/**/*.{js,tsx,ts,jsx}'
    // Do the same with `components`, `hooks`, `styles`, or any other top-level directories
  ],
  theme: {
    extend: {
      colors: {
        background: "#fff",
        foreground: "#111",
        muted: "rgba(0,0,0,0.06)",
        "muted-foreground": "#666",
        accent: "#0066cc",
        border: "rgba(0,0,0,0.1)",
        overlay: "rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
