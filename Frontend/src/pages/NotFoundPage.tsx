import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft, ShieldAlert, ServerCrash } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-md space-y-6">
        <div className="w-16 h-16 bg-slate-100 border border-slate-200 text-slate-900 rounded-3xl flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-xs font-bold text-slate-500 uppercase">ERROR 404</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Cadastral Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The requested spatial portal route or registry entry does not exist or has been relocated.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-md space-y-6">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-xs font-bold text-rose-600 uppercase">ACCESS RESTRICTED (403)</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Geographical Scope Forbidden</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your officer account does not possess the requisite RBAC permission or jurisdiction to view this cadastral layer.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export const ServerErrorPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-md space-y-6">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
          <ServerCrash className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-xs font-bold text-amber-600 uppercase">SERVER EXCEPTION (500)</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">GeoServer Spatial Gateway Error</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            A temporary connection timeout occurred while communicating with the upstream PostGIS / GeoServer cluster.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};
