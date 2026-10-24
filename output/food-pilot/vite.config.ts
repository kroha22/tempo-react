import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({root:fileURLToPath(new URL(".",import.meta.url)),publicDir:fileURLToPath(new URL("../../public",import.meta.url)),plugins:[react()],resolve:{alias:{"@":fileURLToPath(new URL("../..",import.meta.url))}},server:{host:"127.0.0.1",port:4178}});
