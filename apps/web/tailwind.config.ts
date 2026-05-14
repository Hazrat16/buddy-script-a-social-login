import type { Config } from "tailwindcss";
export default {
    darkMode: "class",
    content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
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
            boxShadow: {
                soft: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
                card: "0 4px 24px -4px rgb(15 23 42 / 0.08), 0 0 0 1px rgb(15 23 42 / 0.04)",
                "card-dark": "0 4px 24px -4px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(255 255 255 / 0.06)",
            },
            backgroundImage: {
                "mesh-light": "radial-gradient(at 40% 20%, rgb(224 231 255 / 0.5) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(219 234 254 / 0.4) 0px, transparent 45%), radial-gradient(at 0% 50%, rgb(238 242 255 / 0.6) 0px, transparent 50%)",
                "mesh-dark": "radial-gradient(at 40% 20%, rgb(49 46 129 / 0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(30 27 75 / 0.4) 0px, transparent 45%), radial-gradient(at 0% 50%, rgb(15 23 42 / 0.9) 0px, transparent 55%)",
            },
        },
    },
    plugins: [],
} satisfies Config;
