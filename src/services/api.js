const BASE_URL = 'https://api.monetra.lat';

export const api = {
  async createSession(name, sessionType, notes = '') {
    const res = await fetch(`${BASE_URL}/instrument/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, session_type: sessionType, notes }),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
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
    return res.json();
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
    return res.json();
  },

  async getTransactions(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/transactions`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async getResults() {
    const res = await fetch(`${BASE_URL}/instrument/results`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
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
    return res.json();
  },

  async scanInvoice(formData) {
    const res = await fetch(`${BASE_URL}/instrument/scan`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async tts(text) {
    const res = await fetch(`${BASE_URL}/instrument/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`TTS error ${res.status}`);
    return res.blob();
  },

  async getStats(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/stats`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async startOutlookOAuth(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/link-outlook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async claimGmail(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/claim-gmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async getEmailDrafts(sessionId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/drafts`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async confirmEmailDraft(sessionId, draftId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/drafts/${draftId}/confirm`, { method: 'PATCH' });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async deleteEmailDraft(sessionId, draftId) {
    const res = await fetch(`${BASE_URL}/instrument/sessions/${sessionId}/email/drafts/${draftId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  async getProviders() {
    const res = await fetch(`${BASE_URL}/instrument/benchmark/providers`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },
};

export default api;
