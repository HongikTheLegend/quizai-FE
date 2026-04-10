"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

interface AppProvidersProps {
  children: ReactNode;
}

const useBareChrome = (pathname: string): boolean =>
  pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register");

function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (useBareChrome(pathname)) {
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <AppChrome>{children}</AppChrome>
      </AuthGuard>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
