import { useState, useEffect } from 'react'
import { fetchIncidents, createIncident, fetchIncident, updateIncident } from '../api/incidentApi'
import type { Incident, IncidentCreate, Severity, IncidentStatus } from '../types/incident'
import { formatDate } from '../utils/format'

const SEVERITIES: Severity[] = ['SEV1', 'SEV2', 'SEV3', 'SEV4']
const STATUSES: IncidentStatus[] = ['OPEN', 'MITIGATED', 'RESOLVED']

const initialForm: IncidentCreate = {
  title: '',
  service: '',
  severity: 'SEV3',
  status: 'OPEN',
  owner: '',
  summary: '',
}

export default function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [sort, setSort] = useState('createdAt,desc')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [status, setStatus] = useState<IncidentStatus | ''>('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<IncidentCreate>(initialForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailUpdating, setDetailUpdating] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchIncidents({
      page,
      size,
      sort,
      severity: severity || undefined,
      status: status || undefined,
      search: debouncedSearch.trim() || undefined,
    })
      .then((res) => {
        if (!cancelled) {
          setIncidents(res.content)
          setTotalPages(res.totalPages)
          setTotalElements(res.totalElements)
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [page, size, sort, severity, status, debouncedSearch, refreshKey])

  const openModal = () => {
    setModalOpen(true)
    setForm(initialForm)
    setFormError(null)
  }

  const closeModal = () => setModalOpen(false)

  const openDetailModal = (id: string) => {
    setDetailModalOpen(true)
    setDetailIncident(null)
    setDetailLoading(true)
    fetchIncident(id)
      .then((inc) => setDetailIncident(inc))
      .catch(() => setDetailIncident(null))
      .finally(() => setDetailLoading(false))
  }

  const closeDetailModal = () => setDetailModalOpen(false)

  const handleDetailStatusChange = (newStatus: IncidentStatus) => {
    if (!detailIncident) return
    setDetailUpdating(true)
    updateIncident(detailIncident.id, { status: newStatus })
      .then((updated) => setDetailIncident(updated))
      .finally(() => setDetailUpdating(false))
  }

  const handleDetailSeverityChange = (newSeverity: Severity) => {
    if (!detailIncident) return
    setDetailUpdating(true)
    updateIncident(detailIncident.id, { severity: newSeverity })
      .then((updated) => setDetailIncident(updated))
      .finally(() => setDetailUpdating(false))
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)
    createIncident({
      ...form,
      owner: form.owner?.trim() ?? '',
      summary: form.summary?.trim() || null,
    })
      .then(() => {
        closeModal()
        setRefreshKey((k) => k + 1)
      })
      .catch((err) => setFormError(err.message))
      .finally(() => setFormLoading(false))
  }

  return (
    <div className="incident-list">
      <header className="page-header">
        <h1>Incident Tracker</h1>
        <button type="button" className="btn btn-primary" onClick={openModal}>
          + New Incident
        </button>
      </header>

      <div className="filters">
        <input
          type="search"
          placeholder="Search title, service, owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={severity} onChange={(e) => { setSeverity(e.target.value as Severity | ''); setPage(0) }}>
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as IncidentStatus | ''); setPage(0) }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }}>
          <option value="createdAt,desc">Newest first</option>
          <option value="createdAt,asc">Oldest first</option>
          <option value="severity,asc">Severity (low→high)</option>
          <option value="title,asc">Title A–Z</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && incidents.length === 0 ? (
        <p className="loading">Loading...</p>
      ) : incidents.length === 0 ? (
        <p className="empty">No incidents found.</p>
      ) : (
        <>
          <div className={`table-wrapper ${loading ? 'table-loading' : ''}`}>
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Service</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Actions</th>
                  <th>Summary</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.id}>
                    <td>{i.title}</td>
                    <td>{i.service}</td>
                    <td><span className={`badge severity-${i.severity.toLowerCase()}`}>{i.severity}</span></td>
                    <td><span className={`badge status-${i.status.toLowerCase()}`}>{i.status}</span></td>
                    <td>{i.owner ?? '—'}</td>
                    <td>
                      <button type="button" className="btn-link" onClick={() => openDetailModal(i.id)}>
                        View / Update
                      </button>
                    </td>
                    <td className="summary-cell" title={i.summary ?? undefined}>{i.summary ?? '—'}</td>
                    <td>{formatDate(i.createdAt)}</td>
                    <td>{formatDate(i.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>Page {page + 1} of {totalPages || 1} ({totalElements} total)</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Incident</h2>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>
            {formError && <p className="error">{formError}</p>}
            <form onSubmit={handleCreate} className="incident-form incident-form-two-col">
              <div className="form-group">
                <label htmlFor="modal-title">Title *</label>
                <input id="modal-title" required maxLength={255} value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="modal-service">Service *</label>
                <input id="modal-service" required maxLength={100} value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="modal-severity">Severity *</label>
                <select id="modal-severity" value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}>
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modal-status">Status</label>
                <select id="modal-status" value={form.status ?? 'OPEN'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as IncidentStatus })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modal-owner">Owner *</label>
                <input id="modal-owner" required maxLength={100} value={form.owner ?? ''}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })} />
              </div>
              <div className="form-group form-group-full">
                <label htmlFor="modal-summary">Summary</label>
                <textarea id="modal-summary" rows={3} maxLength={2000} value={form.summary ?? ''}
                  onChange={(e) => setForm({ ...form, summary: e.target.value || null })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailModalOpen && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Incident Details</h2>
              <button type="button" className="modal-close" onClick={closeDetailModal} aria-label="Close">
                ×
              </button>
            </div>
            {detailLoading ? (
              <p className="loading">Loading...</p>
            ) : detailIncident ? (
              <div className="detail-modal-content detail-modal-two-col">
                <div className="detail-field">
                  <dt>Title</dt>
                  <dd>{detailIncident.title}</dd>
                </div>
                <div className="detail-field">
                  <dt>Service</dt>
                  <dd>{detailIncident.service}</dd>
                </div>
                <div className="detail-field">
                  <dt>Severity</dt>
                  <dd>
                    <select
                      value={detailIncident.severity}
                      onChange={(e) => handleDetailSeverityChange(e.target.value as Severity)}
                      disabled={detailUpdating}
                      className="status-select"
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div className="detail-field">
                  <dt>Status</dt>
                  <dd>
                    <select
                      value={detailIncident.status}
                      onChange={(e) => handleDetailStatusChange(e.target.value as IncidentStatus)}
                      disabled={detailUpdating}
                      className="status-select"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div className="detail-field">
                  <dt>Owner</dt>
                  <dd>{detailIncident.owner ?? '—'}</dd>
                </div>
                <div className="summary-block detail-field-full">
                  <label htmlFor="detail-summary">Summary</label>
                  <textarea
                    id="detail-summary"
                    rows={4}
                    maxLength={2000}
                    value={detailIncident.summary ?? ''}
                    onChange={(e) => setDetailIncident({ ...detailIncident, summary: e.target.value || null })}
                    onBlur={(e) => {
                      const val = e.target.value.trim()
                      setDetailUpdating(true)
                      updateIncident(detailIncident.id, { summary: val })
                        .then((updated) => setDetailIncident(updated))
                        .finally(() => setDetailUpdating(false))
                    }}
                    disabled={detailUpdating}
                    placeholder="Add or edit summary..."
                  />
                </div>
                <div className="form-actions" style={{ marginTop: '1rem' }}>
                  <button type="button" className="btn btn-primary" onClick={() => { closeDetailModal(); setRefreshKey((k) => k + 1) }}>
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <p className="error">Failed to load incident.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
