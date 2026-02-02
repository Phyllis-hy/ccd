import Providers from "@/src/components/Providers";
import AppShell from "../AppShell"; 

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
