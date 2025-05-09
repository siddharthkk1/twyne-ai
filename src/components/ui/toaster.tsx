
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  const positions = {
    "top-left": "top-0 left-0 flex-col",
    "top-center": "top-0 left-1/2 -translate-x-1/2 flex-col",
    "top-right": "top-0 right-0 flex-col",
    "bottom-left": "bottom-0 left-0 flex-col-reverse",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse",
    "bottom-right": "bottom-0 right-0 flex-col-reverse",
  }

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || "bottom-right"
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(toast)
    return acc
  }, {} as Record<string, typeof toasts>)

  return (
    <ToastProvider>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <ToastViewport
          key={position}
          className={`fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 ${positions[position as keyof typeof positions]} sm:flex-normal md:max-w-[420px]`}
        >
          {positionToasts.map(function ({ id, title, description, action, ...props }) {
            return (
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </Toast>
            )
          })}
        </ToastViewport>
      ))}
    </ToastProvider>
  )
}
