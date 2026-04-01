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

  // ─── Parâmetros obrigatórios ──────────────────────────────────────────────
  if (!ssoToken) {
    return NextResponse.redirect(
      new URL("/login?error=sso_params_missing", request.url)
    );
  }

  // Sempre usa HUB_ORIGIN do env — ignora hub_origin da URL para evitar
  // inconsistências (trailing slash, subdomínio, etc.)
  const hubOrigin = HUB_ORIGIN;
  console.log(`[SSO] Usando Hub: ${hubOrigin}`);

  try {
    // ─── Chamar validate-sso no Hub ─────────────────────────────────────────
    console.log(`[SSO] Validando token no Hub: ${hubOrigin}/api/auth/validate-sso`);

    const res = await fetch(`${hubOrigin}/api/auth/validate-sso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: ssoToken, projectKey: PROJECT_KEY }),
      cache: "no-store",
    });

    // Ler JSON independente do status HTTP (Hub retorna 401 para token inválido)
    let data: { valid: boolean; error?: string; user?: { id: string; email: string; name?: string; acessos?: string[]; role?: string } };
    try {
      data = await res.json();
    } catch {
      console.error(`[SSO] Resposta não-JSON do Hub (HTTP ${res.status})`);
      return NextResponse.redirect(new URL("/login?error=sso_error", request.url));
    }

    console.log(`[SSO] Resposta do Hub (HTTP ${res.status}):`, JSON.stringify(data));

    if (!data.valid) {
      console.warn(`[SSO] Token inválido pelo Hub: ${data.error}`);
      return NextResponse.redirect(
        new URL("/login?error=sso_invalid", request.url)
      );
    }

    // ─── Verificar acesso ao sistema ────────────────────────────────────────
    const acessos = data.user?.acessos ?? [];
    console.log(`[SSO] Acessos do usuário: ${JSON.stringify(acessos)}`);

    if (!acessos.includes(PROJECT_KEY)) {
      console.warn(`[SSO] Usuário sem acesso '${PROJECT_KEY}': ${data.user?.email}`);
      return NextResponse.redirect(
        new URL("/login?error=sso_no_access", request.url)
      );
    }

    // ─── Criar sessão local e redirecionar ──────────────────────────────────
    const payload: SessionPayload = {
      sub: data.user!.id,
      email: data.user!.email,
      nome: data.user!.name ?? data.user!.email,
    };

    console.log(`[SSO] Sessão criada para: ${payload.email}`);
    const jwt = await signSessionToken(payload);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(SESSION_COOKIE, jwt, COOKIE_OPTIONS);
    return response;

  } catch (err) {
    console.error("[SSO] Erro inesperado:", err);
    return NextResponse.redirect(
      new URL("/login?error=sso_error", request.url)
    );
  }
}
