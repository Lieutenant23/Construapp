import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Report from './pages/Report';
import Demo from './pages/Demo';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow px-6 py-3 flex justify-between">
        <Link to="/" className="font-semibold">Construapp</Link>
        <NavActions />
      </nav>
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Demo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/app" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
          <Route path="/projects/:id/report" element={<PrivateRoute><Report /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function NavActions() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  useEffect(() => {
    const i = setInterval(() => setToken(localStorage.getItem('token')), 500);
    return () => clearInterval(i);
  }, []);
  return token ? (
    <button className="text-sm" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Sair</button>
  ) : null;
}