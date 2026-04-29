import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import session from '../services/session.js';

const TOTAL_STEPS = 5;

const FEAT_QUESTIONS = [
  { key: 'feat_voice_accuracy', q: '¿Qué tan bien entendió la app lo que dijiste?' },
  { key: 'feat_voice_ease',     q: '¿Qué tan fácil fue registrar un gasto por voz?' },
  { key: 'feat_scan_accuracy',  q: '¿Qué tan precisa fue la lectura de tu factura o recibo?' },
  { key: 'feat_tts_natural',    q: '¿La voz de la app sonó natural y clara?' },
  { key: 'feat_email_useful',   q: '¿Qué tan útil te parece que la app detecte correos bancarios sola?' },
  { key: 'overall_usefulness',  q: '¿Qué tan probable es que uses Monetra para llevar tus finanzas personales?' },
  { key: 'overall_recommend',   q: '¿Se la recomendarías a alguien cercano?' },
];

const FEAT_SCALE = ['Nada', 'Poco', 'Regular', 'Bastante', 'Totalmente'];

const TYPE_LABELS = {
  expense: 'Gasto', income: 'Ingreso',
  loan_given: 'Préstamo dado', loan_received: 'Préstamo recibido',
  loan_collection: 'Cobro de préstamo', loan_payment: 'Pago de deuda',
};

function fmtAmount(amount) {
  return amount ? `$${Number(amount).toLocaleString('es-CO')}` : '—';
}

function isIncomeType(type) {
  return ['income', 'loan_received', 'loan_collection'].includes(type);
}

export default function UserEval() {
  const navigate = useNavigate();

  // ── Wizard state ────────────────────────────────────────────────────────
  const [step, setStep]       = useState(1);
  const [featIdx, setFeatIdx] = useState(0);   // which feature question (0-6) or 7 = preferences


  // ── Voice state ──────────────────────────────────────────────────────────
  const [voiceState, setVoiceState]     = useState('idle'); // idle | recording | processing
  const [voiceText, setVoiceText]       = useState('Toca para hablar');
  const [transcript, setTranscript]     = useState('');
  const [parsed, setParsed]             = useState(null);   // { inputText, result }
  const [tasksCompleted, setTasksDone]  = useState([false, false, false]);
  const [transactions, setTransactions] = useState([]);

  const mediaRecorderRef  = useRef(null);
  const audioChunksRef    = useRef([]);
  const isRecordingRef    = useRef(false);
  const correctionRef     = useRef(false);
  const parsedRef         = useRef(null); // mirrors parsed state for async callbacks

  // ── Scan state ───────────────────────────────────────────────────────────
  const [scanResult, setScanResult]   = useState(null); // null | { ok, intent } | { error }
  const [scanLoading, setScanLoading] = useState(false);

  // ── TTS state ────────────────────────────────────────────────────────────
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsStatus, setTtsStatus]   = useState({ text: '', type: '' });
  const [ttsUrl, setTtsUrl]         = useState(null);

  // ── Email state ──────────────────────────────────────────────────────────
  const [gmailStatus, setGmailStatus]       = useState({ text: '', type: '' });
  const [gmailBtnText, setGmailBtnText]     = useState('Obtener cuenta Gmail de prueba');
  const [gmailLoading, setGmailLoading]     = useState(false);
  const [outlookStatus, setOutlookStatus]   = useState({ text: '', type: '' });
  const [outlookBtnText, setOutlookBtnText] = useState('Vincular Outlook / Hotmail');
  const [outlookLinked, setOutlookLinked]   = useState(false);
  const [showDrafts, setShowDrafts]         = useState(false);
  const [drafts, setDrafts]                 = useState([]);

  // ── Survey state ─────────────────────────────────────────────────────────
  const [featAnswers, setFeatAnswers]       = useState({});
  const [checkboxes, setCheckboxes]         = useState({});
  const [radioSel, setRadioSel]             = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [prefError, setPrefError]           = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [submitMsg, setSubmitMsg]           = useState({ text: '', type: '' });
  const [submitted, setSubmitted]           = useState(false);

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const name = session.getName();
    if (!name) { navigate('/'); return; }

    // Load existing transactions
    const id = session.getId();
    if (id) {
      api.getTransactions(id).then(data => {
        const txs = data.transactions || data || [];
        const formatted = [...txs].reverse().map(tx => ({
          inputText: tx.InputText || tx.Description,
          intent: { type: tx.TxType, amount: tx.Amount, description: tx.Description, category_name: tx.CategoryName },
        }));
        setTransactions(formatted);
      }).catch(() => {});
    }

    // Listen for OAuth result written to localStorage by OAuthCallback tab.
    // Using 'storage' event because window.opener is null after Microsoft's
    // cross-origin redirect chain clears it.
    function onStorage(e) {
      if (e.key !== 'oauth_result') return;
      try {
        const d = JSON.parse(e.newValue);
        if (!d || d.provider !== 'outlook') return;
        localStorage.removeItem('oauth_result');
        if (d.status === 'success') {
          applyOutlookSuccess(d.email);
          setStep(4);
        } else {
          setOutlookStatus({ text: `Error: ${d.reason || 'oauth_failed'}`, type: 'err' });
          setOutlookBtnText('Vincular Outlook / Hotmail');
          setOutlookLinked(false);
        }
      } catch {}
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applyOutlookSuccess(email) {
    setOutlookStatus({ text: `Outlook vinculado: ${email} — Los emails serán detectados automáticamente.`, type: 'ok' });
    setOutlookBtnText(`Outlook: ${email}`);
    setOutlookLinked(true);
    setShowDrafts(true);
  }

  // ── Stepper ───────────────────────────────────────────────────────────────
  const [navError, setNavError] = useState('');

  function goTo(n) {
    setNavError('');
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function tryNext() {
    if (step === 1) {
      if (transactions.length === 0) {
        setNavError('Confirma al menos un movimiento por voz antes de continuar.');
        return;
      }
    }
    if (step === 2) {
      if (!scanResult || !scanResult.ok) {
        setNavError('Sube una imagen o PDF y espera a que se procese antes de continuar.');
        return;
      }
    }
    if (step === 3) {
      if (!ttsUrl) {
        setNavError('Escucha la respuesta de voz antes de continuar.');
        return;
      }
    }
    setNavError('');
    goTo(step + 1);
  }

  // ── Voice ─────────────────────────────────────────────────────────────────
  async function toggleRecording() {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      rejectTx();
      await startRecording();
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); processAudio(mr.mimeType); };
      mr.start();
      mediaRecorderRef.current = mr;
      isRecordingRef.current = true;
      setVoiceState('recording');
      setVoiceText('Grabando… toca para terminar');
    } catch {
      alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      isRecordingRef.current = false;
      setVoiceState('processing');
      setVoiceText('Procesando…');
      mediaRecorderRef.current.stop();
    }
  }

  async function processAudio(mimeType) {
    const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
    try {
      const { transcript: text } = await api.transcribe(blob);
      if (!text || !text.trim()) {
        setVoiceState('idle'); setVoiceText('No se detectó audio. Intenta de nuevo.');
        correctionRef.current = false;
        return;
      }
      if (correctionRef.current && parsedRef.current) {
        correctionRef.current = false;
        setTranscript(`"${text}"`);
        setVoiceState('processing'); setVoiceText('Aplicando corrección…');
        const orig = parsedRef.current;
        const corrText = `Corrección de "${orig.inputText}": ${text}`;
        const result = await api.runLLMBenchmark(corrText, '', orig.inputText, JSON.stringify(orig.result.parsed_intent || {}));
        const combined = orig.inputText + ' → ' + text;
        showResult(combined, result);
      } else {
        setTranscript(`"${text}"`);
        setVoiceState('processing'); setVoiceText('Clasificando…');
        const result = await api.runLLMBenchmark(text);
        showResult(text, result);
      }
    } catch (e) {
      correctionRef.current = false;
      setVoiceState('idle'); setVoiceText('Error: ' + e.message);
    }
  }

  function showResult(inputText, result) {
    setVoiceState('idle'); setVoiceText('Toca para hablar');
    const p = { inputText, result };
    setParsed(p);
    parsedRef.current = p;
  }

  function rejectTx() {
    setParsed(null);
    parsedRef.current = null;
    correctionRef.current = false;
    setVoiceText('Toca para hablar');
  }

  async function confirmTx() {
    if (!parsed) return;
    const sessionId = session.getId();
    const intent = parsed.result.parsed_intent || {};
    try {
      await api.saveTransaction(sessionId, {
        input_text: parsed.inputText,
        tx_type: intent.type || '',
        amount: intent.amount || 0,
        description: intent.description || '',
        category_name: intent.category_name || '',
        parsed_intent: JSON.stringify(intent),
      });
      setTransactions(prev => [{ inputText: parsed.inputText, intent }, ...prev]);
      markTaskDone(parsed.inputText);
      rejectTx();
      setTranscript('');
    } catch {
      alert('Error al guardar. Verifica la conexión con el servidor.');
    }
  }

  function markTaskDone(inputText) {
    const lower = inputText.toLowerCase();
    setTasksDone(prev => {
      const next = [...prev];
      if (!next[0] && (lower.includes('gasté') || lower.includes('compré') || lower.includes('pagué'))) next[0] = true;
      else if (!next[1] && (lower.includes('recibí') || lower.includes('ingres'))) next[1] = true;
      else if (!next[2] && (lower.includes('presté') || lower.includes('préstamo'))) next[2] = true;
      return next;
    });
  }

  function startCorrection() {
    if (isRecordingRef.current) return;
    correctionRef.current = true;
    startRecording();
  }

  async function runTextCommand(text) {
    if (isRecordingRef.current) return;
    setTranscript(`"${text}"`);
    setVoiceState('processing'); setVoiceText('Clasificando…');
    rejectTx();
    try {
      const result = await api.runLLMBenchmark(text);
      showResult(text, result);
    } catch (e) {
      setVoiceState('idle'); setVoiceText('Error: ' + e.message);
    }
  }

  // ── Scan ──────────────────────────────────────────────────────────────────
  async function pdfToImageBlobs(file) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = Math.min(pdf.numPages, 5);
    const blobs = [];
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85));
      blobs.push(blob);
    }
    return blobs;
  }

  async function runUserScan(e) {
    const file = e.target.files[0];
    if (!file) return;
    setScanLoading(true); setScanResult(null);
    try {
      const formData = new FormData();
      if (file.type === 'application/pdf') {
        const blobs = await pdfToImageBlobs(file);
        if (!blobs.length) throw new Error('No se pudo leer el PDF.');
        blobs.forEach((b, i) => formData.append('file', b, `page_${i+1}.jpg`));
      } else {
        formData.append('file', file);
      }
      const data = await api.scanInvoice(formData);
      const intent = (data.parsed_intents && data.parsed_intents[0]) || data.parsed_intent || {};
      if (data.success && intent.type) {
        setScanResult({ ok: true, intent });
      } else {
        setScanResult({ ok: false, error: data.error || 'No se detectó ninguna transacción.' });
      }
    } catch (err) {
      setScanResult({ ok: false, error: err.message });
    }
    setScanLoading(false);
    e.target.value = '';
  }

  // ── TTS ───────────────────────────────────────────────────────────────────
  async function runTTS() {
    setTtsLoading(true); setTtsStatus({ text: '', type: '' });
    const text = 'Hola. Aquí va el resumen de tus movimientos del día. Registraste tres gastos por un total de ciento cincuenta mil pesos colombianos. Tu balance del mes es positivo.';
    try {
      const blob = await api.tts(text);
      const url = URL.createObjectURL(blob);
      setTtsUrl(url);
      setTtsStatus({ text: 'Reproduciendo respuesta sintetizada.', type: 'ok' });
    } catch (err) {
      setTtsStatus({ text: 'Error al generar audio: ' + err.message, type: 'err' });
    }
    setTtsLoading(false);
  }

  // ── Email ─────────────────────────────────────────────────────────────────
  async function claimGmail() {
    const id = session.getId();
    if (!id) { alert('Sesión no encontrada. Vuelve al inicio.'); return; }
    setGmailLoading(true); setGmailStatus({ text: '', type: '' });
    setGmailBtnText('Solicitando…');
    try {
      const data = await api.claimGmail(id);
      setGmailStatus({ text: `Cuenta asignada: ${data.email_address} — Envíale un email de banco a esta dirección.`, type: 'ok' });
      setGmailBtnText(`Gmail: ${data.email_address}`);
      setShowDrafts(true);
    } catch (err) {
      setGmailStatus({ text: 'Error: ' + err.message, type: 'err' });
      setGmailBtnText('Obtener cuenta Gmail de prueba');
      setGmailLoading(false);
    }
  }

  async function linkOutlook() {
    const id = session.getId();
    if (!id) { alert('Sesión no encontrada. Vuelve al inicio.'); return; }
    setOutlookStatus({ text: '', type: '' });
    setOutlookBtnText('Redirigiendo…');
    try {
      const data = await api.startOutlookOAuth(id);
      setOutlookStatus({ text: 'Abriendo autorización de Microsoft…', type: '' });
      setOutlookBtnText('Vinculación iniciada');
      window.open(data.auth_url, '_blank');
      setShowDrafts(true);
    } catch (err) {
      setOutlookStatus({ text: 'Error: ' + err.message, type: 'err' });
      setOutlookBtnText('Vincular Outlook / Hotmail');
    }
  }

  async function refreshDrafts() {
    const id = session.getId();
    if (!id) return;
    try {
      const data = await api.getEmailDrafts(id);
      setDrafts(data.drafts || []);
    } catch (err) {
      setDrafts([{ _error: err.message }]);
    }
  }

  // ── Survey submit ─────────────────────────────────────────────────────────
  async function submitForm() {
    const id = session.getId();
    if (!id) { alert('Sesión no encontrada. Vuelve al inicio.'); return; }

    const featResponses = [];
    for (let i = 0; i < FEAT_QUESTIONS.length; i++) {
      const { key } = FEAT_QUESTIONS[i];
      const val = featAnswers[key];
      if (!val) {
        alert(`Por favor responde la pregunta ${i + 1} de la evaluación de funciones.`);
        setFeatIdx(i);
        goTo(5);
        return;
      }
      featResponses.push({ question_key: key, score: val, comment: '' });
    }

    const featureKeys = ['feature_manual_entry','feature_export_csv','feature_loans','feature_budgets','feature_weekly_summary','feature_widget','feature_ai_insights'];
    const featureResponses = featureKeys.map(k => ({ question_key: k, score: checkboxes[k] ? 1 : 0, comment: '' }));

    const radioKeys = ['loans_mode','credit_mode','input_pref'];
    const missing = radioKeys.filter(k => !radioSel[k]);
    if (missing.length > 0) {
      setPrefError('Por favor responde todas las preguntas antes de enviar.');
      return;
    }
    setPrefError('');
    const radioResponses = radioKeys.map(k => ({ question_key: k, score: 1, comment: radioSel[k] }));

    const commentResponse = overallComment.trim()
      ? [{ question_key: 'overall_comment', score: 0, comment: overallComment.trim() }]
      : [];

    setSubmitting(true);
    try {
      await api.submitSurvey(id, [...featResponses, ...featureResponses, ...radioResponses, ...commentResponse]);
      setSubmitMsg({ text: '¡Evaluación enviada! Muchas gracias por tu tiempo.', type: 'success' });
      setSubmitted(true);
      session.clear();
    } catch {
      setSubmitMsg({ text: 'Error al enviar. Intenta de nuevo.', type: 'error' });
      setSubmitting(false);
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  const participantName = session.getName() || '';

  return (
    <div className="page-body">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-logo">Monetra</div>
        {participantName && <div className="topbar-name">{participantName}</div>}
      </div>

      {/* Stepper */}
      <div className="stepper-wrap">
        <div className="stepper">
          {[1,2,3,4,5].map((n, i) => (
            <>
              <div key={n} className={`step-dot${step > n ? ' done' : step === n ? ' active' : ''}`}>
                {step > n ? null : <span>{n}</span>}
              </div>
              {i < 4 && <div key={`line-${n}`} className={`step-line${step > n ? ' done' : ''}`} />}
            </>
          ))}
        </div>
        <div className="step-labels">
          {['Voz','Escaneo','Audio','Email','Opinión'].map(l => <span key={l}>{l}</span>)}
        </div>
      </div>

      {/* ── Step 1 — Voice ── */}
      {step === 1 && (
        <div className="step-content">
          <div className="step-header">
            <div className="step-eyebrow">Paso 1 de 5</div>
            <div className="step-title">Registra tus movimientos por voz</div>
            <p className="step-desc">Toca el micrófono y dile a la app qué registrar, como si le hablaras a alguien. No hay respuestas incorrectas — queremos ver cómo responde el sistema.</p>
          </div>

          <div className="card">
            <div className="card-title">Intenta estas 3 frases</div>
            <div className="task-list">
              {[
                { text: 'Registra un gasto',     hint: '"gasté 15 mil en almuerzo"',   cmd: 'gasté 15 mil en almuerzo' },
                { text: 'Registra un ingreso',   hint: '"recibí 200 mil de sueldo"',    cmd: 'recibí 200 mil de sueldo' },
                { text: 'Registra un préstamo',  hint: '"le presté 50 mil a Juan"',     cmd: 'le presté 50 mil a Juan' },
              ].map((task, i) => (
                <div key={i} className={`task-item${tasksCompleted[i] ? ' done' : ''}`} onClick={() => runTextCommand(task.cmd)}>
                  <div className="task-num">{tasksCompleted[i] ? '✓' : i + 1}</div>
                  <div>
                    <div className="task-text">{task.text}</div>
                    <div className="task-suggestion">{task.hint}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="voice-area">
              <button
                className={`mic-btn${voiceState === 'recording' ? ' recording' : voiceState === 'processing' ? ' processing' : ''}`}
                onClick={toggleRecording}
                disabled={voiceState === 'processing'}
              >
                <svg className="mic-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-2 4v6a2 2 0 1 0 4 0V5a2 2 0 1 0-4 0zm-4 6a6 6 0 0 0 12 0h2a8 8 0 0 1-7 7.93V21h2v2H9v-2h2v-2.07A8 8 0 0 1 4 11H6z"/>
                </svg>
              </button>
              <div className={`voice-status${voiceState === 'recording' ? ' recording' : ''}`}>{voiceText}</div>
              {transcript && <div className="transcript-preview">{transcript}</div>}
            </div>

            {parsed && (
              <div className="result-card">
                {!parsed.result.success ? (
                  <div className="result-error-msg">{parsed.result.error || 'El sistema no pudo interpretar el comando.'}</div>
                ) : (() => {
                  const intent = parsed.result.parsed_intent || {};
                  const income = isIncomeType(intent.type);
                  return (
                    <>
                      <div className="result-row"><span className="result-label">Tipo</span><span className="result-value">{TYPE_LABELS[intent.type] || intent.type || '—'}</span></div>
                      <div className="result-row"><span className="result-label">Monto</span><span className={`result-value result-amount${income ? ' income' : ''}`}>{income ? '+' : '-'}{fmtAmount(intent.amount)}</span></div>
                      <div className="result-row"><span className="result-label">Descripción</span><span className="result-value">{intent.description || '—'}</span></div>
                      <div className="result-row"><span className="result-label">Categoría</span><span className="result-value">{intent.category_name || '—'}</span></div>
                      <div className="result-actions">
                        <button className="btn-confirm" onClick={confirmTx}>Confirmar</button>
                        <button className={`btn-correct${correctionRef.current ? ' recording' : ''}`} onClick={startCorrection}>Corregir</button>
                        <button className="btn-reject" onClick={rejectTx}>Rechazar</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="card">
            <div className="tx-list-label">Lo que registraste hasta ahora</div>
            <ul className="tx-list">
              {transactions.length === 0 ? (
                <li className="tx-empty">Nada todavía — intenta una frase de arriba</li>
              ) : transactions.map((tx, i) => {
                const income = isIncomeType(tx.intent.type);
                return (
                  <li key={i} className="tx-item">
                    <div>
                      <div className="tx-desc">{tx.intent.description || tx.inputText}</div>
                      <div className="tx-meta">{TYPE_LABELS[tx.intent.type] || tx.intent.type || '—'} · {tx.intent.category_name || '—'}</div>
                    </div>
                    <div className={`tx-amount ${income ? 'income' : 'expense'}`}>{income ? '+' : '-'}{fmtAmount(tx.intent.amount)}</div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card">
            <div className="card-title">Más frases para explorar</div>
            <div className="pills-label">Tócalas para ejecutarlas directamente:</div>
            <div className="pill-row">
              {['compré 10 mil de queso','gasté 30 mil en transporte','pagué 80 mil de arriendo','recibí 50 mil de freelance'].map(p => (
                <span key={p} className="pill" onClick={() => runTextCommand(p)}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2 — Scan ── */}
      {step === 2 && (
        <div className="step-content">
          <div className="step-header">
            <div className="step-eyebrow">Paso 2 de 5</div>
            <div className="step-title">Escanea una factura o recibo</div>
            <p className="step-desc">Sube una foto o PDF de cualquier factura, recibo o captura de compra. La app extrae el monto, descripción y categoría de forma automática.</p>
          </div>

          <div className="card">
            <input type="file" id="scanFileUser" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" style={{ display: 'none' }} onChange={runUserScan} />
            <button className="btn-upload" onClick={() => document.getElementById('scanFileUser').click()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Subir imagen o PDF
            </button>
            {scanLoading && <div className="status-text" style={{ marginTop: 14 }}>Procesando…</div>}
            {scanResult && !scanLoading && (
              scanResult.ok ? (
                <div className="result-card" style={{ marginTop: 14 }}>
                  <div className="result-row"><span className="result-label">Tipo</span><span className="result-value">{TYPE_LABELS[scanResult.intent.type] || scanResult.intent.type || '—'}</span></div>
                  <div className="result-row"><span className="result-label">Monto</span><span className={`result-value result-amount${isIncomeType(scanResult.intent.type) ? ' income' : ''}`}>{isIncomeType(scanResult.intent.type) ? '+' : '-'}{fmtAmount(scanResult.intent.amount)}</span></div>
                  <div className="result-row"><span className="result-label">Descripción</span><span className="result-value">{scanResult.intent.description || '—'}</span></div>
                  <div className="result-row"><span className="result-label">Categoría</span><span className="result-value">{scanResult.intent.category_name || '—'}</span></div>
                </div>
              ) : (
                <div className="status-text err" style={{ marginTop: 14 }}>{scanResult.error}</div>
              )
            )}
          </div>

          <div className="card" style={{ borderStyle: 'dashed', background: 'transparent' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>¿No tienes una factura a mano?</strong><br />
              Puedes sacarle foto a un recibo de supermercado, una pantalla de Nequi/Bancolombia, o cualquier comprobante de pago. Funciona con JPG, PNG y PDF.
            </p>
          </div>
        </div>
      )}

      {/* ── Step 3 — TTS ── */}
      {step === 3 && (
        <div className="step-content">
          <div className="step-header">
            <div className="step-eyebrow">Paso 3 de 5</div>
            <div className="step-title">Escucha cómo te habla la app</div>
            <p className="step-desc">Además de entender tu voz, Monetra puede responderte en voz alta con un resumen de tus movimientos. Toca el botón para escuchar una muestra.</p>
          </div>

          <div className="card">
            <button className="btn-action" onClick={runTTS} disabled={ttsLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              {ttsLoading ? 'Generando audio…' : 'Escuchar respuesta de voz'}
            </button>
            {ttsUrl && <audio className="tts-audio" src={ttsUrl} controls autoPlay />}
            {ttsStatus.text && <div className={`status-text${ttsStatus.type ? ' ' + ttsStatus.type : ''}`}>{ttsStatus.text}</div>}
          </div>
        </div>
      )}

      {/* ── Step 4 — Email ── */}
      {step === 4 && (
        <div className="step-content">
          <div className="step-header">
            <div className="step-eyebrow">Paso 4 de 5</div>
            <div className="step-title">Correos bancarios detectados solos</div>
            <p className="step-desc">Monetra monitorea tu correo y detecta automáticamente los emails de cobros, pagos y transferencias. Elige una de las dos opciones para probarlo.</p>
          </div>

          <div className="card" style={{ opacity: 0.65 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div className="option-label" style={{ marginBottom: 0 }}>Opción 1 — Cuenta Gmail de prueba</div>
              <span className="badge-wip">Próximamente</span>
            </div>
            <div className="option-desc">Te asignamos una cuenta Gmail del pool de pruebas. Envíale un email con texto de banco y la app lo detectará sola.</div>
            <button className="btn-action" disabled style={{ cursor: 'not-allowed' }}>
              No disponible aún
            </button>
          </div>

          <div className="card">
            <div className="option-label">Opción 2 — Tu cuenta Outlook / Hotmail</div>
            <div className="option-desc">Autoriza el acceso para que la app monitoree en tiempo real los emails de transacciones que lleguen a tu bandeja de Outlook.</div>
            <button className="btn-action" onClick={linkOutlook} disabled={outlookLinked}>
              {outlookBtnText}
            </button>
            {outlookStatus.text && <div className={`status-text${outlookStatus.type ? ' ' + outlookStatus.type : ''}`}>{outlookStatus.text}</div>}
          </div>

          {showDrafts && (
            <div className="email-drafts-wrap">
              <div className="card">
                <div className="tx-list-label">Emails detectados</div>
                <ul className="tx-list">
                  {drafts.length === 0 ? (
                    <li className="tx-empty">Ningún email detectado todavía.</li>
                  ) : drafts.map((d, i) => {
                    if (d._error) return <li key={i} className="tx-empty" style={{ color: 'var(--red)' }}>Error: {d._error}</li>;
                    const income = isIncomeType(d.TxType);
                    return (
                      <li key={i} className="tx-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div className="tx-desc">{d.Subject || '(sin asunto)'}</div>
                            <div className="tx-meta">{d.FromAddress || '—'} · {TYPE_LABELS[d.TxType] || d.TxType || '—'}</div>
                          </div>
                          <div className={`tx-amount ${income ? 'income' : 'expense'}`}>{income ? '+' : '-'}{fmtAmount(d.Amount)}</div>
                        </div>
                        {(d.Description || d.Category) && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', gap: 16 }}>
                            {d.Description && <span><strong>Desc:</strong> {d.Description}</span>}
                            {d.Category && <span><strong>Cat:</strong> {d.Category}</span>}
                          </div>
                        )}
                        {!d.Confirmed && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-confirm" style={{ fontSize: '0.78rem', padding: '6px 14px' }} onClick={async () => {
                              const id = session.getId();
                              await api.confirmEmailDraft(id, d.ID);
                              refreshDrafts();
                            }}>Aceptar</button>
                            <button className="btn-reject" style={{ fontSize: '0.78rem', padding: '6px 14px' }} onClick={async () => {
                              const id = session.getId();
                              await api.deleteEmailDraft(id, d.ID);
                              refreshDrafts();
                            }}>Rechazar</button>
                          </div>
                        )}
                        {d.Confirmed && <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>✓ Aceptado</div>}
                      </li>
                    );
                  })}
                </ul>
                <button className="small-refresh" onClick={refreshDrafts}>Actualizar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 5 — Survey ── */}
      {step === 5 && featIdx < FEAT_QUESTIONS.length && (
        <div className="step-content">
          <div className="step-header">
            <div className="step-eyebrow">Paso 5 de 5 — Tu opinión</div>
            <div className="step-title">¿Qué te pareció cada función?</div>
            <p className="step-desc">Cuéntanos cómo te fue con cada parte que probaste. No hay respuestas correctas.</p>
          </div>

          {/* Progress dots */}
          <div className="sus-dots">
            {FEAT_QUESTIONS.map((_, i) => {
              const answered = featAnswers[FEAT_QUESTIONS[i].key] !== undefined;
              return (
                <button
                  key={i}
                  className={`sus-dot${i === featIdx ? ' active' : ''}${answered ? ' done' : ''}`}
                  onClick={() => setFeatIdx(i)}
                  title={`Pregunta ${i + 1}`}
                />
              );
            })}
          </div>

          {/* Single feature question card */}
          {(() => {
            const { key, q } = FEAT_QUESTIONS[featIdx];
            return (
              <div className="sus-card">
                <div className="sus-card-num">{featIdx + 1} / {FEAT_QUESTIONS.length}</div>
                <div className="sus-card-q">{q}</div>
                <div className="sus-scale">
                  {FEAT_SCALE.map((label, vi) => {
                    const v = vi + 1;
                    const sel = featAnswers[key] === v;
                    return (
                      <button
                        key={v}
                        className={`sus-scale-btn${sel ? ' selected' : ''}`}
                        onClick={() => setFeatAnswers(p => ({ ...p, [key]: v }))}
                      >
                        <span className="sus-scale-num">{v}</span>
                        <span className="sus-scale-lbl">{label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="sus-nav">
                  <button
                    className="sus-nav-btn"
                    onClick={() => setFeatIdx(i => Math.max(0, i - 1))}
                    disabled={featIdx === 0}
                  >← Anterior</button>
                  <button
                    className={`sus-nav-btn primary${featAnswers[key] === undefined ? ' locked' : ''}`}
                    onClick={() => {
                      if (featAnswers[key] === undefined) return;
                      setFeatIdx(i => i + 1);
                    }}
                  >
                    {featIdx === FEAT_QUESTIONS.length - 1 ? 'Ver preferencias →' : 'Siguiente →'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {step === 5 && featIdx >= FEAT_QUESTIONS.length && (
        <div className="step-content">
          <div className="step-header">
            <div className="step-eyebrow">Paso 5 de 5 — Casi listo</div>
            <div className="step-title">Cuéntanos más</div>
            <p className="step-desc">Unas últimas preguntas sobre lo que más te gustaría ver en la app.</p>
          </div>

          {/* ── Features ── */}
          <div className="pref-block">
            <div className="pref-block-title">
              ¿Qué funciones te gustaría que tuviera?
              <span className="pref-hint"> Marca todas las que quieras</span>
            </div>
            <div className="checkbox-group">
              {[
                { key: 'feature_manual_entry',  label: 'Escribir gastos a mano (sin usar la voz)' },
                { key: 'feature_export_csv',     label: 'Descargar mis movimientos en Excel' },
                { key: 'feature_loans',          label: 'Llevar el control de préstamos y deudas' },
                { key: 'feature_budgets',        label: 'Establecer un presupuesto mensual' },
                { key: 'feature_weekly_summary', label: 'Recibir un resumen de mis gastos cada semana' },
                { key: 'feature_widget',         label: 'Ver mi saldo del mes en la pantalla del teléfono' },
                { key: 'feature_ai_insights',    label: 'Recibir sugerencias sobre mis hábitos de gasto' },
              ].map(({ key, label }) => (
                <div key={key} className={`checkbox-item${checkboxes[key] ? ' checked' : ''}`} onClick={() => setCheckboxes(p => ({ ...p, [key]: !p[key] }))}>
                  <div className="check-box">{checkboxes[key] ? '✓' : ''}</div>
                  <span className="checkbox-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Loans mode ── */}
          <div className="pref-block">
            <div className="pref-block-title">
              Si le dices a la app "le presté $50.000 a Juan", ¿cómo preferirías que lo registrara?
              {!radioSel.loans_mode && prefError && <span className="pref-required">Requerido</span>}
            </div>
            <div className="radio-group">
              {[
                { val: 'automatic',      title: 'Que lo guarde sola',       sub: 'Sin pedirme nada más, lo detecta y registra automáticamente.' },
                { val: 'hybrid',         title: 'Que me pida confirmar',     sub: 'Me muestra lo que entendió y yo apruebo antes de guardar.' },
                { val: 'manual',         title: 'Prefiero anotarlo yo',      sub: 'Que me abra un formulario para llenar los datos.' },
                { val: 'not_interested', title: 'No uso préstamos / no me interesa' },
              ].map(o => (
                <div key={o.val} className={`radio-item${radioSel.loans_mode === o.val ? ' selected' : ''}`} onClick={() => setRadioSel(p => ({ ...p, loans_mode: o.val }))}>
                  <div className="radio-item-header"><div className="radio-dot" /><span className="radio-title">{o.title}</span></div>
                  {o.sub && <div className="radio-sub">{o.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Credit mode ── */}
          <div className="pref-block">
            <div className="pref-block-title">
              Cuando pagas una cuota de un crédito, ¿cómo te gustaría registrarlo?
              {!radioSel.credit_mode && prefError && <span className="pref-required">Requerido</span>}
            </div>
            <div className="radio-group">
              {[
                { val: 'automatic',         title: 'Que la app lo calcule sola',         sub: 'Le digo la tasa una vez y ella divide capital e intereses cada mes.' },
                { val: 'with_confirmation', title: 'Que me muestre el desglose y yo apruebe', sub: 'La app calcula y me pide confirmar antes de guardar.' },
                { val: 'simple',            title: 'Registrarlo como un gasto normal',   sub: 'Sin dividir en capital e intereses, solo el total pagado.' },
                { val: 'not_applicable',    title: 'No tengo créditos / no me aplica' },
              ].map(o => (
                <div key={o.val} className={`radio-item${radioSel.credit_mode === o.val ? ' selected' : ''}`} onClick={() => setRadioSel(p => ({ ...p, credit_mode: o.val }))}>
                  <div className="radio-item-header"><div className="radio-dot" /><span className="radio-title">{o.title}</span></div>
                  {o.sub && <div className="radio-sub">{o.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Input preference ── */}
          <div className="pref-block">
            <div className="pref-block-title">
              En el día a día, ¿cómo preferirías registrar tus gastos?
              {!radioSel.input_pref && prefError && <span className="pref-required">Requerido</span>}
            </div>
            <div className="radio-group">
              {[
                { val: 'voice_only',    title: 'Solo por voz',                sub: 'Siempre hablo con la app.' },
                { val: 'mostly_voice',  title: 'Principalmente por voz',      sub: 'Voz casi siempre, pero quiero tener un botón para escribir si lo necesito.' },
                { val: 'half_half',     title: 'Mitad voz, mitad escritura',   sub: 'Depende del momento.' },
                { val: 'mostly_manual', title: 'Principalmente escribiendo',   sub: 'Prefiero escribir, pero me gustaría poder usar la voz de vez en cuando.' },
                { val: 'manual_only',   title: 'Solo escribiendo',             sub: 'No me interesa la función de voz.' },
              ].map(o => (
                <div key={o.val} className={`radio-item${radioSel.input_pref === o.val ? ' selected' : ''}`} onClick={() => setRadioSel(p => ({ ...p, input_pref: o.val }))}>
                  <div className="radio-item-header"><div className="radio-dot" /><span className="radio-title">{o.title}</span></div>
                  {o.sub && <div className="radio-sub">{o.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Optional feedback ── */}
          <div className="pref-block">
            <div className="pref-block-title">
              ¿Algo más que quieras contarnos? <span className="pref-hint">Opcional</span>
            </div>
            <textarea
              className="feedback-textarea"
              placeholder="Escribe aquí cualquier comentario, sugerencia o crítica sobre tu experiencia con la app..."
              value={overallComment}
              onChange={e => setOverallComment(e.target.value)}
              rows={4}
            />
          </div>

          {prefError && <div className="pref-error-msg">{prefError}</div>}

          <div className="submit-area">
            <button className="btn-submit" onClick={submitForm} disabled={submitting || submitted}>
              {submitted ? 'Enviado ✓' : submitting ? 'Enviando…' : 'Enviar y finalizar'}
            </button>
            {submitMsg.text && <div className={`submit-msg ${submitMsg.type}`}>{submitMsg.text}</div>}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="nav-bar-wrap">
        {navError && <div className="nav-error">{navError}</div>}
        <div className="nav-bar">
          <button className="btn-back" onClick={() => {
            if (step === 5 && featIdx >= FEAT_QUESTIONS.length) { setFeatIdx(FEAT_QUESTIONS.length - 1); }
            else { goTo(step - 1); }
          }} disabled={step === 1 && featIdx === 0}>← Anterior</button>
          {step < TOTAL_STEPS && (
            <button className="btn-next" onClick={tryNext}>Siguiente →</button>
          )}
          {step === TOTAL_STEPS && featIdx < FEAT_QUESTIONS.length && !submitted && (
            <button className="btn-next" style={{ opacity: 0.5, fontSize: '0.8rem' }} onClick={() => setFeatIdx(FEAT_QUESTIONS.length)}>Saltar encuesta</button>
          )}
        </div>
      </div>
    </div>
  );
}
