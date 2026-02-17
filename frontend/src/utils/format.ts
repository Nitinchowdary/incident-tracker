export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function severityColor(_: string): string {
  return ''
}

export function statusColor(_: string): string {
  return ''
}
