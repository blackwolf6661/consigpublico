import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Impede o Webpack de empacotar o Prisma 7 (WASM compiler + ESM)
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon"],

  // Força o Vercel a incluir os arquivos de runtime do Prisma no deploy.
  // O output file tracing não consegue rastrear estaticamente os
  // dynamic imports do WASM compiler dentro do @prisma/client.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/@prisma/client/runtime/**",
      "./node_modules/@prisma/adapter-neon/dist/**",
      "./node_modules/@neondatabase/serverless/dist/**",
    ],
  },
};

export default nextConfig;
