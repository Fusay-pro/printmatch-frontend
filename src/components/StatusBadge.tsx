import Badge from './ui/Badge'

const STATUS_MAP: Record<string, { label: string; variant: Parameters<typeof Badge>[0]['variant'] }> = {
  open:            { label: 'Open',        variant: 'blue' },
  in_progress:     { label: 'In Progress', variant: 'amber' },
  printing:        { label: 'Printing',    variant: 'brand' },
  shipped:         { label: 'Shipped',     variant: 'purple' },
  delivered:       { label: 'Delivered',   variant: 'emerald' },
  closed:          { label: 'Closed',      variant: 'gray' },
  failed:          { label: 'Failed',      variant: 'red' },
  disputed:        { label: 'Disputed',    variant: 'red' },
  cancelled:       { label: 'Cancelled',   variant: 'gray' },
  pending_acceptance: { label: 'Pending',  variant: 'blue' },
}

export default function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_MAP[status] || { label: status, variant: 'gray' as const }
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
