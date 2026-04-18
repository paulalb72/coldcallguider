import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "prisma/dev.db",
      "prisma/dev.db-*",
      "src/generated/**",
    ],
  },
];

export default config;
