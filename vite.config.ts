import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_PROXY_TARGET?.trim() || "http://127.0.0.1:8000";

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3011,
      host: true,
      proxy: {
        "/auth": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/library": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/admin": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
