import { Toast, type ToastActionElement, type ToastProps } from "@/components/ui/toast"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast as useToastPrimitive } from "@/components/ui/toast"

export const useToast = useToastPrimitive

export { Toast, ToastProvider, ToastViewport }

export type { ToastProps, ToastActionElement }
