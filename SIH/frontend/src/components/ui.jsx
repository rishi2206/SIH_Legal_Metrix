export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary text-primary-text hover:bg-primary-hover',
    secondary:
      'bg-surface-secondary text-text-primary border border-border hover:bg-surface-subtle',
    outline: 'border border-border text-text-primary hover:bg-surface-secondary',
    danger: 'bg-status-noncompliant-text text-white hover:opacity-90',
    ghost: 'text-text-secondary hover:bg-surface-secondary',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-surface-secondary text-text-secondary border-border',
    compliant:
      'bg-status-compliant-bg text-status-compliant-text border-status-compliant-border',
    noncompliant:
      'bg-status-noncompliant-bg text-status-noncompliant-text border-status-noncompliant-border',
    review: 'bg-status-review-bg text-status-review-text border-status-review-border',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
        tones[tone] || tones.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Field({ label, children, hint, error }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-text-primary mb-1.5">{label}</span>
      )}
      {children}
      {hint && !error && <span className="block text-xs text-text-muted mt-1">{hint}</span>}
      {error && (
        <span className="block text-xs text-status-noncompliant-text mt-1">{error}</span>
      )}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent ${
        props.className || ''
      }`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent ${
        props.className || ''
      }`}
    >
      {props.children}
    </select>
  );
}

export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
    />
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-12 px-4">
      <p className="text-text-primary font-medium">{title}</p>
      {description && <p className="text-text-muted text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-status-noncompliant-border bg-status-noncompliant-bg text-status-noncompliant-text text-sm px-4 py-3">
      {message}
    </div>
  );
}
