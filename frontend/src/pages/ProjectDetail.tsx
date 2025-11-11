import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';

interface Expense {
  id: number;
  descricao: string;
  valor: number;
  categoria?: string;
  data_registro: string;
}

interface Project {
  id: number;
  name: string;
  address?: string;
  status: string;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const p = await api.get(`/projects/${id}`);
        setProject(p.data);
        const e = await api.get(`/projects/${id}/expenses`);
        setExpenses(e.data);
      } catch (err) {
        setError('Falha ao carregar dados do projeto');
      }
    }
    fetchData();
  }, [id]);

  async function addExpense() {
    try {
      const resp = await api.post('/expenses', {
        projectId: Number(id),
        descricao,
        valor: Number(valor.replace(/[^0-9.,]/g, '').replace(',', '.')),
        categoria: categoria || undefined,
      });
      setExpenses((prev) => [resp.data, ...prev]);
      setDescricao('');
      setValor('');
      setCategoria('');
    } catch (err) {
      setError('Erro ao adicionar gasto');
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Detalhe da Obra</h1>
        <Link to={`/projects/${id}/report`} className="px-3 py-2 bg-blue-600 text-white rounded">Relatório</Link>
      </div>

      {project && (
        <div className="border p-3 rounded">
          <div className="font-semibold">{project.name}</div>
          {project.address && <div className="text-sm text-gray-600">{project.address}</div>}
          <div className="text-sm">Status: {project.status}</div>
        </div>
      )}

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-4">
        <input className="border p-2 rounded" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Categoria (opcional)" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <button className="bg-green-600 text-white rounded" onClick={addExpense}>Adicionar</button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Descrição</th>
            <th className="p-2 border">Valor</th>
            <th className="p-2 border">Categoria</th>
            <th className="p-2 border">Data</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((g) => (
            <tr key={g.id}>
              <td className="p-2 border">{g.descricao}</td>
              <td className="p-2 border">R$ {Number(g.valor).toFixed(2)}</td>
              <td className="p-2 border">{g.categoria || '-'}</td>
              <td className="p-2 border">{new Date(g.data_registro).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}