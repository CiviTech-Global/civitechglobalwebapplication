import { createContext } from "react";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined,
);
