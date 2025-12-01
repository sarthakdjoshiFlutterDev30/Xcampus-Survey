import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';

export default function ChartPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartInstancesRef = useRef([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/records')
      .then(r => r.json())
      .then(json => {
        if (!mounted) return;
        if (!json || !json.success) {
          setError(json?.error || 'Failed to load records');
          setRows([]);
        } else {
          setRows(json.data || []);
        }
      })
      .catch(err => {
        console.error(err);
        if (!mounted) return;
        setError('Network error');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // wait until Chart global is available. If there are no rows, ensure
    // previous chart instances are destroyed and skip rendering.
    if (typeof window === 'undefined') return;
    const Chart = window.Chart;
    if (!Chart) return;
    if (!rows || rows.length === 0) {
      chartInstancesRef.current.forEach(inst => inst && inst.destroy && inst.destroy());
      chartInstancesRef.current = [];
      return;
    }
    // helper: destroy previous charts
    chartInstancesRef.current.forEach(inst => inst && inst.destroy && inst.destroy());
    chartInstancesRef.current = [];

    // compute counts
    const countBy = (arr, key) => {
      const map = {};
      arr.forEach(it => {
        const val = it[key] || 'N/A';
        map[val] = (map[val] || 0) + 1;
      });
      return map;
    };

    const featureCounts = countBy(rows, 'top_feature');
    const foodCounts = countBy(rows, 'food_interest');
    const attendanceCounts = countBy(rows, 'attendance_time');
    const deptCounts = countBy(rows, 'department');


    const makeChart = (id, type, labels, data, options = {}) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const ctx = el.getContext('2d');
      const cfg = {
        type,
        data: {
          labels,
          datasets: [{
            label: options.datasetLabel || 'Count',
            data,
            backgroundColor: options.backgroundColor,
            borderColor: options.borderColor || 'rgba(255,255,255,0.6)',
            borderWidth: options.borderWidth || 1,
          }]
        },
        options: Object.assign({}, {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-main)' } } },
          scales: { x: { ticks: { color: 'var(--text-main)' } }, y: { ticks: { color: 'var(--text-main)' }, beginAtZero: true } }
        }, options.chartOptions || {})
      };

      try {
        const instance = new Chart(ctx, cfg);
        chartInstancesRef.current.push(instance);
        return instance;
      } catch (e) {
        console.error('Chart render error', e);
        return null;
      }
    };

    // Build charts
    makeChart('chart-feature', 'bar', Object.keys(featureCounts), Object.values(featureCounts), { backgroundColor: 'rgba(59,130,246,0.7)' });
    makeChart('chart-food', 'pie', Object.keys(foodCounts), Object.values(foodCounts), { backgroundColor: ['#10B981','#F59E0B','#EF4444'] });
    makeChart('chart-attendance', 'doughnut', Object.keys(attendanceCounts), Object.values(attendanceCounts), { backgroundColor: ['#60A5FA','#818CF8','#A78BFA'] });
    makeChart('chart-dept', 'horizontalBar' in Chart.prototype ? 'bar' : 'bar', Object.keys(deptCounts), Object.values(deptCounts), { backgroundColor: 'rgba(99,102,241,0.7)' });

    return () => {
      chartInstancesRef.current.forEach(inst => inst && inst.destroy && inst.destroy());
      chartInstancesRef.current = [];
    };
  }, [rows]);

  return (
    <>
      <Head>
        <title>Charts — My Xampus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </Head>

      <div className="container" style={{ paddingBottom: 30 }}>
        <div className="header">
          <div className="logo-icon"><i className="fa-solid fa-chart-pie"></i></div>
          <h1>Data Visualizations</h1>
          <p className="subtitle">A few chart types based on collected responses</p>
        </div>

        <div style={{ padding: '0 30px 40px' }}>
          {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
          {error && <p style={{ color: '#ffcccb' }}>{error}</p>}

          {!loading && !error && (
            <div className="charts-grid">
              {(!rows || rows.length === 0) ? (
                <>
                  <div className="chart-card">
                    <h3>Top Feature (bar)</h3>
                    <div style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No records found</div>
                  </div>
                  <div className="chart-card">
                    <h3>Food Interest (pie)</h3>
                    <div style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No records found</div>
                  </div>
                  <div className="chart-card">
                    <h3>Attendance Time (doughnut)</h3>
                    <div style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No records found</div>
                  </div>
                  <div className="chart-card">
                    <h3>Department (bar)</h3>
                    <div style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No records found</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="chart-card"><h3>Top Feature (bar)</h3><canvas id="chart-feature" className="chart-canvas"></canvas></div>
                  <div className="chart-card"><h3>Food Interest (pie)</h3><canvas id="chart-food" className="chart-canvas"></canvas></div>
                  <div className="chart-card"><h3>Attendance Time (doughnut)</h3><canvas id="chart-attendance" className="chart-canvas"></canvas></div>
                  <div className="chart-card"><h3>Department (bar)</h3><canvas id="chart-dept" className="chart-canvas"></canvas></div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
