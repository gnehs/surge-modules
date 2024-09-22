// rollup.config.mjs
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/weather-kit.js",
  output: [
    {
      file: "scripts/weather-kit.js",
    },
  ],
  plugins: [json(), commonjs(), nodeResolve(), terser()],
};
