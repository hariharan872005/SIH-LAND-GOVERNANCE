import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { LandVerificationPage } from '../pages/LandVerificationPage';
import { DigitalTwinsPage } from '../pages/DigitalTwinsPage';
import { DigitalTwinDetailPage } from '../pages/DigitalTwinDetailPage';
import { OwnershipHistoryPage } from '../pages/OwnershipHistoryPage';
import { DepartmentsPage } from '../pages/DepartmentsPage';
import { DesignationsPage } from '../pages/DesignationsPage';
import { OfficersPage } from '../pages/OfficersPage';
import { RolesPage } from '../pages/RolesPage';
import { PermissionsPage } from '../pages/PermissionsPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>
        {/* Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Land Governance */}
        <Route path="governance">
          <Route path="verification" element={<LandVerificationPage />} />
          <Route path="digital-twins" element={<DigitalTwinsPage />} />
          <Route path="digital-twins/:landId" element={<DigitalTwinDetailPage />} />
          <Route path="ownership-history" element={<OwnershipHistoryPage />} />
        </Route>

        {/* Organization */}
        <Route path="organization">
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="designations" element={<DesignationsPage />} />
          <Route path="officers" element={<OfficersPage />} />
        </Route>

        {/* Access Control */}
        <Route path="access-control">
          <Route path="roles" element={<RolesPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
        </Route>

        {/* Documents */}
        <Route path="documents" element={<DocumentsPage />} />

        {/* Audit Logs */}
        <Route path="audit-logs" element={<AuditLogsPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* System Error Pages */}
        <Route path="forbidden" element={<ForbiddenPage />} />
        <Route path="server-error" element={<ServerErrorPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
