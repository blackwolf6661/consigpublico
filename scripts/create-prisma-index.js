const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../app/generated/prisma");
const file = path.join(dir, "index.ts");

if (fs.existsSync(dir)) {
  fs.writeFileSync(file, "export * from './client';\n");
  console.log("✓ app/generated/prisma/index.ts criado");
} else {
  console.error("✗ Diretório não encontrado:", dir);
  process.exit(1);
}
