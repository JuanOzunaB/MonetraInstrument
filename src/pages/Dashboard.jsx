import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import api from '../services/api.js';

Chart.register(...registerables);
Chart.defaults.color = '#64748B';
Chart.defaults.borderColor = '#E5E5EA';

const TYPE_BADGE  = { user: 'badge-user', benchmark: 'badge-expert' };
const TYPE_LABEL  = { user: 'Usuario', benchmark: 'Técnico' };

const RATING_KEYS = ['feat_voice_accuracy','feat_voice_ease','feat_scan_accuracy','feat_tts_natural','feat_email_useful'];
const RATING_LBLS = ['Precisión voz','Facilidad voz','Precisión escaneo','Naturalidad TTS','Utilidad email'];

const FEAT_KEYS = ['feature_manual_entry','feature_export_csv','feature_loans','feature_budgets','feature_weekly_summary','feature_widget','feature_ai_insights'];
const FEAT_LBLS = ['Entrada manual','Export CSV','Préstamos/deudas','Presupuestos','Resumen periódico','Widget','Análisis de hábitos'];

const INPUT_PREF_ORDER = ['voice_only','mostly_voice','half_half','mostly_manual','manual_only'];
const INPUT_PREF_LBLS  = { voice_only: 'Solo voz', mostly_voice: 'Principalmente voz', half_half: 'Mitad y mitad', mostly_manual: 'Principalmente escrito', manual_only: 'Solo escrito' };


function useChart(ref, config) {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current || !config) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ref.current, config);
    return () => { chartRef.current?.destroy(); };
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps
}

function avg(vals) {
  const nz = vals.filter(v => v > 0);
  return nz.length ? +(nz.reduce((a, b) => a + b, 0) / nz.length).toFixed(1) : null;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [data,    setData]    = useState(null);

  const ratingsRef   = useRef(null);
  const featWantRef  = useRef(null);
  const inputPrefRef = useRef(null);
  const loanRef      = useRef(null);
  const latencyRef   = useRef(null);

  const [ratingsConfig,   setRatingsConfig]   = useState(null);
  const [featWantConfig,  setFeatWantConfig]  = useState(null);
  const [inputPrefConfig, setInputPrefConfig] = useState(null);
  const [loanConfig,      setLoanConfig]      = useState(null);
  const [latencyConfig,   setLatencyConfig]   = useState(null);

  useChart(ratingsRef,   ratingsConfig);
  useChart(featWantRef,  featWantConfig);
  useChart(inputPrefRef, inputPrefConfig);
  useChart(loanRef,      loanConfig);
  useChart(latencyRef,   latencyConfig);

  const loadData = useCallback(async () => {
    setLoading(true); setError(''); setData(null);
    try { const raw = await api.getResults(); processData(raw); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function processData(raw) {
    const sessions   = raw.sessions   || [];
    const surveys    = raw.surveys    || [];
    const benchmarks = raw.benchmarks || [];

    const userSessions      = sessions.filter(s => s.SessionType === 'user');
    const benchSessions     = sessions.filter(s => s.SessionType === 'benchmark');
    const completedIds      = new Set([
      ...surveys.filter(r => r.QuestionKey === 'overall_recommend' || r.QuestionKey === 'sus_9').map(r => r.SessionID),
      ...benchmarks.map(b => b.SessionID),
    ]);
    const completedSessions = userSessions.filter(s => completedIds.has(s.ID));

    // Feature ratings
    const ratingAvgs  = RATING_KEYS.map(k => avg(surveys.filter(r => r.QuestionKey === k && r.Score > 0).map(r => r.Score)) || 0);
    const ratingCount = surveys.filter(r => r.QuestionKey === RATING_KEYS[0] && r.Score > 0).length;
    const usefulness  = avg(surveys.filter(r => r.QuestionKey === 'overall_usefulness' && r.Score > 0).map(r => r.Score));
    const recommend   = avg(surveys.filter(r => r.QuestionKey === 'overall_recommend'  && r.Score > 0).map(r => r.Score));
    const allRatings  = [...ratingAvgs, usefulness || 0, recommend || 0].filter(v => v > 0);
    const avgRating   = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : null;

    // Features desired
    const featCounts = FEAT_KEYS.map(k => surveys.filter(r => r.QuestionKey === k && r.Score === 1).length);

    // Input preference
    const inputRows   = surveys.filter(r => r.QuestionKey === 'input_pref');
    const inputCounts = INPUT_PREF_ORDER.map(v => inputRows.filter(r => r.Comment === v).length);

    // Loan mode
    const loanRows = surveys.filter(r => r.QuestionKey === 'loans_mode');
    const loanCounts = ['automatic','hybrid','manual','not_interested'].map(v => loanRows.filter(r => r.Comment === v).length);

    // Benchmark — per provider
    const llmResults  = benchmarks.filter(b => b.TestName?.startsWith('llm_'));
    const providers   = [...new Set(llmResults.map(b => b.TestName.replace('llm_', '')))].sort();
    const providerStats = providers.map(p => {
      const rows    = llmResults.filter(b => b.TestName === `llm_${p}`);
      const correct = rows.filter(b => b.Success).length;
      const lats    = rows.filter(b => b.LatencyMs > 0).map(b => b.LatencyMs);
      return {
        id: p,
        label: p.charAt(0).toUpperCase() + p.slice(1),
        accuracy: rows.length ? Math.round((correct / rows.length) * 100) : null,
        avgLatency: lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : null,
        minLatency: lats.length ? Math.min(...lats) : null,
        correct,
        total: rows.length,
        rows,
      };
    });

    setData({ sessions, surveys, benchmarks, userSessions, completedSessions, completedIds, benchSessions, ratingAvgs, ratingCount, avgRating, usefulness, recommend, featCounts, inputCounts, loanCounts, providerStats, llmResults });

    // Chart: feature ratings
    const barColors = ratingAvgs.map(v => v >= 4 ? '#0D9488' : v >= 3 ? '#F59E0B' : v > 0 ? '#EF4444' : '#E5E5EA');
    setRatingsConfig({ type: 'bar', data: { labels: RATING_LBLS, datasets: [{ data: ratingAvgs, backgroundColor: barColors, borderRadius: 4 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } } } });

    // Chart: features desired
    setFeatWantConfig({ type: 'bar', data: { labels: FEAT_LBLS, datasets: [{ data: featCounts, backgroundColor: '#6366F1', borderRadius: 4 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } } });

    // Chart: input preference
    setInputPrefConfig({ type: 'doughnut', data: { labels: INPUT_PREF_ORDER.map(k => INPUT_PREF_LBLS[k]), datasets: [{ data: inputCounts, backgroundColor: ['#0D9488','#34D399','#F59E0B','#6366F1','#94A3B8'] }] }, options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } } } });

    // Chart: loan mode
    setLoanConfig({ type: 'doughnut', data: { labels: ['Automático','Híbrido','Manual','No interesa'], datasets: [{ data: loanCounts, backgroundColor: ['#0D9488','#6366F1','#F59E0B','#CBD5E1'] }] }, options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } } } });

    // Chart: latency per provider
    const PROV_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444'];
    const maxPhrases  = Math.max(...providerStats.map(p => p.rows.length), 0);
    const latDatasets = providerStats.map((p, i) => ({
      label: p.label,
      data: p.rows.map(b => b.LatencyMs),
      borderColor: PROV_COLORS[i % PROV_COLORS.length],
      backgroundColor: PROV_COLORS[i % PROV_COLORS.length] + '18',
      fill: false, tension: 0.3, pointRadius: 4,
    }));
    setLatencyConfig({ type: 'line', data: { labels: Array.from({ length: maxPhrases }, (_, i) => `F${i + 1}`), datasets: latDatasets }, options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'ms' } } } } });

  }

  useEffect(() => { loadData(); }, [loadData]);

  const fmt = (v, suffix = '') => v !== null && v !== undefined ? `${v}${suffix}` : '—';

  return (
    <div className="dash-wrap">
      <div className="dash-inner">

        {/* Header */}
        <div className="dash-header">
          <div>
            <div className="dash-wordmark">Monetra</div>
            <h1>Resultados del estudio</h1>
            <p><Link to="/" className="nav-link">← Volver al inicio</Link></p>
          </div>
          <button className="btn-refresh" onClick={loadData}>Actualizar</button>
        </div>

        {loading && <div className="loading">Cargando datos…</div>}
        {error   && <div className="loading">Error al cargar.<br /><small>{error}</small></div>}

        {data && (
          <>
            {/* ── USUARIOS ──────────────────────────────────────────────── */}
            <div className="dash-mb">
              <div className="dash-section-hd">
                <div className="dash-section-title">Usuarios</div>
                <div className="dash-section-sub">{data.completedSessions.length} evaluaciones completadas</div>
              </div>

              {/* KPIs */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: '#0D9488' }}>{data.completedSessions.length}</div>
                  <div className="kpi-label">Usuarios</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: '#10B981' }}>{fmt(data.avgRating, ' / 5')}</div>
                  <div className="kpi-label">Valoración media</div>
                  <div className="kpi-sub">{data.ratingCount} de {data.completedSessions.length}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: '#6366F1' }}>{fmt(data.usefulness, ' / 5')}</div>
                  <div className="kpi-label">Lo usarían</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-val" style={{ color: '#F59E0B' }}>{fmt(data.recommend, ' / 5')}</div>
                  <div className="kpi-label">Lo recomendarían</div>
                </div>
              </div>

              {/* Calificación por función */}
              <div className="dash-card" style={{ marginBottom: 14 }}>
                <div className="dash-card-title">¿Cómo calificaron cada función? (1 = Nada · 5 = Totalmente)</div>
                <canvas ref={ratingsRef} height={160} />
              </div>

              {/* Preferencias */}
              <div className="charts-2col">
                <div className="dash-card">
                  <div className="dash-card-title">¿Cómo registrarían sus gastos?</div>
                  <canvas ref={inputPrefRef} height={200} />
                </div>
                <div className="dash-card">
                  <div className="dash-card-title">¿Cómo registrarían préstamos?</div>
                  <canvas ref={loanRef} height={200} />
                </div>
              </div>

              {/* Features deseadas */}
              <div className="dash-card">
                <div className="dash-card-title">¿Qué funciones les gustaría que tuviera la app?</div>
                <canvas ref={featWantRef} height={150} />
              </div>
            </div>

            {/* ── TÉCNICO ───────────────────────────────────────────────── */}
            <div className="dash-mb">
              <div className="dash-section-hd">
                <div className="dash-section-title">Técnico</div>
                <div className="dash-section-sub">{data.benchSessions.length} sesiones de benchmarking</div>
              </div>

              {/* Per-provider KPI cards */}
              {data.providerStats.length > 0 && (
                <div className="charts-2col" style={{ marginBottom: 14 }}>
                  {data.providerStats.map((p, i) => {
                    const colors = ['#0D9488','#6366F1','#F59E0B','#EF4444'];
                    const c = colors[i % colors.length];
                    return (
                      <div className="dash-card" key={p.id}>
                        <div className="dash-card-title">{p.label}</div>
                        <div className="tech-mini-kpis">
                          <div className="tech-kpi">
                            <div className="tech-kpi-val" style={{ color: c }}>{fmt(p.accuracy, '%')}</div>
                            <div className="tech-kpi-lbl">Accuracy</div>
                          </div>
                          <div className="tech-kpi">
                            <div className="tech-kpi-val" style={{ color: c }}>{fmt(p.avgLatency, ' ms')}</div>
                            <div className="tech-kpi-lbl">Latencia media</div>
                          </div>
                          <div className="tech-kpi">
                            <div className="tech-kpi-val" style={{ color: c }}>{fmt(p.minLatency, ' ms')}</div>
                            <div className="tech-kpi-lbl">Latencia mín</div>
                          </div>
                          <div className="tech-kpi">
                            <div className="tech-kpi-val" style={{ color: c }}>{p.correct}/{p.total}</div>
                            <div className="tech-kpi-lbl">Correctas</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Latency chart */}
              <div className="dash-card" style={{ marginBottom: 14 }}>
                <div className="dash-card-title">Latencia por frase — comparativa entre proveedores (ms)</div>
                <canvas ref={latencyRef} height={180} />
              </div>

              {/* Tablas sesiones */}
              {[
                { title: 'Completadas', rows: data.sessions.filter(s => data.completedIds.has(s.ID)) },
                { title: 'En progreso / incompletas', rows: data.sessions.filter(s => !data.completedIds.has(s.ID)) },
              ].map(({ title, rows }) => (
                <div className="dash-card" key={title} style={{ marginBottom: 14 }}>
                  <div className="dash-card-title" style={{ textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.75rem' }}>{title} ({rows.length})</div>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>{['ID','Participante','Tipo','Fecha','Respuestas'].map(h => <th key={h}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {rows.length === 0
                          ? <tr><td colSpan={5} style={{ color: '#64748B', textAlign: 'center', padding: 16 }}>Sin sesiones</td></tr>
                          : rows.map(s => {
                              const respCount = data.surveys.filter(r => r.SessionID === s.ID).length + data.benchmarks.filter(b => b.SessionID === s.ID).length;
                              const date = new Date(s.CreatedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                              return (
                                <tr key={s.ID}>
                                  <td style={{ color: '#94A3B8' }}>{s.ID}</td>
                                  <td style={{ fontWeight: 600 }}>{s.ParticipantName}</td>
                                  <td><span className={TYPE_BADGE[s.SessionType] || ''}>{TYPE_LABEL[s.SessionType] || s.SessionType}</span></td>
                                  <td style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{date}</td>
                                  <td>{respCount}</td>
                                </tr>
                              );
                            })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
