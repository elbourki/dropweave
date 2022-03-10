import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import inject from "@rollup/plugin-inject";
import GlobalsPolyfills from "@esbuild-plugins/node-globals-polyfill";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      util: "rollup-plugin-node-polyfills/polyfills/util",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      "readable-stream": "rollup-plugin-node-polyfills/polyfills/stream",
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      _stream_duplex:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex",
      _stream_passthrough:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough",
      _stream_readable:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/readable",
      _stream_writable:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/writable",
      _stream_transform:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/transform",
      http: "rollup-plugin-node-polyfills/polyfills/http",
      https: "rollup-plugin-node-polyfills/polyfills/http",
      path: "rollup-plugin-node-polyfills/polyfills/path",
      querystring: "rollup-plugin-node-polyfills/polyfills/qs",
      punycode: "rollup-plugin-node-polyfills/polyfills/punycode",
      url: "rollup-plugin-node-polyfills/polyfills/url",
      assert: "rollup-plugin-node-polyfills/polyfills/assert",
      crypto: "crypto-browserify",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {},
      plugins: [
        GlobalsPolyfills({
          buffer: true,
        }),
      ],
    },
  },
  build: {
    target: "es2020",
    rollupOptions: {
      plugins: [inject({ Buffer: ["Buffer", "Buffer"] })],
    },
  },
});
