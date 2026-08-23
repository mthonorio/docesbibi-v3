import type { OrderStatus } from "@/types/api";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/order-status";

interface OrderStatusTimelineProps {
  status: OrderStatus;
  className?: string;
}

/**
 * Stepper vertical com os 7 passos reais do fluxo de produção
 * (ORDER_STATUS_FLOW) — "cancelado" é tratado à parte por ser um estado
 * terminal alternativo, não mais um passo do stepper.
 */
export function OrderStatusTimeline({
  status,
  className = "",
}: OrderStatusTimelineProps) {
  if (status === "cancelado") {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl bg-red-50 p-4 ${className}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b91c1c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" />
        </svg>
        <span className="text-sm font-semibold text-red-700">
          Este pedido foi cancelado
        </span>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <div className={`flex flex-col ${className}`}>
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === ORDER_STATUS_FLOW.length - 1;

        return (
          <div key={step} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${
                  isDone
                    ? "bg-green-600"
                    : isCurrent
                      ? "bg-rosa-800"
                      : "bg-rosa-100"
                }`}
              >
                {isDone && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {isCurrent && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`min-h-[26px] w-0.5 flex-1 ${
                    isDone ? "bg-green-600" : "bg-rosa-100"
                  }`}
                />
              )}
            </div>
            <div className={isLast ? "pb-0" : "pb-5"}>
              <span
                className={`text-sm font-bold ${
                  isDone || isCurrent ? "text-marrom-900" : "text-marrom-400"
                }`}
              >
                {ORDER_STATUS_LABELS[step]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
