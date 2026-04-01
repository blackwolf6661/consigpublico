import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET não definido");
  return new TextEncoder().encode(s);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Rotas de API passam direto (incluindo /api/auth/sso) ────────────────
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // ─── SSO: detectar sso_token na URL e encaminhar para o route handler ─────
  const ssoToken = request.nextUrl.searchParams.get("sso_token");
  // hub_origin é opcional — se não vier, usa HUB_ORIGIN do env
  const hubOrigin =
    request.nextUrl.searchParams.get("hub_origin") ??
    process.env.HUB_ORIGIN ??
    "https://carboncapital.vercel.app";

  if (ssoToken && !token) {
    const ssoUrl = new URL("/api/auth/sso", request.url);
    ssoUrl.searchParams.set("sso_token", ssoToken);
    ssoUrl.searchParams.set("hub_origin", hubOrigin);
    return NextResponse.redirect(ssoUrl);
  }

  // ─── Rota de login: redireciona pra home se já autenticado ────────────────
  if (pathname.startsWith("/login")) {
    if (token) {
      try {
        await jwtVerify(token, secret());
        return NextResponse.redirect(new URL("/", request.url));
      } catch {
        /* token inválido — deixa passar */
      }
    }
    return NextResponse.next();
  }

  // ─── Demais rotas: exige autenticação ────────────────────────────────────
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret());
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
