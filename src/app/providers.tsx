import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/atoms/Tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </SessionProvider>
  );
}
