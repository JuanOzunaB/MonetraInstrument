import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import session from '../services/session.js';

const CRITERIA = [
  { key: 'expert_stt',     title: 'Precisión del reconocimiento de voz (STT)',   desc: 'Qué tan bien el sistema transcribe el habla colombiana: jerga financiera, "lucas", "billete", nombres propios, cantidades como "cincuenta mil".', minLabel: 'Muy impreciso', maxLabel: 'Muy preciso' },
  { key: 'expert_llm',     title: 'Coherencia de la clasificación financiera',    desc: 'Si el sistema interpreta correctamente las intenciones: distingue gastos de ingresos, préstamos de pagos, categoriza adecuadamente y extrae montos con precisión.', minLabel: 'Muy incoherente', maxLabel: 'Muy coherente' },
  { key: 'expert_ux',      title: 'Claridad del flujo de confirmación',           desc: 'Si el usuario entiende qué reconoció la app, puede confirmar o corregir antes de guardar, y si el diseño de la pantalla de revisión es intuitivo.', minLabel: 'Muy confuso', maxLabel: 'Muy claro' },
  { key: 'expert_context', title: 'Adecuación al contexto colombiano',            desc: 'Si la app se adapta a la realidad financiera colombiana: moneda COP, servicios como Nu y Bancolombia, vocabulario local y patrones de gasto.', minLabel: 'Poco adecuada', maxLabel: 'Muy adecuada' },
  { key: 'expert_tech',    title: 'Viabilidad técnica de la arquitectura',        desc: 'Solidez del pipeline voz→STT→clasificación→DB, seguridad con Firebase+JWT, manejo de errores, latencia y escalabilidad del diseño.', minLabel: 'Inviable', maxLabel: 'Muy sólida' },
  { key: 'expert_value',   title: 'Valor e innovación para el usuario final',     desc: 'Impacto potencial para ayudar a llevar control financiero, innovación del enfoque conversacional y diferenciación frente a apps existentes.', minLabel: 'Bajo valor', maxLabel: 'Alto valor' },
  { key: 'expert_email',   title: 'Detección automática por email',               desc: 'Efectividad del pipeline que monitorea la bandeja de correo (Outlook/Gmail) para detectar transacciones bancarias, pagos y cobros sin intervención del usuario.', minLabel: 'Muy deficiente', maxLabel: 'Muy efectiva' },
  { key: 'expert_scan',    title: 'Precisión del escaneo de facturas',            desc: 'Qué tan bien el sistema extrae monto, descripción y categoría a partir de imágenes de facturas y recibos (OCR + parsing de intención).', minLabel: 'Muy impreciso', maxLabel: 'Muy preciso' },
];

export default function ExpertEval() {
  const navigate = useNavigate();
  const name = session.getName();

  const [scores,   setScores]   = useState(() => Object.fromEntries(CRITERIA.map(c => [c.key, null])));
  const [comments, setComments] = useState(() => Object.fromEntries(CRITERIA.map(c => [c.key, ''])));
  const [overall,  setOverall]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState({ text: '', ok: true });

  useEffect(() => {
    if (!name) navigate('/');
  }, [name, navigate]);

  function setScore(key, val) {
    setScores(prev => ({ ...prev, [key]: val }));
  }

  async function submit() {
    for (const c of CRITERIA) {
      if (scores[c.key] === null) {
        alert(`Por favor evalúa el criterio "${c.title}".`);
        return;
      }
    }
    const sessionId = session.getId();
    if (!sessionId) { alert('Sesión no encontrada. Vuelve al inicio.'); return; }

    const responses = CRITERIA.map(c => ({
      question_key: c.key,
      score: scores[c.key],
      comment: comments[c.key].trim(),
    }));
    if (overall.trim()) {
      responses.push({ question_key: 'expert_overall', score: 0, comment: overall.trim() });
    }

    setLoading(true);
    try {
      await api.submitSurvey(sessionId, responses);
      setMsg({ text: 'Evaluación enviada. Muchas gracias.', ok: true });
      session.clear();
    } catch {
      setMsg({ text: 'Error al enviar. Intenta de nuevo.', ok: false });
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: 24, fontFamily: 'Figtree, sans-serif', color: '#0D0D12' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0D9488', letterSpacing: '-0.2px', marginBottom: 12 }}>Monetra</div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Evaluación de experto{' '}
            {name && <span style={{ display: 'inline-block', background: '#EEEEEF', color: '#64748B', fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 9999, marginLeft: 8, verticalAlign: 'middle' }}>{name}</span>}
          </h1>
          <p style={{ color: '#64748B', marginTop: 5, fontSize: '0.875rem', lineHeight: 1.5 }}>
            Evalúa cada criterio del 1 (Muy deficiente) al 5 (Excelente). Agrega comentarios cuando sea relevante.
          </p>
        </div>

        <div style={{ border: '1px solid #E5E5EA', borderRadius: 14, padding: 24, marginBottom: 16, background: '#fff' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0D9488', marginBottom: 4 }}>Rúbrica</div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Criterios de evaluación</h2>
          <p style={{ color: '#64748B', fontSize: '0.84rem', marginBottom: 20, lineHeight: 1.5 }}>
            Evalúa cada criterio de forma independiente después de interactuar con la app.
          </p>

          {CRITERIA.map((c, i) => (
            <div key={c.key} style={{ marginBottom: i < CRITERIA.length - 1 ? 24 : 0, paddingBottom: i < CRITERIA.length - 1 ? 24 : 0, borderBottom: i < CRITERIA.length - 1 ? '1px solid #E5E5EA' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0D0D12', marginBottom: 4 }}>{c.title}</div>
              <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: 14, lineHeight: 1.4 }}>{c.desc}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', width: 84 }}>{c.minLabel}</span>
                <div style={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <label key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="radio" name={c.key} value={v} checked={scores[c.key] === v} onChange={() => setScore(c.key, v)} style={{ display: 'none' }} />
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: scores[c.key] === v ? '#0D9488' : '#F2F2F7',
                        border: `1px solid ${scores[c.key] === v ? '#0D9488' : '#E5E5EA'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.875rem',
                        color: scores[c.key] === v ? '#fff' : '#64748B',
                        transition: 'all 0.15s',
                      }}>{v}</div>
                    </label>
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', width: 84, textAlign: 'right' }}>{c.maxLabel}</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" name={c.key} value={0} checked={scores[c.key] === 0} onChange={() => setScore(c.key, 0)} style={{ display: 'none' }} />
                  <span style={{
                    display: 'inline-block', padding: '5px 14px',
                    background: scores[c.key] === 0 ? '#F0FDFA' : '#F2F2F7',
                    border: `1px solid ${scores[c.key] === 0 ? '#0D9488' : '#E5E5EA'}`,
                    borderRadius: 20, fontSize: '0.78rem',
                    color: scores[c.key] === 0 ? '#0D9488' : '#64748B',
                    fontWeight: scores[c.key] === 0 ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>No lo tengo claro</span>
                </label>
              </div>

              <textarea
                placeholder="Comentario opcional…"
                value={comments[c.key]}
                onChange={e => setComments(prev => ({ ...prev, [c.key]: e.target.value }))}
                style={{ width: '100%', padding: '11px 13px', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: 10, color: '#0D0D12', fontSize: '0.84rem', fontFamily: 'Figtree, sans-serif', resize: 'vertical', minHeight: 72 }}
              />
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid #E5E5EA', borderRadius: 14, padding: 24, marginBottom: 16, background: '#fff' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0D9488', marginBottom: 4 }}>General</div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Evaluación general</h2>
          <p style={{ color: '#64748B', fontSize: '0.84rem', marginBottom: 20, lineHeight: 1.5 }}>Fortalezas, debilidades y recomendaciones globales.</p>
          <textarea
            placeholder="Escribe tu evaluación general aquí…"
            value={overall}
            onChange={e => setOverall(e.target.value)}
            style={{ width: '100%', padding: '11px 13px', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: 10, color: '#0D0D12', fontSize: '0.84rem', fontFamily: 'Figtree, sans-serif', resize: 'vertical', minHeight: 110 }}
          />
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={submit}
            disabled={loading}
            style={{ padding: '13px 44px', background: '#0D9488', color: '#fff', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Figtree, sans-serif', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}
          >
            {loading && !msg.text ? 'Enviando…' : msg.text ? 'Enviado' : 'Enviar evaluación'}
          </button>
          {msg.text && (
            <div style={{ marginTop: 14, fontSize: '0.875rem', color: msg.ok ? '#10B981' : '#F43F5E' }}>{msg.text}</div>
          )}
        </div>

      </div>
    </div>
  );
}
