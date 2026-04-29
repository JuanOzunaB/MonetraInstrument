// api.js — Shared API client for the Monetra thesis instrument.
const BASE_URL = 'https://api.monetra.lat';

const api = {
  async createSession(name, sessionType, notes = '') {
    const res = await fetch(`${BASE_URL}/instrument/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, session_type: sessionType, notes }),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { id }
  },

  async submitSurvey(sessionId, responses) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/survey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses }),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async submitBenchmark(sessionId, result) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async runLLMBenchmark(text, provider = '', originalText = '', originalIntent = '') {
    const body = { text, provider };
    if (originalText) body.original_text = originalText;
    if (originalIntent) body.original_intent = originalIntent;
    const res = await fetch(`${BASE_URL}/instrument/benchmark/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { success, provider, latency_ms, parsed_intent?, error? }
  },

  async saveTransaction(sessionId, tx) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async transcribe(audioBlob) {
    const res = await fetch(`${BASE_URL}/instrument/stt`, {
      method: 'POST',
      headers: { 'Content-Type': audioBlob.type || 'audio/webm' },
      body: audioBlob,
    });
    if (!res.ok) throw new Error(`STT error ${res.status}`);
    return res.json(); // { transcript }
  },

  async getTransactions(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/transactions`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { transactions }
  },

  async getResults() {
    const res = await fetch(`${BASE_URL}/instrument/results`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { sessions, surveys, benchmarks }
  },

  async checkHealth() {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/health`);
    const latency = Math.round(performance.now() - start);
    return { success: res.ok, latency_ms: latency };
  },

  async parse(text, sessionId = 0, provider = '') {
    const res = await fetch(`${BASE_URL}/instrument/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, session_id: sessionId, provider }),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { success, parsed_intent, latency_ms }
  },

  async scanInvoice(formData) {
    const res = await fetch(`${BASE_URL}/instrument/scan`, {
      method: 'POST',
      body: formData, // multipart/form-data with field "file"
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { success, parsed_intent, latency_ms }
  },

  async tts(text) {
    const res = await fetch(`${BASE_URL}/instrument/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`TTS error ${res.status}`);
    return res.blob(); // audio/mpeg blob
  },

  async getStats(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/stats`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { transactions_count, email_drafts_count, benchmarks_count, avg_latency_ms }
  },

  async startOutlookOAuth(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/link-outlook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { auth_url }
  },

  async claimGmail(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/claim-gmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { email_address }
  },

  async getEmailDrafts(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/drafts`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json(); // { drafts: [...] }
  },
};

// Shared session state stored in sessionStorage
const session = {
  save(id, name, type) {
    sessionStorage.setItem('instrument_session_id', id);
    sessionStorage.setItem('instrument_session_name', name);
    sessionStorage.setItem('instrument_session_type', type);
  },
  getId() { return sessionStorage.getItem('instrument_session_id'); },
  getName() { return sessionStorage.getItem('instrument_session_name'); },
  getType() { return sessionStorage.getItem('instrument_session_type'); },
  clear() { sessionStorage.removeItem('instrument_session_id'); sessionStorage.removeItem('instrument_session_name'); sessionStorage.removeItem('instrument_session_type'); },
};
