import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Project { id: number; name: string; status: string; }

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  async function load() {
    const { data } = await api.get('/projects');
    setProjects(data);
  }

  useEffect(() => { load(); }, []);

  async function createProject() {
    if (!name) return;
    await api.post('/projects', { name, address });
    setName(''); setAddress('');
    load();
  }

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-2">
        <input className="border px-3 py-2 rounded flex-1" placeholder="Nome da obra" value={name} onChange={e => setName(e.target.value)} />
        <input className="border px-3 py-2 rounded flex-1" placeholder="Endereço (opcional)" value={address} onChange={e => setAddress(e.target.value)} />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={createProject}>Criar</button>
      </div>
      <div className="grid gap-3">
        {projects.map(p => (
          <Link key={p.id} to={`/projects/${p.id}`} className="block bg-white p-4 rounded shadow">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">Status: {p.status}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}