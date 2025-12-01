import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function TablePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resettingIds, setResettingIds] = useState([]);
  const [resetDoneIds, setResetDoneIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/records');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load');
      setRows(json.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  function downloadCSV() {
    if (!rows || rows.length === 0) return;
    const headers = ['Time','Name','Department','Semester','Attendance','Food','Top Feature','Suggestions'];
    const csvRows = [headers.join(',')];
    rows.forEach(r => {
      const cols = [
        r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
        (r.fullname || ''),
        (r.department || ''),
        (r.semester || ''),
        (r.attendance_time || ''),
        (r.food_interest || ''),
        (r.top_feature || ''),
        (r.suggestions || '')
      ];
      const escaped = cols.map(c => {
        const s = String(c).replace(/"/g, '""');
        if (s.search(/[,"\n]/) >= 0) return `"${s}"`;
        return s;
      });
      csvRows.push(escaped.join(','));
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    a.download = `responses-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleResetIp(id) {
    if (!confirm('Reset IP for this record? This allows that IP to submit again.')) return;
    setResettingIds(prev => [...prev, id]);
    try {
      const res = await fetch('/api/reset-ip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Reset failed');
      setResetDoneIds(prev => [...prev, id]);
      await fetchRecords();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to reset IP');
    } finally {
      setResettingIds(prev => prev.filter(x => x !== id));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    setDeletingIds(prev => [...prev, id]);
    try {
      const res = await fetch('/api/delete-record', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Delete failed');
      setDeletedIds(prev => [...prev, id]);
      // refresh table
      await fetchRecords();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete record');
    } finally {
      setDeletingIds(prev => prev.filter(x => x !== id));
    }
  }

  return (
    <>
      <Head>
        <title>Responses — My Xampus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container" style={{ paddingBottom: 30 }}>
        <div className="header">
          <div className="logo-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <h1>Submitted Responses</h1>
          <p className="subtitle">Read-only table of all submissions (reset IP available)</p>
        </div>

        <div style={{ padding: '0 30px 30px' }}>
          {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
          {error && <p style={{ color: '#ffcccb' }}>{error}</p>}

          {!loading && !error && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 12 }}>
                <button className="download-btn" onClick={downloadCSV} aria-label="Download responses as CSV">Download CSV</button>
              </div>

              <div className="table-wrap">
                <table className="responses-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Name</th>
                      <th>Dept</th>
                      <th>Sem</th>
                      <th>Attendance</th>
                      <th>Food</th>
                      <th>Top Feature</th>
                      <th>Suggestions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr><td colSpan={9} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No responses yet</td></tr>
                    )}
                    {rows.map(r => (
                      <tr key={r.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                        <td>{r.fullname || '-'}</td>
                        <td>{r.department}</td>
                        <td>{r.semester}</td>
                        <td>{r.attendance_time}</td>
                        <td>{r.food_interest}</td>
                        <td>{r.top_feature}</td>
                        <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.suggestions || '-'}</td>
                        <td style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button
                            className="action-btn"
                            onClick={() => handleResetIp(r.id)}
                            disabled={resettingIds.includes(r.id) || resetDoneIds.includes(r.id)}
                            title="Reset IP"
                          >
                            {resettingIds.includes(r.id) ? 'Resetting…' : (resetDoneIds.includes(r.id) ? 'Reset' : 'Reset')}
                          </button>
                          <button
                            className="danger-btn"
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingIds.includes(r.id) || deletedIds.includes(r.id)}
                            title="Delete record"
                          >
                            {deletingIds.includes(r.id) ? 'Deleting…' : (deletedIds.includes(r.id) ? 'Deleted' : 'Delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Card view for small screens - mirrors table data */}
              <div className="table-cards" aria-hidden={rows.length === 0}>
                {rows.length === 0 ? (
                  <div className="table-card"><div className="pair"><div className="label">Info</div><div className="value">No responses yet</div></div></div>
                ) : rows.map(r => (
                  <div key={r.id} className="table-card">
                    <div className="pair"><div className="label">Time</div><div className="value">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</div></div>
                    <div className="pair"><div className="label">Name</div><div className="value">{r.fullname || '-'}</div></div>
                    <div className="pair"><div className="label">Dept</div><div className="value">{r.department}</div></div>
                    <div className="pair"><div className="label">Sem</div><div className="value">{r.semester}</div></div>
                    <div className="pair"><div className="label">Attendance</div><div className="value">{r.attendance_time}</div></div>
                    <div className="pair"><div className="label">Food</div><div className="value">{r.food_interest}</div></div>
                    <div className="pair"><div className="label">Feature</div><div className="value">{r.top_feature}</div></div>
                    <div className="pair"><div className="label">Suggestions</div><div className="value">{r.suggestions || '-'}</div></div>
                    <div className="actions">
                      <button
                        className="action-btn"
                        onClick={() => handleResetIp(r.id)}
                        disabled={resettingIds.includes(r.id) || resetDoneIds.includes(r.id)}
                        title="Reset IP"
                      >{resettingIds.includes(r.id) ? 'Resetting…' : (resetDoneIds.includes(r.id) ? 'Reset' : 'Reset')}</button>
                      <button
                        className="danger-btn"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingIds.includes(r.id) || deletedIds.includes(r.id)}
                        title="Delete record"
                      >{deletingIds.includes(r.id) ? 'Deleting…' : (deletedIds.includes(r.id) ? 'Deleted' : 'Delete')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
 
