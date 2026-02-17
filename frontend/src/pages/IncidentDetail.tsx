import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchIncident, updateIncident } from '../api/incidentApi'
import type { Incident, IncidentStatus, Severity } from '../types/incident'
import { formatDate } from '../utils/format'

const STATUSES: IncidentStatus[] = ['OPEN', 'MITIGATED', 'RESOLVED']
const SEVERITIES: Severity[] = ['SEV1', 'SEV2', 'SEV3', 'SEV4']

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchIncident(id)
      .then((data) => !cancelled && setIncident(data))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id])

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (!id || !incident) return
    setUpdating(true)
    updateIncident(id, { status: newStatus })
      .then((updated) => setIncident(updated))
      .catch((e) => setError(e.message))
      .finally(() => setUpdating(false))
  }

  const handleSeverityChange = (newSeverity: Severity) => {
    if (!id || !incident) return
    setUpdating(true)
    updateIncident(id, { severity: newSeverity })
      .then((updated) => setIncident(updated))
      .catch((e) => setError(e.message))
      .finally(() => setUpdating(false))
  }

  if (loading) return <p className="loading">Loading...</p>
  if (error || !incident) return <p className="error">{error ?? 'Incident not found'}</p>

  return (
    <div className="incident-detail">
      <header className="page-header">
        <h1>{incident.title}</h1>
        <div className="header-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to List
          </button>
        </div>
      </header>

      <div className="detail-grid">
        <dl>
          <dt>ID</dt>
          <dd><code>{incident.id}</code></dd>
          <dt>Service</dt>
          <dd>{incident.service}</dd>
          <dt>Severity</dt>
          <dd>
            <select
              value={incident.severity}
              onChange={(e) => handleSeverityChange(e.target.value as Severity)}
              disabled={updating}
              className="status-select"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </dd>
          <dt>Status</dt>
          <dd>
            <select
              value={incident.status}
              onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
              disabled={updating}
              className="status-select"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </dd>
          <dt>Owner</dt>
          <dd>{incident.owner ?? '—'}</dd>
          <dt>Created</dt>
          <dd>{formatDate(incident.createdAt)}</dd>
          <dt>Updated</dt>
          <dd>{formatDate(incident.updatedAt)}</dd>
        </dl>
        {incident.summary && (
          <div className="summary-block">
            <h3>Summary</h3>
            <p>{incident.summary}</p>
          </div>
        )}
      </div>
    </div>
  )
}
