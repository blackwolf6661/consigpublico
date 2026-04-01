import { type NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  COOKIE_OPTIONS,
  signSessionToken,
  type SessionPayload,
} from "@/lib/session";

const PROJECT_KEY = "ConsigPublico";

// Origem confiável do Hub — configurável via env var
const HUB_ORIGIN =
  process.env.HUB_ORIGIN ?? "https://carboncapital.vercel.app";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ssoToken = searchParams.get("sso_token");
  const hubOrigin = searchParams.get("hub_origin");

  // ─── Parâmetros obrigatórios ──────────────────────────────────────────────
  if (!ssoToken || !hubOrigin) {
    return NextResponse.redirect(
      new URL("/login?error=sso_params_missing", request.url)
    );
  }

  // ─── Validar origem (segurança) ───────────────────────────────────────────
  if (!hubOrigin.startsWith(HUB_ORIGIN)) {
    return NextResponse.redirect(
      new URL("/login?error=sso_untrusted_origin", request.url)
    );
  }

  try {
    // ─── Chamar validate-sso no Hub ─────────────────────────────────────────
    const res = await fetch(`${hubOrigin}/api/auth/validate-sso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: ssoToken, projectKey: PROJECT_KEY }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`validate-sso HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data.valid) {
      return NextResponse.redirect(
        new URL("/login?error=sso_invalid", request.url)
      );
    }

    // ─── Verificar acesso ao sistema ────────────────────────────────────────
    if (!Array.isArray(data.user?.acessos) || !data.user.acessos.includes(PROJECT_KEY)) {
      return NextResponse.redirect(
        new URL("/login?error=sso_no_access", request.url)
      );
    }

    // ─── Criar sessão local e redirecionar ──────────────────────────────────
    const payload: SessionPayload = {
      sub: data.user.id,
      email: data.user.email,
      nome: data.user.name ?? data.user.email,
    };

    const jwt = await signSessionToken(payload);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(SESSION_COOKIE, jwt, COOKIE_OPTIONS);
    return response;

  } catch (err) {
    console.error("[SSO] Erro ao validar token:", err);
    return NextResponse.redirect(
      new URL("/login?error=sso_error", request.url)
    );
  }
}
