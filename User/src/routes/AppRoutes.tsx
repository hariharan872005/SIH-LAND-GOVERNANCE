import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MapPage } from '../pages/MapPage';
import { LandDetailsPage } from '../pages/LandDetailsPage';
import { DigitalTwinPage } from '../pages/DigitalTwinPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/map" replace />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/land/:landId" element={<LandDetailsPage />} />
      <Route path="/digital-twin/:landId" element={<DigitalTwinPage />} />
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  );
};
