import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-base/80 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={[
            'w-full bg-[var(--color-sidebar-bg)] border rounded-md px-3 py-2 text-sm text-base placeholder:text-muted',
            'outline-none transition-colors duration-150',
            'focus:border-accent focus:ring-1 focus:ring-accent/20',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-hairline',
            props.disabled ? 'bg-surface opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
