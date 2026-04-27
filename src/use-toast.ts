import * as React from "react";

type ToastVariant = "default" | "destructive";

export type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  className?: string;
  duration?: number;
};

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(toasts);
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function addToast(t: Omit<Toast, "id"> & { id?: string }) {
  const id = t.id ?? Math.random().toString(36).slice(2);
  const toast: Toast = { duration: 4000, ...t, id };
  toasts = [...toasts, toast];
  emit();
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => dismiss(id), toast.duration);
  }
  return { id, dismiss: () => dismiss(id) };
}

export function useToast() {
  const [list, setList] = React.useState<Toast[]>(toasts);

  React.useEffect(() => {
    const listener: Listener = (next) => setList(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    toasts: list,
    toast: addToast,
    dismiss,
  };
}

export const toast = addToast;
