import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Rota de diagnóstico temporária — NÃO requer autenticação.
 * Acesse: https://consigpublico.vercel.app/api/debug
 * Retorna o erro real do Prisma/DB para facilitar debugging.
 * REMOVA este arquivo após resolver o problema.
 */
export async function GET() {
  const start = Date.now();
  try {
    const count = await prisma.convenio.count();
    return NextResponse.json({
      ok: true,
      count,
      ms: Date.now() - start,
      node: process.version,
      env: process.env.NODE_ENV,
    });
  } catch (err) {
    const error =
      err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            stack: err.stack?.split("\n").slice(0, 15).join("\n"),
            cause: (err as NodeJS.ErrnoException).cause ? String((err as NodeJS.ErrnoException).cause) : undefined,
          }
        : String(err);

    console.error("[/api/debug] Erro Prisma:", err);

    return NextResponse.json(
      {
        ok: false,
        error,
        ms: Date.now() - start,
        node: process.version,
        env: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      { status: 500 }
    );
  }
}
