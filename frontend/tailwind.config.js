export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50:  "#eef2ff",   
          100: "#e0e7ff",  
          200: "#c7d2fe",   
          300: "#a5b4fc",   
          400: "#818cf8",   
          500: "#6366f1",   
          600: "#4f46e5",  
          700: "#4338ca",   
          800: "#3730a3",   
          900: "#312e81",   
          950: "#1e1b4b",   
        },
        status: {
          wishlist:     "#94a3b8",  
          applied:      "#6366f1", 
          interviewing: "#f59e0b",   
          offered:      "#22c55e",   
          rejected:     "#ef4444",   
        },
      },
      backgroundColor: ({ theme }) => ({
        surface:  theme("colors.slate.900"),  
        card:     theme("colors.slate.800"),  
        overlay:  theme("colors.slate.700"),  
        input:    theme("colors.slate.800"),  
        sidebar:  theme("colors.slate.950"),  
      }),
      boxShadow: {
        "glow-indigo": "0 0 20px 4px rgba(99, 102, 241, 0.35)",
        "glow-green":  "0 0 20px 4px rgba(34, 197, 94, 0.30)",
        "glow-amber":  "0 0 20px 4px rgba(245, 158, 11, 0.30)",

        "glass": "0 4px 24px 0 rgba(0, 0, 0, 0.40)",
      },
      borderRadius: {
        "xl":  "0.75rem",   
        "2xl": "1rem",      
        "3xl": "1.5rem",   
      },

      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "fade-in":  "fade-in 0.2s ease-out both",
        "slide-up": "slide-up 0.25s ease-out both",
        "shimmer":  "shimmer 1.6s linear infinite",
      },
    },
  },

  plugins: [],
};
