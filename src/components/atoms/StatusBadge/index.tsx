import type { OrderStatus } from "@/types/api";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/order-status";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { bg, text } = ORDER_STATUS_COLORS[status];

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
