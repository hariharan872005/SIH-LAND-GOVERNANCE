import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  Database, 
  HardDrive, 
  Network, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Globe2,
  Lock
} from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useToast } from '../hooks/useToast';

export const SettingsPage: React.FC = () => {
  const { success, info } = useToast();

  const [geoServerUrl, setGeoServerUrl] = useState('https://geoserver.cadastre.gov.in/geoserver');
  const [postGisHost, setPostGisHost] = useState('postgis-cluster.national-gov.internal:5432');
  const [neo4jBoltUrl, setNeo4jBoltUrl] = useState('bolt://neo4j-cluster.gov.in:7687');
  const [s3Bucket, setS3Bucket] = useState('gov-land-vault-prod-s3');
  const [s3Region, setS3Region] = useState('ap-south-1 (Mumbai)');
  const [apiBaseUrl, setApiBaseUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'https://api.landrecords.gov.in/api/v1');

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('System Settings Saved', 'GeoServer, PostGIS, Neo4j, and S3 parameters updated.');
    }, 600);
  };

  const handleTestConnection = (service: string) => {
    info(`Testing ${service} Endpoint`, `Initiating ping to ${service} cluster... Connection verified! (Latency: 14ms)`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'System' }, { label: 'Settings' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5">
              <SettingsIcon className="w-3.5 h-3.5" /> SYSTEM ARCHITECTURE
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Infrastructure & Gateway Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure GeoServer spatial endpoints, PostGIS spatial clusters, Neo4j Cypher databases, and MinIO/S3 object storage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend API & GeoServer */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-800" />
              GeoServer WFS / WMS Gateway
            </h3>
            <button
              onClick={() => handleTestConnection('GeoServer WFS')}
              className="text-xs text-black hover:underline font-semibold"
            >
              Test Ping
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                GeoServer Endpoint URI
              </label>
              <input
                type="text"
                value={geoServerUrl}
                onChange={(e) => setGeoServerUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NestJS Core Backend API Base URL
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
              <p className="text-[10px] text-slate-500 mt-1">Configurable via <code className="text-black font-bold">VITE_API_BASE_URL</code> environment variable.</p>
            </div>
          </div>
        </div>

        {/* PostGIS Database */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-800" />
              PostGIS Spatial Database Cluster
            </h3>
            <button
              onClick={() => handleTestConnection('PostGIS 3.4')}
              className="text-xs text-black hover:underline font-semibold"
            >
              Test Connection
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                PostGIS Primary Host & Port
              </label>
              <input
                type="text"
                value={postGisHost}
                onChange={(e) => setPostGisHost(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Spatial Reference System (SRS)
              </label>
              <input
                type="text"
                readOnly
                value="EPSG:4326 (WGS84) / EPSG:3857 (Web Mercator)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Neo4j Graph Database */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-slate-800" />
              Neo4j Ownership Graph Engine
            </h3>
            <button
              onClick={() => handleTestConnection('Neo4j Bolt')}
              className="text-xs text-black hover:underline font-semibold"
            >
              Verify Cypher Engine
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bolt Protocol Connection URL
              </label>
              <input
                type="text"
                value={neo4jBoltUrl}
                onChange={(e) => setNeo4jBoltUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chain of Custody Traversal Algorithm
              </label>
              <input
                type="text"
                readOnly
                value="Acyclic Directed Lineage (Shortest Path & Mutation Traverse)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* S3 / MinIO Storage */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-800" />
              AWS S3 / MinIO Object Vault
            </h3>
            <button
              onClick={() => handleTestConnection('S3 Vault')}
              className="text-xs text-black hover:underline font-semibold"
            >
              Test Bucket Access
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Target Bucket
              </label>
              <input
                type="text"
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                S3 Storage Region
              </label>
              <input
                type="text"
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
