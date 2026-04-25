import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium pointer-events-auto animate-in shadow-modal
              ${t.type === 'success' ? 'bg-base text-white' : ''}
              ${t.type === 'error' ? 'bg-danger text-white' : ''}
              ${t.type === 'info' ? 'bg-accent-2 text-white' : ''}
            `}
          >
            <span>
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {t.type === 'error' && <XCircle className="w-4 h-4" />}
              {t.type === 'info' && <Info className="w-4 h-4" />}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
