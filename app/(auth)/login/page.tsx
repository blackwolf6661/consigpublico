import { LoginForm } from "@/components/auth/login-form";

const SSO_ERROR_MESSAGES: Record<string, string> = {
  sso_invalid:          "Token SSO inválido ou expirado. Faça login manualmente.",
  sso_error:            "Não foi possível conectar ao Hub. Faça login manualmente.",
  sso_params_missing:   "Parâmetros SSO inválidos. Faça login manualmente.",
  sso_untrusted_origin: "Origem não autorizada. Faça login manualmente.",
  sso_no_access:        "Sem permissão de acesso via Hub. Faça login manualmente.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const initialError = params.error
    ? (SSO_ERROR_MESSAGES[params.error] ?? "Erro de autenticação. Tente novamente.")
    : null;

  return <LoginForm initialError={initialError} />;
}
