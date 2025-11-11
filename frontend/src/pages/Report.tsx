import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface Expense { categoria?: string; valor: number; }

const COLORS = ['#1e293b', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Report() {
  const { id } = useParams();
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function fetchReport() {
      const resp = await api.get(`/projects/${id}/report/json`);
      const items = resp.data.items as Expense[];
      const grouped: Record<string, number> = {};
      items.forEach((e) => {
        const key = e.categoria || 'Sem categoria';
        grouped[key] = (grouped[key] || 0) + Number(e.valor);
      });
      const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }));
      setData(chartData);
    }
    fetchReport();
  }, [id]);

  async function exportCSV() {
    const resp = await api.get(`/projects/${id}/report/csv`, { responseType: 'blob' });
    const url = URL.createObjectURL(resp.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_projeto_${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const resp = await api.get(`/projects/${id}/report/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(resp.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_projeto_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Relatório</h1>
      <div className="h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-slate-800 text-white rounded" onClick={exportCSV}>Exportar CSV</button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={exportPDF}>Exportar PDF</button>
      </div>
    </div>
  );
}