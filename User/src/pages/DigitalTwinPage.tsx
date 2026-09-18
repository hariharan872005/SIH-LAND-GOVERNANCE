import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DigitalTwinModal } from '../components/digital-twin/DigitalTwinModal';

export const DigitalTwinPage: React.FC = () => {
  const { landId } = useParams<{ landId: string }>();
  const navigate = useNavigate();

  if (!landId) {
    navigate('/map');
    return null;
  }

  return (
    <DigitalTwinModal
      landId={landId}
      onClose={() => navigate(`/map?landId=${encodeURIComponent(landId)}`)}
    />
  );
};
