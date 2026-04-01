import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cc_session";
const EXPIRES_SECONDS = 8 * 60 * 60; // 8 horas

export type SessionPayload = {
  sub: string;
  email: string;
  nome: string;
};

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET não definido");
  return new TextEncoder().encode(s);
}

// ─── Opções do cookie (reutilizadas no route handler SSO) ───────────────────

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: EXPIRES_SECONDS,
};

// ─── Assinar token JWT (reutilizado no route handler SSO) ─────────────────────

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_SECONDS}s`)
    .sign(secret());
}

// ─── Criar sessão (cookie HTTP-only) ─────────────────────────────────────────

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

// ─── Ler sessão (Server Component / Server Action) ────────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Apagar sessão ────────────────────────────────────────────────────────────

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ─── Verificar token (Edge-safe, usado no middleware) ─────────────────────────

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
