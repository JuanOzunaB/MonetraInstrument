import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import UserEval from './pages/UserEval.jsx'
import ExpertEval from './pages/ExpertEval.jsx'
import Benchmark from './pages/Benchmark.jsx'
import Dashboard from './pages/Dashboard.jsx'
import OAuthCallback from './pages/OAuthCallback.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/user" element={<UserEval />} />
      <Route path="/benchmark" element={<Benchmark />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
