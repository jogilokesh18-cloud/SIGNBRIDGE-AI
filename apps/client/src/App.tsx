import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar.js';
import { MirrorPage } from './pages/MirrorPage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { MerchantDashboardPage } from './pages/MerchantDashboardPage.js';
import { TasteProfilePage } from './pages/TasteProfilePage.js';
import { OrdersPage } from './pages/OrdersPage.js';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-amber-400 selection:text-slate-950 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<MirrorPage />} />
          <Route path="/runway" element={<CatalogPage />} />
          <Route path="/merchant" element={<MerchantDashboardPage />} />
          <Route path="/profile" element={<TasteProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/10 py-6 text-center text-xs text-slate-500">
        <p>AURA AI • Real-Time Spatial Commerce & Generative Luxury Styling Concierge</p>
      </footer>
    </div>
  );
};
