import { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';
import session from '../services/session.js';

const TEST_PHRASES = [
  { input: 'compré 10 mil de queso en el mercado',      expectedType: 'expense' },
  { input: 'me gasté 50 mil en la droguería',           expectedType: 'expense' },
  { input: 'le presté 30 mil a Juan',                   expectedType: 'loan_given' },
  { input: 'Juan me prestó 20 mil',                     expectedType: 'loan_received' },
  { input: 'me depositaron el sueldo, 1 millón 500',    expectedType: 'income' },
  { input: 'pagué el arriendo, 450 mil',                expectedType: 'expense' },
  { input: 'tanqueé la moto, 35 mil',                   expectedType: 'expense' },
  { input: 'cobré al cliente 200 mil por el trabajo',   expectedType: 'income' },
];

const PROVIDER_COLORS = {
  openai:  { accent: '#0D9488', bg: '#0D948810' },
  groq:    { accent: '#6366F1', bg: '#6366F110' },
  default: { accent: '#F59E0B', bg: '#F59E0B10' },
};

const S = {
  section: { border: '1px solid #E5E5EA', borderRadius: 14, padding: 24, marginBottom: 16, background: '#fff' },
  secTitle: { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0D9488', marginBottom: 4 },
  h2: { fontSize: '1rem', fontWeight: 700, color: '#0D0D12', marginBottom: 6 },
  desc: { color: '#64748B', fontSize: '0.84rem', marginBottom: 18, lineHeight: 1.5 },
  btn: (disabled) => ({ padding: '11px 22px', background: disabled ? '#EEEEEF' : '#0D9488', color: disabled ? '#94a3b8' : '#fff', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif', border: 'none', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s' }),
  healthCard: { display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: '#F2F2F7', borderRadius: 10, border: '1px solid #E5E5EA', marginTop: 14 },
};

function HealthDot({ ok }) {
  return <div style={{ width: 10, height: 10, borderRadius: '50%', background: ok ? '#10B981' : '#F43F5E', flexShrink: 0 }} />;
}

export default function Benchmark() {
  const name = session.getName();
  const [providers,   setProviders]   = useState([]);
  const [provErr,     setProvErr]     = useState('');
  const [health,      setHealth]      = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // LLM benchmark
  const [running,     setRunning]     = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [rows,        setRows]        = useState([]);
  const [summary,     setSummary]     = useState([]);
  const benchResults  = useRef([]);

  // Save
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState({ text: '', ok: true });
  const [canSave,     setCanSave]     = useState(false);

  // STT
  const sttRecorder   = useRef(null);
  const sttChunks     = useRef([]);
  const [sttRecording, setSttRecording] = useState(false);
  const [sttResult,   setSttResult]   = useState(null);

  // Scan
  const scanInputRef  = useRef(null);
  const [scanResult,  setScanResult]  = useState(null);

  // Parse
  const [parseText,   setParseText]   = useState('');
  const [parseResult, setParseResult] = useState(null);

  // Stats
  const [stats,       setStats]       = useState(null);

  useEffect(() => { loadProviders(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProviders() {
    try {
      const data = await api.getProviders();
      setProviders(data.providers || []);
    } catch {
      setProvErr('No se pudo conectar al backend. Verifica que el servidor esté en línea.');
    }
  }

  async function checkHealth() {
    setHealthLoading(true);
    try {
      const r = await api.checkHealth();
      setHealth(r);
    } catch {
      setHealth({ success: false, latency_ms: 0 });
    }
    setHealthLoading(false);
  }

  async function runBenchmark() {
    if (!providers.length) { alert('Sin proveedores configurados.'); return; }
    setRunning(true);
    setProgress(0);
    setRows([]);
    setSummary([]);
    setCanSave(false);
    benchResults.current = [];

    const resultRows = [];

    for (let i = 0; i < TEST_PHRASES.length; i++) {
      const phrase = TEST_PHRASES[i];
      setProgress(Math.round((i / TEST_PHRASES.length) * 100));

      const providerResults = await Promise.all(
        providers.map(async p => {
          try {
            const r = await api.runLLMBenchmark(phrase.input, p.id);
            const gotType = r.parsed_intent?.type || 'unknown';
            return { provider: p.id, success: r.success, correct: gotType === phrase.expectedType, latency_ms: r.latency_ms, intent: r.parsed_intent, error: r.error };
          } catch (e) {
            return { provider: p.id, success: false, correct: false, latency_ms: 0, intent: null, error: e.message };
          }
        })
      );

      const fastestMs = Math.min(...providerResults.filter(r => r.latency_ms > 0).map(r => r.latency_ms));
      resultRows.push({ phrase, providerResults, fastestMs });

      providerResults.forEach(r => {
        benchResults.current.push({
          test_name: `llm_${r.provider}`,
          latency_ms: r.latency_ms,
          success: r.correct,
          input_text: phrase.input,
          parsed_intent: JSON.stringify(r.intent),
          error_message: r.error || '',
        });
      });

      setRows([...resultRows]);
    }

    setProgress(100);
    setRunning(false);
    setCanSave(!!session.getId());

    // Build summary
    const sums = providers.map(p => {
      const c = PROVIDER_COLORS[p.id] || PROVIDER_COLORS.default;
      const pr = benchResults.current.filter(r => r.test_name === `llm_${p.id}`);
      const correct = pr.filter(r => r.success).length;
      const lats = pr.filter(r => r.latency_ms > 0).map(r => r.latency_ms);
      const avg = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : null;
      const min = lats.length ? Math.min(...lats) : null;
      const accuracy = pr.length ? Math.round((correct / pr.length) * 100) : 0;
      return { p, c, accuracy, avg, min, correct, total: pr.length };
    });
    setSummary(sums);
  }

  async function saveResults() {
    const sessionId = session.getId();
    if (!sessionId) { alert('Sin sesión activa.'); return; }
    setSaving(true);
    try {
      for (const r of benchResults.current) await api.submitBenchmark(sessionId, r);
      setSaveMsg({ text: 'Resultados guardados.', ok: true });
      session.clear();
    } catch {
      setSaveMsg({ text: 'Error al guardar.', ok: false });
      setSaving(false);
    }
  }

  // PDF helper
  async function pdfToImageBlobs(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const ab  = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const blobs = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page     = await pdf.getPage(i);
      const vp       = page.getViewport({ scale: 2.0 });
      const canvas   = document.createElement('canvas');
      canvas.width   = vp.width;
      canvas.height  = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      blobs.push(await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85)));
    }
    return blobs;
  }

  async function toggleSTTRecording() {
    if (sttRecording) {
      sttRecorder.current?.stop();
      setSttRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      sttChunks.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec  = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      rec.ondataavailable = e => { if (e.data.size > 0) sttChunks.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(sttChunks.current, { type: rec.mimeType || 'audio/webm' });
        setSttResult({ loading: true });
        const t0 = performance.now();
        try {
          const data = await api.transcribe(blob);
          setSttResult({ ok: true, transcript: data.transcript || '(vacío)', latency: Math.round(performance.now() - t0) });
        } catch (e) {
          setSttResult({ ok: false, error: e.message });
        }
      };
      rec.start();
      sttRecorder.current = rec;
      setSttRecording(true);
    } catch {
      alert('No se pudo acceder al micrófono.');
    }
  }

  async function runScanBenchmark(file) {
    if (!file) return;
    setScanResult({ loading: true });
    const formData = new FormData();
    if (file.type === 'application/pdf') {
      setScanResult({ loading: true, msg: 'Convirtiendo PDF…' });
      try {
        const blobs = await pdfToImageBlobs(file);
        blobs.forEach((b, i) => formData.append('file', b, `page_${i + 1}.jpg`));
      } catch (e) {
        setScanResult({ ok: false, error: `Error PDF: ${e.message}` });
        return;
      }
    } else {
      formData.append('file', file);
    }
    const t0 = performance.now();
    try {
      const data   = await api.scanInvoice(formData);
      const intent = (data.parsed_intents && data.parsed_intents[0]) || data.parsed_intent || {};
      const ok     = data.success && !!intent.type;
      setScanResult({ ok, intent, latency: Math.round(performance.now() - t0) });
    } catch (e) {
      setScanResult({ ok: false, error: e.message });
    }
    if (scanInputRef.current) scanInputRef.current.value = '';
  }

  async function runParseTest() {
    const text = parseText.trim();
    if (!text) return;
    setParseResult({ loading: true });
    const sessionId = session.getId() ? parseInt(session.getId()) : 0;
    const t0 = performance.now();
    try {
      const data   = await api.parse(text, sessionId);
      const intent = data.parsed_intent || {};
      setParseResult({ ok: data.success, intent, latency: Math.round(performance.now() - t0) });
    } catch (e) {
      setParseResult({ ok: false, error: e.message });
    }
  }

  async function loadStats() {
    const sessionId = session.getId();
    if (!sessionId) { setStats({ error: 'Sin sesión activa. Ve a la página de inicio.' }); return; }
    try {
      const s = await api.getStats(sessionId);
      setStats(s);
    } catch (e) {
      setStats({ error: e.message });
    }
  }

  return (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: 24, fontFamily: 'Figtree, sans-serif', color: '#0D0D12' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0D9488', marginBottom: 12 }}>Monetra</div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Benchmarking técnico
            {name && <span style={{ display: 'inline-block', background: '#EEEEEF', color: '#64748B', fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 9999, marginLeft: 8, verticalAlign: 'middle' }}>{name}</span>}
          </h1>
          <p style={{ color: '#64748B', marginTop: 5, fontSize: '0.875rem' }}>Comparativa automática de precisión y latencia entre los proveedores configurados.</p>
        </div>

        {/* Health */}
        <div style={S.section}>
          <div style={S.secTitle}>Conectividad</div>
          <h2 style={S.h2}>Estado del servidor</h2>
          <p style={S.desc}>Verifica que el backend y los proveedores están disponibles antes de correr las pruebas.</p>
          <button style={S.btn(healthLoading)} disabled={healthLoading} onClick={checkHealth}>
            {healthLoading ? 'Verificando…' : 'Verificar conexión'}
          </button>
          {health && (
            <div style={S.healthCard}>
              <HealthDot ok={health.success} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{health.success ? 'Servidor en línea' : 'Servidor no disponible'}</div>
                <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: 2 }}>Latencia: {health.latency_ms} ms</div>
              </div>
            </div>
          )}
        </div>

        {/* Providers */}
        <div style={S.section}>
          <div style={S.secTitle}>Configuración</div>
          <h2 style={S.h2}>Proveedores configurados</h2>
          <p style={S.desc}>Se configuran con las variables <code style={{ fontFamily: 'monospace', fontSize: '0.82em', background: '#EEEEEF', padding: '1px 5px', borderRadius: 4 }}>INSTRUMENT_*</code> del backend.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {provErr
              ? <span style={{ color: '#F43F5E', padding: 10, background: '#F43F5E10', borderRadius: 8, fontSize: '0.84rem', border: '1px solid #F43F5E22' }}>{provErr}</span>
              : !providers.length
                ? <span style={{ color: '#64748B', fontSize: '0.84rem' }}>Cargando…</span>
                : providers.map(p => {
                    const c = PROVIDER_COLORS[p.id] || PROVIDER_COLORS.default;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${c.accent}`, background: c.bg, color: c.accent }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.accent }} />
                        {p.label}
                      </div>
                    );
                  })}
          </div>
        </div>

        {/* LLM Benchmark */}
        <div style={S.section}>
          <div style={S.secTitle}>Prueba principal</div>
          <h2 style={S.h2}>Clasificación de frases — comparativa multi-proveedor</h2>
          <p style={S.desc}>{TEST_PHRASES.length} frases en español colombiano enviadas a cada proveedor en paralelo. Cada fila compara latencia y precisión entre modelos.</p>
          <button style={S.btn(running)} disabled={running} onClick={runBenchmark} id="runBtn">
            {running ? 'Ejecutando…' : rows.length ? 'Volver a ejecutar' : 'Iniciar comparativa'}
          </button>

          <div style={{ marginTop: 20 }}>
            <div style={{ width: '100%', height: 3, background: '#EEEEEF', borderRadius: 2, marginBottom: 18, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#0D9488', transition: 'width 0.3s', width: `${progress}%` }} />
            </div>

            {summary.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(providers.length, 2)}, 1fr)`, gap: 14, marginBottom: 18 }}>
                {summary.map(({ p, c, accuracy, avg, min, correct, total }) => (
                  <div key={p.id} style={{ background: '#F2F2F7', borderRadius: 12, padding: 18, border: `1px solid ${c.accent}44` }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12, color: c.accent }}>{p.label}</h3>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {[
                        { val: `${accuracy}%`, label: 'Accuracy', color: c.accent },
                        { val: avg != null ? `${avg}ms` : '—', label: 'Promedio' },
                        { val: min != null ? `${min}ms` : '—', label: 'Mínimo' },
                        { val: `${correct}/${total}`, label: 'Correctas' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color || '#0D0D12' }}>{s.val}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rows.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.81rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', borderBottom: '1px solid #E5E5EA', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.3px' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', borderBottom: '1px solid #E5E5EA', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Frase</th>
                      <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', borderBottom: '1px solid #E5E5EA', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>Esperado</th>
                      {providers.map(p => {
                        const c = PROVIDER_COLORS[p.id] || PROVIDER_COLORS.default;
                        return <th key={p.id} style={{ textAlign: 'left', padding: '9px 12px', fontSize: '0.72rem', fontWeight: 600, color: c.accent, borderBottom: '1px solid #E5E5EA', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{p.label}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ phrase, providerResults, fastestMs }, i) => (
                      <tr key={i}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5EA', verticalAlign: 'top' }}>{i + 1}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5EA', verticalAlign: 'top', maxWidth: 220, wordBreak: 'break-word' }}>"{phrase.input}"</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5EA', verticalAlign: 'top' }}><code style={{ fontFamily: 'monospace', fontSize: '0.82em', background: '#EEEEEF', padding: '1px 5px', borderRadius: 4 }}>{phrase.expectedType}</code></td>
                        {providerResults.map(r => {
                          const c       = PROVIDER_COLORS[r.provider] || PROVIDER_COLORS.default;
                          const isFast  = r.latency_ms === fastestMs && r.latency_ms > 0;
                          const gotType = r.intent?.type || (r.error ? 'error' : 'unknown');
                          const summary = r.intent ? `type=${r.intent.type}, amount=${r.intent.amount ?? '?'}` : r.error?.slice(0, 60) || '—';
                          return (
                            <td key={r.provider} style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5EA', verticalAlign: 'top' }}>
                              <div style={{ background: '#F2F2F7', borderRadius: 8, padding: '8px 10px', border: '1px solid #E5E5EA' }}>
                                <span style={{ color: r.correct ? '#10B981' : '#F43F5E', fontWeight: 700 }}>{r.correct ? 'OK' : 'FAIL'} {gotType}</span>
                                {isFast && <span style={{ display: 'inline-block', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 9999, marginLeft: 6, fontWeight: 700, background: '#0D948820', color: '#0D9488' }}>más rápido</span>}
                                <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>{summary}</div>
                                <span style={{ display: 'inline-block', background: '#EEEEEF', borderRadius: 6, padding: '2px 7px', fontSize: '0.72rem', marginTop: 4, color: c.accent }}>
                                  {r.latency_ms > 0 ? `${r.latency_ms} ms` : '—'}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* STT */}
        <div style={S.section}>
          <div style={S.secTitle}>Prueba de STT</div>
          <h2 style={S.h2}>Reconocimiento de voz (Speech-to-Text)</h2>
          <p style={S.desc}>Graba un mensaje de voz para medir la latencia y calidad del servicio de transcripción del backend.</p>
          <button style={S.btn(false)} onClick={toggleSTTRecording}>
            {sttRecording ? 'Detener grabación' : 'Grabar audio'}
          </button>
          {sttResult && (
            <div style={{ marginTop: 14 }}>
              {sttResult.loading
                ? <div style={{ color: '#64748B', fontSize: '0.84rem' }}>Transcribiendo…</div>
                : sttResult.ok
                  ? <div style={S.healthCard}><HealthDot ok /><div><div style={{ fontSize: '0.875rem', fontWeight: 600 }}>"{sttResult.transcript}"</div><div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: 2 }}>Latencia STT: {sttResult.latency} ms</div></div></div>
                  : <div style={{ color: '#F43F5E', fontSize: '0.84rem' }}>Error: {sttResult.error}</div>}
            </div>
          )}
        </div>

        {/* Scan */}
        <div style={S.section}>
          <div style={S.secTitle}>Prueba de escaneo</div>
          <h2 style={S.h2}>Parsing de factura / imagen</h2>
          <p style={S.desc}>Sube una imagen de factura o recibo para probar el pipeline de OCR + extracción de intención.</p>
          <input ref={scanInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" style={{ display: 'none' }} onChange={e => runScanBenchmark(e.target.files[0])} />
          <button style={S.btn(false)} onClick={() => scanInputRef.current?.click()}>Subir imagen o PDF</button>
          {scanResult && (
            <div style={{ marginTop: 14 }}>
              {scanResult.loading
                ? <div style={{ color: '#64748B', fontSize: '0.84rem' }}>{scanResult.msg || 'Analizando…'}</div>
                : scanResult.ok
                  ? <div style={{ ...S.healthCard, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><HealthDot ok /><div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Scan exitoso · {scanResult.latency} ms</div></div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748B' }}>type={scanResult.intent?.type || '?'}, amount={scanResult.intent?.amount ?? '?'}, desc={scanResult.intent?.description || '?'}</div>
                    </div>
                  : <div style={{ color: '#F43F5E', fontSize: '0.84rem' }}>Error: {scanResult.error}</div>}
            </div>
          )}
        </div>

        {/* Parse text */}
        <div style={S.section}>
          <div style={S.secTitle}>Prueba de parsing de texto</div>
          <h2 style={S.h2}>Clasificación directa por texto</h2>
          <p style={S.desc}>Envía una frase libre al pipeline de parseo del backend y ve el resultado en tiempo real.</p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={parseText}
              onChange={e => setParseText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runParseTest()}
              placeholder="ej: gasté 50 mil en mercado"
              style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontFamily: 'Figtree, sans-serif', fontSize: '0.875rem', outline: 'none' }}
            />
            <button style={S.btn(false)} onClick={runParseTest}>Parsear</button>
          </div>
          {parseResult && (
            <div style={{ marginTop: 14 }}>
              {parseResult.loading
                ? <div style={{ color: '#64748B', fontSize: '0.84rem' }}>Procesando…</div>
                : parseResult.ok
                  ? <div style={{ ...S.healthCard, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><HealthDot ok /><div style={{ fontSize: '0.875rem', fontWeight: 600 }}>OK · {parseResult.latency} ms</div></div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748B' }}>type={parseResult.intent?.type || '?'}, amount={parseResult.intent?.amount ?? '?'}, desc={parseResult.intent?.description || '?'}, cat={parseResult.intent?.category_name || '?'}</div>
                    </div>
                  : <div style={{ color: '#F43F5E', fontSize: '0.84rem' }}>Error: {parseResult.error}</div>}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={S.section}>
          <div style={S.secTitle}>Estadísticas de sesión</div>
          <h2 style={S.h2}>Resumen de actividad</h2>
          <p style={S.desc}>Totales acumulados de la sesión activa en el backend.</p>
          <button style={S.btn(false)} onClick={loadStats}>Cargar estadísticas</button>
          {stats && (
            <div style={{ marginTop: 16 }}>
              {stats.error
                ? <div style={{ color: '#F43F5E', fontSize: '0.84rem' }}>{stats.error}</div>
                : <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    {[
                      { val: stats.transactions_count ?? 0,  label: 'Transacciones',    color: '#0D9488' },
                      { val: stats.benchmarks_count    ?? 0, label: 'Benchmarks',        color: '#6366F1' },
                      { val: stats.email_drafts_count  ?? 0, label: 'Emails detectados', color: '#F59E0B' },
                      { val: stats.avg_latency_ms ? `${Math.round(stats.avg_latency_ms)} ms` : '—', label: 'Latencia promedio' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color || '#0D0D12' }}>{s.val}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>}
            </div>
          )}
        </div>

        {/* Save */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          <button
            disabled={!canSave || saving}
            onClick={saveResults}
            style={{ padding: '11px 22px', background: !canSave || saving ? '#EEEEEF' : '#334155', color: !canSave || saving ? '#94a3b8' : '#fff', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif', border: 'none', borderRadius: 10, cursor: !canSave || saving ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
          >
            {saving && !saveMsg.text ? 'Guardando…' : saveMsg.text ? 'Guardado' : 'Guardar en el estudio'}
          </button>
          {saveMsg.text && <div style={{ fontSize: '0.84rem', color: saveMsg.ok ? '#10B981' : '#F43F5E' }}>{saveMsg.text}</div>}
        </div>

      </div>
    </div>
  );
}
