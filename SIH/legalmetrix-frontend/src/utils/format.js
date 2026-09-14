export function formatDate(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

export function formatDateTime(value) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Maps backend enum values to a Badge "tone" + display label
export function inspectionStatusTone(status) {
  switch (status) {
    case 'COMPLETED':
      return 'compliant';
    case 'FAILED':
      return 'noncompliant';
    case 'PROCESSING':
    default:
      return 'review';
  }
}

export function complianceResultTone(result) {
  switch (result) {
    case 'COMPLIANT':
      return 'compliant';
    case 'NON_COMPLIANT':
      return 'noncompliant';
    case 'NEEDS_REVIEW':
    default:
      return 'review';
  }
}

export function severityTone(severity) {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'noncompliant';
    case 'MEDIUM':
      return 'review';
    case 'LOW':
    default:
      return 'neutral';
  }
}

export function verificationTone(status) {
  return status === 'VERIFIED' ? 'compliant' : 'review';
}

export function userStatusTone(status) {
  switch (status) {
    case 'ACTIVE':
      return 'compliant';
    case 'DISABLED':
      return 'noncompliant';
    case 'INVITED':
    case 'PROFILE_INCOMPLETE':
    default:
      return 'review';
  }
}

export function humanizeEnum(value) {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
