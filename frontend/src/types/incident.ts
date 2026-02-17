export type Severity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'
export type IncidentStatus = 'OPEN' | 'MITIGATED' | 'RESOLVED'

export interface Incident {
  id: string
  title: string
  service: string
  severity: Severity
  status: IncidentStatus
  owner: string | null
  summary: string | null
  createdAt: string
  updatedAt: string
}

export interface IncidentCreate {
  title: string
  service: string
  severity: Severity
  status?: IncidentStatus
  owner: string
  summary?: string | null
}

export interface IncidentUpdate {
  status?: IncidentStatus
  severity?: Severity
  summary?: string | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
