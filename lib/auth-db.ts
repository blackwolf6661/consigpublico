import { neon } from "@neondatabase/serverless";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  nome: string | null;
  role: string | null;
  acessos: string[];
};

/**
 * Busca usuário pelo e-mail na tabela `users` do banco de usuários.
 * Executado apenas em contexto Node.js (server action), nunca no Edge.
 */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const url = process.env.USERS_DATABASE_URL;
  if (!url) throw new Error("USERS_DATABASE_URL não definido");

  const sql = neon(url);
  const rows = (await sql`
    SELECT id, email, password_hash, nome, role, acessos
    FROM users
    WHERE LOWER(email) = LOWER(${email.trim()})
    LIMIT 1
  `) as UserRow[];
  return rows[0] ?? null;
}
