import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import CreateSubmissionPage from "./pages/CreateSubmissionPage";
import MySubmissionsPage from "./pages/MySubmissionsPage";
import PendingApprovalsPage from "./pages/PendingApprovalsPage";
import ApprovedSubmissionsPage from "./pages/ApprovedSubmissionsPage";
import OfficerBorrowersPage from "./pages/OfficerBorrowersPage";
import DistrictSubmissionsPage from "./pages/DistrictSubmissionsPage";

// import ProvincialOverviewPage from "./pages/ProvincialOverviewPage";
import ManageSocietiesPage from "./pages/ManageSocietiesPage";
import ManageOfficersPage from "./pages/ManageOfficersPage";
import ManageUsersPage from "./pages/ManageUsersPage"; // NEW
import ManageLegalOfficersPage from "./pages/ManageLegalOfficersPage"; // NEW
import ManageCourtsPage from "./pages/ManageCourtsPage";
import LegalOfficerCasesPage from "./pages/LegalOfficerCasesPage";
import UnpaidCasesPage from "./pages/UnpaidCasesPage";
import ProvincialUnpaidCasesPage from "./pages/ProvincialUnpaidCasesPage";

import DistrictUnpaidCasesPage from "./pages/DistrictUnpaidCasesPage";
import UnpaidCasesApprovalPage from "./pages/UnpaidCasesApprovalPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  return !user ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="create-submission" element={<CreateSubmissionPage />} />
          <Route path="my-submissions" element={<MySubmissionsPage />} />
          <Route path="pending-approvals" element={<PendingApprovalsPage />} />
          <Route
            path="approved-submissions"
            element={<ApprovedSubmissionsPage />}
          />
          <Route path="my-borrowers" element={<OfficerBorrowersPage />} />
          <Route path="my-legal-cases" element={<LegalOfficerCasesPage />} />
          <Route path="unpaid-borrowers" element={<UnpaidCasesPage />} />
          <Route
            path="unpaid-borrowers-approval"
            element={<UnpaidCasesApprovalPage />}
          />
          <Route
            path="district-pending-payments"
            element={<DistrictUnpaidCasesPage />}
          />
          <Route
            path="provincial-pending-payments"
            element={<ProvincialUnpaidCasesPage />}
          />
          <Route
            path="district-submissions"
            element={<DistrictSubmissionsPage />}
          />
          {/* <Route
            path="provincial-overview"
            element={<ProvincialOverviewPage />}
          /> */}
          <Route path="manage-societies" element={<ManageSocietiesPage />} />
          <Route path="manage-officers" element={<ManageOfficersPage />} />
          <Route
            path="manage-legalofficers"
            element={<ManageLegalOfficersPage />}
          />
          <Route path="manage-courts" element={<ManageCourtsPage />} />
          {/* NEW: User Management Route */}
          <Route path="manage-users" element={<ManageUsersPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <AppRoutes />
    </AuthProvider>
  );
}
