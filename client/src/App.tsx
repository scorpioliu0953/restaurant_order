import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CustomerOrder from './pages/CustomerOrder';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/table/:tableId" element={<CustomerOrder />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
