import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  Shield, 
  Globe, 
  CheckCircle2, 
  ExternalLink, 
  LogOut, 
  HelpCircle,
  Command,
  Database,
  Layers,
  MapPin,
  X,
  UserCheck,
  ChevronDown,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { ALL_STATES } from '../constants/geoData';
import { useToast } from '../hooks/useToast';
import { useAuth, PREDEFINED_PERSONAS } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { OfficerRole } from '../types';

export interface TopbarProps {
  onOpenSidebar: () => void;
  selectedStateFilter: string;
  onStateFilterChange: (state: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSidebar,
  selectedStateFilter,
  onStateFilterChange
}) => {
  const navigate = useNavigate();
  const { currentUser, switchPersona, updateUserProfile, logout } = useAuth();
  const { info, success, error: toastError } = useToast();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Profile Details & Password Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileRole, setProfileRole] = useState<OfficerRole>(currentUser.role);
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    info('Signed Out', 'You have been signed out of the officer portal.');
    navigate('/login');
  };

  const handleOpenProfileModal = () => {
    setProfileName(currentUser.name);
    setProfileEmail(currentUser.email);
    setProfileRole(currentUser.role);
    setProfilePassword('');
    setProfileConfirmPassword('');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toastError('Validation Error', 'Full Name cannot be empty.');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      toastError('Validation Error', 'Please enter a valid official Username ID / Email.');
      return;
    }
    if (profilePassword || profileConfirmPassword) {
      if (profilePassword !== profileConfirmPassword) {
        toastError('Password Mismatch', 'New password and confirm password do not match.');
        return;
      }
      if (profilePassword.length < 4) {
        toastError('Password Weak', 'Password must be at least 4 characters long.');
        return;
      }
    }

    updateUserProfile({
      name: profileName.trim(),
      email: profileEmail.trim(),
      role: profileRole,
      password: profilePassword || undefined,
    });

    success(
      'Profile & Credentials Updated',
      `Officer name set to ${profileName.trim()}, username ID to ${profileEmail.trim()}, role set to ${profileRole.replace('_', ' ')}.${profilePassword ? ' Password changed successfully.' : ''}`
    );
    setIsProfileModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsPersonaMenuOpen(false);
        setIsProfileModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickJump = (path: string) => {
    setIsSearchOpen(false);
    navigate(path);
  };

  const handlePersonaSelect = (role: OfficerRole) => {
    switchPersona(role);
    setIsPersonaMenuOpen(false);
    const target = PREDEFINED_PERSONAS[role];
    success(
      `Switched to ${role.replace('_', ' ')}`,
      `Active officer: ${target.name} (${target.departmentName}) • Scope: ${target.scope.district || 'National'}`
    );
  };

  const notifications = [
    {
      id: 'n1',
      title: 'Survey Mismatch Flagged',
      desc: 'DGPS survey for MH-PUN-309 requires re-demarcation by PMRDA surveyor.',
      time: '12m ago',
      type: 'warning',
    },
    {
      id: 'n2',
      title: '4-Tier Land Clearance Achieved',
      desc: 'Parcel KA-BLR-204 (Whitefield) cleared Revenue, Survey, Registration & Municipality.',
      time: '1h ago',
      type: 'success',
    },
    {
      id: 'n3',
      title: 'New Officer Onboarded',
      desc: 'Tahsildar Priya Sharma registered under Revenue / Land Records (Bengaluru Urban).',
      time: '2h ago',
      type: 'info',
    }
  ];

  const getPersonaBadge = (role: OfficerRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'SUPER ADMIN', badgeBg: 'bg-black text-white' };
      case 'TAHSILDAR':
        return { label: 'TAHSILDAR (REV)', badgeBg: 'bg-slate-800 text-white' };
      case 'SURVEYOR':
        return { label: 'SURVEYOR (GIS)', badgeBg: 'bg-slate-900 text-white' };
      case 'SUB_REGISTRAR':
        return { label: 'SUB-REGISTRAR', badgeBg: 'bg-black text-white' };
      case 'REVENUE_OFFICER':
        return { label: 'MUNI OFFICER', badgeBg: 'bg-slate-800 text-white' };
      default:
        return { label: role, badgeBg: 'bg-black text-white' };
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 border-b border-slate-200 backdrop-blur-md">
        {/* Left Side: Sidebar Toggle & Fast Search Trigger */}
        <div className="flex items-center gap-3.5 flex-1">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-black hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all w-72 md:w-84"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="flex-1 text-left">Quick Search (Parcels, Officers, IDs)...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] text-slate-600 font-mono border border-slate-300 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side: Persona Switcher, Global Scope, Notifications */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Active Role Indicator Badge (Static display) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold">
            <UserCheck className="w-4 h-4 text-black" />
            <div className="text-left hidden md:block">
              <span className="text-[10px] text-slate-500 block leading-tight">ACTIVE ROLE:</span>
              <span className="text-xs font-extrabold text-slate-900">{getPersonaBadge(currentUser.role).label}</span>
            </div>
          </div>

          {/* Global State Scope Filter (Available for Super Admin) */}
          {currentUser.role === 'SUPER_ADMIN' ? (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-slate-500 font-medium">State Scope:</span>
              <select
                value={selectedStateFilter}
                onChange={(e) => {
                  onStateFilterChange(e.target.value);
                  info('Administrative Scope Updated', `Filtered view to ${e.target.value}`);
                }}
                aria-label="Select State Scope"
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-white text-slate-900">
                  All-India (National)
                </option>
                {ALL_STATES.map((st) => (
                  <option key={st} value={st} className="bg-white text-slate-900">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-black" />
              <span className="font-bold">{currentUser.scope.district}, {currentUser.scope.state}</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-black hover:bg-slate-100 transition-colors"
              title="System Alerts & Verification Pipeline"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black ring-4 ring-white" />
            </button>

            {/* Notifications Popover */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-black" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Live Verification Alerts
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-xs text-slate-400 hover:text-black"
                  >
                    ✕
                  </button>
                </div>

                <div className="divide-y divide-slate-100 my-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 space-y-1 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationOpen(false);
                      navigate('/audit-logs');
                    }}
                    className="text-xs text-black hover:underline font-semibold"
                  >
                    View All Audit Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge & Logout Button */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={handleOpenProfileModal}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-all text-left group cursor-pointer"
              title="Click to view Officer Details & edit Username ID/Password"
            >
              <div className="hidden xl:block text-right">
                <p className="text-xs font-bold text-slate-900 group-hover:text-black transition-colors">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{currentUser.designation}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-transparent group-hover:ring-slate-300 transition-all">
                {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out / Officer Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50">
              <Search className="w-5 h-5 text-slate-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parcels (e.g. TN-CHE-101), officers, departments..."
                autoFocus
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1">Quick Jumps</p>
              
              <button
                type="button"
                onClick={() => handleQuickJump('/governance/verification')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Land Verification Dashboard</span>
                </div>
                <span className="text-[10px] text-slate-400">Jump ↵</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickJump('/governance/digital-twins/TN-CHE-101')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-slate-700" />
                  <span>Inspect Digital Twin: TN-CHE-101 (Ambattur OT)</span>
                </div>
                <span className="text-[10px] text-slate-400">Parcel ↵</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickJump('/organization/officers')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-slate-700" />
                  <span>Officer Directory & Scope Assignment</span>
                </div>
                <span className="text-[10px] text-slate-400">Jump ↵</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickJump('/audit-logs')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <span>System Audit Trail & Diffs</span>
                </div>
                <span className="text-[10px] text-slate-400">Jump ↵</span>
              </button>
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
              <span>Press ESC to exit</span>
              <span>National Portal Search Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Security Credentials Settings Modal */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Officer Account Profile & Security Settings"
          subtitle="View officer details, update official Username ID, and change portal password."
          size="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Officer Details Read-Only Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{currentUser.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">Employee ID: {currentUser.employeeId}</p>
                </div>
                <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-black text-white font-mono">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                  <span className="text-slate-800 font-semibold">{currentUser.departmentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Designation</span>
                  <span className="text-slate-800 font-semibold">{currentUser.designation}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Jurisdictional Scope</span>
                  <span className="text-slate-800 font-semibold font-mono">
                    {currentUser.scope.district}, {currentUser.scope.state} {currentUser.scope.taluk ? `(${currentUser.scope.taluk} Taluk)` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Officer Name & Username ID */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-black" /> Officer Identity & Username ID
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username ID (Official Email)
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Officer Governance Role & Authority Designation
                  </label>
                  <select
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value as OfficerRole)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                  >
                    <option value="SUB_REGISTRAR">Sub-Registrar (Registration & Stamps Department)</option>
                    <option value="TAHSILDAR">Tahsildar (Revenue & Land Records Department)</option>
                    <option value="SURVEYOR">Cadastral Field Surveyor (Survey & Land Records)</option>
                    <option value="REVENUE_OFFICER">Municipal Revenue Officer (Local Body / Urban)</option>
                    <option value="SUPER_ADMIN">Super Admin (National Land Governance Controller)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Management */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-black" /> Security & Password
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Leave blank to keep existing password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-black pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-black cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-black pr-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Save Profile & Credentials</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <Modal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          title="Confirm Sign Out"
          subtitle="Are you sure you want to log out of the National Land Governance Portal?"
          size="sm"
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <LogOut className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <p className="font-bold mb-1">Ending Active Session</p>
                <p className="text-amber-800 leading-relaxed">
                  You will be logged out of account <span className="font-mono font-bold">{currentUser.email}</span> ({currentUser.name}).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Sign Out</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
