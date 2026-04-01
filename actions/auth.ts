"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/auth-db";
import { createSession, deleteSession } from "@/lib/session";

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(
  email: string,
  password: string
): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, error: "Email e senha são obrigatórios." };
  }

  const user = await findUserByEmail(email.trim());

  if (!user) {
    return { success: false, error: "Credenciais inválidas." };
  }

  // Verifica acesso ao ConsigPúblico
  if (!Array.isArray(user.acessos) || !user.acessos.includes("ConsigPublico")) {
    return { success: false, error: "Você não tem acesso a este sistema." };
  }

  // Verifica senha
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { success: false, error: "Credenciais inválidas." };
  }

  // Cria sessão JWT
  await createSession({
    sub: user.id,
    email: user.email,
    nome: user.nome ?? user.email,
  });

  return { success: true };
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
