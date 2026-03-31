import { createContext, useContext, useState, type ReactNode } from "react"

interface Toast {
   id: number
   type: "success" | "error"
   message: string
}

interface ToastContextValue {
   showToast: (type: "success" | "error", message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
   return useContext(ToastContext)
}

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
   const [toasts, setToasts] = useState<Toast[]>([])

   const showToast = (type: "success" | "error", message: string) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => {
         setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
   }

   return (
      <ToastContext.Provider value={{ showToast }}>
         {children}
         <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
               <div
                  key={toast.id}
                  className={`px-4 py-3 rounded-[8px] border text-sm font-medium max-w-[360px] ${
                     toast.type === "success"
                        ? "bg-green-dim border-green text-green"
                        : "bg-red-dim border-red text-red"
                  }`}
               >
                  {toast.message}
               </div>
            ))}
         </div>
      </ToastContext.Provider>
   )
}
