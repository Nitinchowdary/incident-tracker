import type { Incident, IncidentCreate, IncidentUpdate, PageResponse } from '../types/incident'

const BASE = '/api/incidents'

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val != null && val !== '') searchParams.set(key, String(val))
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export async function fetchIncidents(params: {
  page?: number
  size?: number
  sort?: string
  severity?: string
  status?: string
  search?: string
}): Promise<PageResponse<Incident>> {
  const res = await fetch(BASE + buildQuery(params))
  if (!res.ok) throw new Error('Failed to fetch incidents')
  return res.json()
}

export async function fetchIncident(id: string): Promise<Incident> {
  const res = await fetch(`${BASE}/${id}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('Incident not found')
    throw new Error('Failed to fetch incident')
  }
  return res.json()
}

export async function createIncident(data: IncidentCreate): Promise<Incident> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; errors?: Record<string, string> }
    if (err.errors && Object.keys(err.errors).length > 0) {
      const msgs = Object.entries(err.errors).map(([k, v]) => `${k}: ${v}`).join('; ')
      throw new Error(msgs)
    }
    throw new Error(err.message || 'Failed to create incident')
  }
  return res.json()
}

export async function updateIncident(id: string, data: IncidentUpdate): Promise<Incident> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    if (res.status === 404) throw new Error('Incident not found')
    throw new Error('Failed to update incident')
  }
  return res.json()
}
