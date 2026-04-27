import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur transition-all animate-in slide-in-from-right-full",
            t.variant === "destructive"
              ? "border-destructive bg-destructive/95 text-destructive-foreground"
              : "border-card-border bg-card/95 text-card-foreground",
            t.className,
          )}
        >
          <div className="flex-1 space-y-1">
            {t.title && (
              <div className="text-sm font-semibold leading-none">
                {t.title}
              </div>
            )}
            {t.description && (
              <div className="text-sm opacity-90">{t.description}</div>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="absolute right-2 top-2 rounded p-1 opacity-50 transition-opacity hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
