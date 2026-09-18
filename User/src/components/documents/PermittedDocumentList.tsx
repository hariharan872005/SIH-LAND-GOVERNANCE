import React from 'react';
import { DocumentRecord } from '../../types';
import { FileCode, Download, Eye, ShieldCheck, Lock } from 'lucide-react';

interface PermittedDocumentListProps {
  documents: DocumentRecord[];
  isLoading?: boolean;
}

export const PermittedDocumentList: React.FC<PermittedDocumentListProps> = ({ documents, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-2 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-12 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        <Lock className="w-5 h-5 mx-auto mb-2 text-slate-400" />
        <p className="font-bold text-slate-700">No Public Documents Available</p>
        <p className="text-slate-400 mt-1">Additional title deeds require authenticated citizen login.</p>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="text-xs font-bold text-slate-700 flex items-center justify-between uppercase tracking-wider px-1">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Permitted Title Documents ({documents.length})</span>
        </span>
        <span className="text-[10px] text-slate-400 font-medium">S3 Presigned Vault</span>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-sm group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                  {doc.fileName}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="font-bold text-blue-600 uppercase">{doc.documentType}</span>
                  <span>•</span>
                  <span>{formatSize(doc.fileSizeBytes)}</span>
                  {doc.ipfsCid && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-400">Hash: {doc.ipfsCid.substring(0, 10)}...</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {doc.s3PresignedUrl && (
                <a
                  href={doc.s3PresignedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
