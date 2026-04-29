import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import session from '../services/session.js';

const TYPES = [
  { id: 'user',      icon: 'USR', name: 'Usuario',  desc: 'Prueba de usabilidad' },
  { id: 'benchmark', icon: 'TEC', name: 'Técnico',  desc: 'Evaluación técnica' },
];

const ROUTES = { user: '/user', benchmark: '/benchmark' };

export default function Landing() {
  const navigate = useNavigate();
  const [name, setName]           = useState('');
  const [selectedType, setType]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const canStart = name.trim() && selectedType;

  async function start() {
    if (!canStart) return;
    setError('');
    setLoading(true);
    try {
      const { id } = await api.createSession(name.trim(), selectedType);
      session.save(id, name.trim(), selectedType);
      navigate(ROUTES[selectedType]);
    } catch {
      setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
      setLoading(false);
    }
  }

  return (
    <div className="landing-wrap">
      <div className="landing-card">
        <div className="wordmark">Monetra</div>
        <h1>Instrumento de evaluación</h1>
        <p className="subtitle">Tesis de grado · Evaluación de asistente financiero por voz</p>

        <label className="field-label" htmlFor="nameInput">Tu nombre</label>
        <input
          id="nameInput"
          className="text-input"
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && canStart && start()}
        />

        <div className="type-label">Tipo de sesión</div>
        <div className="type-grid">
          {TYPES.map(t => (
            <div
              key={t.id}
              className={`type-card${selectedType === t.id ? ' selected' : ''}`}
              onClick={() => setType(t.id)}
            >
              <div className="type-icon">{t.icon}</div>
              <div className="type-name">{t.name}</div>
              <div className="type-desc">{t.desc}</div>
            </div>
          ))}
        </div>

        <button className="btn" onClick={start} disabled={!canStart || loading}>
          {loading ? 'Creando sesión…' : 'Comenzar'}
        </button>
        {error && <div className="error-msg">{error}</div>}
      </div>
      <Link to="/dashboard" className="landing-dash-link">Ver resultados →</Link>
    </div>
  );
}
