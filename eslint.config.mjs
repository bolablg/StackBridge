import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "api/**",
      "legacy/**",
      "legal-auth/**",
    ],
  },
];

export default config;
