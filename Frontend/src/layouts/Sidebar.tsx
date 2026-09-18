import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Cpu, 
  GitBranch, 
  Building2, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  KeyRound, 
  FolderLock, 
  History, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Globe2,
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { currentUser, isSuperAdmin, isTahsildar, isSurveyor, isSubRegistrar, isRevenueOfficer } = useAuth();

  const [govExpanded, setGovExpanded] = useState(true);
  const [orgExpanded, setOrgExpanded] = useState(true);
  const [accessExpanded, setAccessExpanded] = useState(true);

  const isCurrentActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClasses = (path: string) => {
    const active = isCurrentActive(path);
    return `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
      active
        ? 'bg-black text-white shadow-sm font-bold'
        : 'text-slate-600 hover:text-black hover:bg-slate-100'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-black text-white shadow-sm">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-slate-900">BHU-TWIN</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  NATIONAL
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                GIS Land Governance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 lg:hidden hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Dashboard */}
          <div>
            <NavLink to="/" onClick={onClose} className={navLinkClasses('/')}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </NavLink>
          </div>

          {/* Section: Land Governance */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setGovExpanded(!govExpanded)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors"
            >
              <span>Land Governance</span>
              {govExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {govExpanded && (
              <div className="space-y-1 pl-1">
                <NavLink
                  to="/governance/verification"
                  onClick={onClose}
                  className={navLinkClasses('/governance/verification')}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>Land Verification</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                    isCurrentActive('/governance/verification')
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    4 Stages
                  </span>
                </NavLink>

                <NavLink
                  to="/governance/digital-twins"
                  onClick={onClose}
                  className={navLinkClasses('/governance/digital-twins')}
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-4 h-4" />
                    <span>Land Maps & Parcels</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    isCurrentActive('/governance/digital-twins')
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    GIS Maps
                  </span>
                </NavLink>

                <NavLink
                  to="/governance/ownership-history"
                  onClick={onClose}
                  className={navLinkClasses('/governance/ownership-history')}
                >
                  <div className="flex items-center gap-2.5">
                    <GitBranch className="w-4 h-4" />
                    <span>Ownership History</span>
                  </div>
                  <span className="text-[10px] font-medium opacity-80">Lineage</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Section: Organization (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setOrgExpanded(!orgExpanded)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors"
              >
                <span>Organization</span>
                {orgExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {orgExpanded && (
                <div className="space-y-1 pl-1">
                  <NavLink
                    to="/organization/departments"
                    onClick={onClose}
                    className={navLinkClasses('/organization/departments')}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4" />
                      <span>Departments</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/organization/designations"
                    onClick={onClose}
                    className={navLinkClasses('/organization/designations')}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4" />
                      <span>Designations</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/organization/officers"
                    onClick={onClose}
                    className={navLinkClasses('/organization/officers')}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" />
                      <span>Officers</span>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Section: Access Control (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setAccessExpanded(!accessExpanded)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors"
              >
                <span>Access Control</span>
                {accessExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {accessExpanded && (
                <div className="space-y-1 pl-1">
                  <NavLink
                    to="/access-control/roles"
                    onClick={onClose}
                    className={navLinkClasses('/access-control/roles')}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Roles</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/access-control/permissions"
                    onClick={onClose}
                    className={navLinkClasses('/access-control/permissions')}
                  >
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4" />
                      <span>Permissions</span>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Section: Documents */}
          <div>
            <NavLink to="/documents" onClick={onClose} className={navLinkClasses('/documents')}>
              <div className="flex items-center gap-2.5">
                <FolderLock className="w-4 h-4" />
                <span>Certified Documents</span>
              </div>
              <span className="text-[10px] font-medium opacity-80">Deeds</span>
            </NavLink>
          </div>

          {/* Section: Audit Logs */}
          <div>
            <NavLink to="/audit-logs" onClick={onClose} className={navLinkClasses('/audit-logs')}>
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" />
                <span>Activity & Audit Logs</span>
              </div>
            </NavLink>
          </div>

          {/* Section: Settings (Super Admin Only) */}
          {isSuperAdmin && (
            <div>
              <NavLink to="/settings" onClick={onClose} className={navLinkClasses('/settings')}>
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              </NavLink>
            </div>
          )}
        </div>

        {/* User Scope / Jurisdiction Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-600 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                <span className="truncate">{currentUser.scope.taluk ? `${currentUser.scope.taluk} Taluk` : 'All-India'}</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
