import { TooltipProvider } from "@/components/atoms/Tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
