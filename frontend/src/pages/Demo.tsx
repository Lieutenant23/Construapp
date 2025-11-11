import { Link, useNavigate } from 'react-router-dom';

export default function Demo() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Construapp — Demo</h1>
      <p className="text-gray-700">Explore os recursos principais da aplicação: gestão de obras, lançamentos de gastos e geração de relatórios.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Painel</h2>
          <p className="text-sm text-gray-600">Veja suas obras e crie novas rapidamente.</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Gastos</h2>
          <p className="text-sm text-gray-600">Lance gastos com descrição, valor e categoria.</p>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Relatórios</h2>
          <p className="text-sm text-gray-600">Gere gráfico de pizza por categoria e exporte CSV/PDF.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-slate-800 text-white rounded"
          onClick={() => navigate('/login')}
        >Fazer login</button>
        <Link className="px-4 py-2 border rounded" to="/signup">Criar conta</Link>
      </div>
    </div>
  );
}