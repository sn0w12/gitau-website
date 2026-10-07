import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://gitau.dev",
    vite: {
        plugins: [tailwindcss()],
    },
});
