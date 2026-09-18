import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-3" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1.5 hover:text-black transition-colors p-1 rounded-md hover:bg-slate-100"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-black transition-colors p-1 rounded-md hover:bg-slate-100 truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 shadow-2xs">
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-bold shrink-0 ${
                trend.isPositive ? 'text-emerald-700' : 'text-slate-600'
              }`}
            >
              {trend.isPositive ? '↑ ' : ''}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export const Tabs: React.FC<{
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 bg-white px-2 rounded-t-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-black text-black bg-slate-50'
                : 'border-transparent text-slate-500 hover:text-black hover:border-slate-300'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
