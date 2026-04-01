import { getSession } from "@/lib/session";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar nome={session?.nome} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
