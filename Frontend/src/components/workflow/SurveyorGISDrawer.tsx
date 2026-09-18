import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Database, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileCheck,
  Plus,
  Trash2
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { useAuth } from '../../context/AuthContext';
import { useSubmitSurveyVerification, useFlagCorrectionOrReject } from '../../hooks/useQueries';
import { useToast } from '../../hooks/useToast';
import { DigitalTwinDetail } from '../../types';

export interface SurveyorGISDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: DigitalTwinDetail | null;
}

export const SurveyorGISDrawer: React.FC<SurveyorGISDrawerProps> = ({
  isOpen,
  onClose,
  parcel,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const submitSurveyMutation = useSubmitSurveyVerification();
  const flagCorrectionMutation = useFlagCorrectionOrReject();

  const [measuredArea, setMeasuredArea] = useState<number>(parcel?.areaInAcres || 2.5);
  const [surveyRemarks, setSurveyRemarks] = useState(
    'DGPS Base Station CORS network verification complete. Vector boundary polygon points benchmarked against EPSG:4326.'
  );
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split('T')[0]);

  // Coordinate Vertices Editor
  const [vertices, setVertices] = useState<[number, number][]>(() => {
    if (parcel?.gisBoundary?.coordinates?.[0]) {
      return (parcel.gisBoundary.coordinates[0] as number[][]).map((c) => [c[0], c[1]]);
    }
    return [
      [13.1132, 80.1542],
      [13.1132, 80.1582],
      [13.1172, 80.1582],
      [13.1172, 80.1542],
      [13.1132, 80.1542],
    ];
  });

  const [showCorrectionPrompt, setShowCorrectionPrompt] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');

  if (!parcel) return null;

  const handleVertexChange = (index: number, latOrLng: 0 | 1, value: number) => {
    const next = [...vertices];
    next[index][latOrLng] = value;
    setVertices(next);
  };

  const handleAddVertex = () => {
    const last = vertices[vertices.length - 1] || [13.115, 80.155];
    setVertices([...vertices, [last[0] + 0.0005, last[1] + 0.0005]]);
  };

  const handleRemoveVertex = (index: number) => {
    if (vertices.length <= 3) {
      toastError('Minimum 3 Points', 'A cadastral spatial polygon requires at least 3 distinct boundary vertices.');
      return;
    }
    setVertices(vertices.filter((_, i) => i !== index));
  };

  const handleApproveSurvey = async () => {
    if (!surveyRemarks.trim()) {
      toastError('Remarks Required', 'Please enter official field survey notes.');
      return;
    }

    try {
      await submitSurveyMutation.mutateAsync({
        surveyor: currentUser,
        data: {
          landId: parcel.landId,
          measuredAreaAcres: Number(measuredArea),
          polygonCoordinates: vertices,
          surveyRemarks,
          surveyDocName: `DGPS_FMB_${parcel.landId}_2026.gpkg`,
        },
      });

      success(
        'Survey & GIS Verified',
        `PostGIS spatial polygon updated for ${parcel.landId}. State machine advanced to REQUIRES_REGISTRATION_VERIFICATION.`
      );
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Survey submission failed';
      toastError('Survey Submission Failed', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  const handleRequestCorrection = async () => {
    if (!correctionReason.trim()) {
      toastError('Reason Required', 'Please state the boundary conflict or demarcation defect.');
      return;
    }

    try {
      await flagCorrectionMutation.mutateAsync({
        officer: currentUser,
        landId: parcel.landId,
        pillar: 'survey',
        actionType: 'REQUIRES_CORRECTION',
        reason: correctionReason,
      });

      success('Correction Flagged', `Survey objection logged. Parcel returned to Tahsildar for document rectifications.`);
      setShowCorrectionPrompt(false);
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Action failed';
      toastError('Action Failed', Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Survey & GIS Boundary Verification: ${parcel.landId}`}
      subtitle={`Assigned Surveyor: ${currentUser.name} (${currentUser.designation})`}
      width="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => setShowCorrectionPrompt(!showCorrectionPrompt)}
            className="text-xs text-rose-700 hover:text-rose-900 font-bold"
          >
            {showCorrectionPrompt ? 'Cancel Correction' : 'Request Boundary Correction →'}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveSurvey}
              disabled={submitSurveyMutation.isPending}
              className="px-5 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{submitSurveyMutation.isPending ? 'Committing...' : 'Approve & Verify Survey (PostGIS)'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Officer Scope Validation Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-black" />
              Survey Jurisdiction: {parcel.taluk}, {parcel.district}, {parcel.state}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold font-mono text-[10px]">
              Surveyor: {currentUser.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Current Owner: <strong className="text-slate-800">{parcel.currentOwnerName}</strong> • Survey No:{' '}
            <strong className="text-slate-800">{parcel.surveyNumber}</strong>
          </p>
        </div>

        {/* Correction Box if toggled */}
        {showCorrectionPrompt && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
            <h4 className="font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Flag Demarcation Discrepancy / Request Correction
            </h4>
            <textarea
              rows={3}
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="Explain why the field boundary survey cannot be validated (e.g. overlap with govt poramboke land, encroachment, mismatch with FMB sketches)..."
              className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRequestCorrection}
                disabled={flagCorrectionMutation.isPending}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Submit Correction Request
              </button>
            </div>
          </div>
        )}

        {/* Spatial Measurement Fields */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-black" />
            1. Field DGPS Measurements & Extent
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                DGPS Measured Extent (Acres) *
              </label>
              <input
                type="number"
                step="0.001"
                value={measuredArea}
                onChange={(e) => setMeasuredArea(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Field Survey Date *
              </label>
              <input
                type="date"
                value={surveyDate}
                onChange={(e) => setSurveyDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* PostGIS Coordinate Vertices Demarcation Editor */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-black" />
              2. PostGIS Polygon Boundary Vertices (EPSG:4326)
            </h4>
            <button
              type="button"
              onClick={handleAddVertex}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-black hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vertex Point</span>
            </button>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {vertices.map((vertex, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]"
              >
                <span className="w-6 text-slate-500 font-bold">#{idx + 1}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-slate-500">Lat:</span>
                  <input
                    type="number"
                    step="0.00001"
                    value={vertex[0]}
                    onChange={(e) => handleVertexChange(idx, 0, Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-slate-500">Lng:</span>
                  <input
                    type="number"
                    step="0.00001"
                    value={vertex[1]}
                    onChange={(e) => handleVertexChange(idx, 1, Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVertex(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Remove point"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Survey Remarks */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            3. Official Field Verification Remarks & FMB Sketch Docket
          </label>
          <textarea
            rows={3}
            value={surveyRemarks}
            onChange={(e) => setSurveyRemarks(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* State Machine Transition Notice */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>Next Pipeline Transition:</span>
          <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-slate-300">
            REQUIRES_REGISTRATION_VERIFICATION
          </span>
        </div>
      </div>
    </Drawer>
  );
};
