import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://gitau.arathia.net",
    vite: {
        plugins: [tailwindcss()],
    },
});
