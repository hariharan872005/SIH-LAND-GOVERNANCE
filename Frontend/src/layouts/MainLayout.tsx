import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export interface ScopeContextValue {
  selectedState: string;
  setSelectedState: (state: string) => void;
}

export const ScopeContext = React.createContext<ScopeContextValue>({
  selectedState: 'ALL',
  setSelectedState: () => {},
});

export const useAdminScope = () => React.useContext(ScopeContext);

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('ALL');

  return (
    <ScopeContext.Provider value={{ selectedState, setSelectedState }}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-black selection:text-white">
        {/* Responsive Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-200">
          {/* Topbar */}
          <Topbar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            selectedStateFilter={selectedState}
            onStateFilterChange={setSelectedState}
          />

          {/* Page Body Container */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>

          {/* Enterprise Footer */}
          <footer className="px-6 py-4 bg-white border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-700">National Land Governance & Cadastral Spatial Engine</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
              <span>GeoServer WFS 2.0</span>
              <span>•</span>
              <span>PostGIS Spatial 3.4</span>
              <span>•</span>
              <span>Neo4j Cypher 5.18</span>
              <span>•</span>
              <span>MinIO Object Vault</span>
            </div>
          </footer>
        </div>
      </div>
    </ScopeContext.Provider>
  );
};
