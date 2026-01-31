import { Link } from 'react-router-dom';
import { ChefHat, Settings, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/admin" className="group relative bg-slate-800 p-8 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-500 flex flex-col items-center text-center">
          <div className="bg-blue-500/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <Settings className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">管理後台</h2>
          <p className="text-slate-400">菜單設定、POS 結帳、營收統計</p>
        </Link>

        <Link to="/kitchen" className="group relative bg-slate-800 p-8 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-500 flex flex-col items-center text-center">
          <div className="bg-orange-500/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <ChefHat className="w-12 h-12 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">廚房看板</h2>
          <p className="text-slate-400">即時接單、出餐管理</p>
        </Link>

        <Link to="/table/1" className="group relative bg-slate-800 p-8 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-500 flex flex-col items-center text-center">
          <div className="bg-green-500/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <Smartphone className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">顧客點餐 (模擬)</h2>
          <p className="text-slate-400">模擬掃描桌號 1 QR Code</p>
        </Link>
      </div>
    </div>
  );
}
