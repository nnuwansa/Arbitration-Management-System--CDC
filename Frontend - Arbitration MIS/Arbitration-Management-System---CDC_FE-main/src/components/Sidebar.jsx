import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Clock,
  CheckCircle,
  Users,
  Building,
  LogOut,
  UserCog,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [counts, setCounts] = useState({
    pendingApprovals: 0,
    unpaidApprovals: 0,
    districtSubmissions: 0,
    districtUnpaidCases: 0,
    provincialUnpaidCases: 0,
    officerBorrowers: 0,
    legalOfficerCases: 0,
  });

  const isSocietyAdmin = user?.roles?.includes("SOCIETY_ADMIN");
  const isSocietyApproval = user?.roles?.includes("SOCIETY_APPROVAL");
  const isDistrictAdmin = user?.roles?.includes("DISTRICT_ADMIN");
  const isProvincialAdmin = user?.roles?.includes("PROVINCIAL_ADMIN");
  const isOfficer = user?.roles?.includes("OFFICER");
  const isLegalOfficer = user?.roles?.includes("LEGAL_OFFICER");
  const isAdmin = isDistrictAdmin || isProvincialAdmin;

  // Add animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
        }
        50% {
          transform: scale(1.15);
          box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    loadCounts();
    const interval = setInterval(loadCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadCounts = async () => {
    try {
      const newCounts = { ...counts };

      if (isSocietyApproval && user?.societyId) {
        try {
          const data = await api.getPendingApprovalsBySociety(user.societyId);
          newCounts.pendingApprovals = data.length;
        } catch (err) {
          console.error("Error loading pending approvals:", err);
        }

        try {
          const unpaidData = await api.getUnpaidCasesPendingApproval(
            user.societyId
          );
          newCounts.unpaidApprovals = unpaidData.length;
        } catch (err) {
          console.error("Error loading unpaid approvals:", err);
        }
      }

      if (isDistrictAdmin && user?.district) {
        try {
          const data = await api.getApprovedSubmissionsByDistrict(
            user.district
          );
          const unpaidCount = data.reduce((total, submission) => {
            const unpaidBorrowers = submission.borrowers.filter(
              (b) => !b.arbitrationFeePaid
            ).length;
            return total + unpaidBorrowers;
          }, 0);
          newCounts.districtSubmissions = unpaidCount;
        } catch (err) {
          console.error("Error loading district submissions:", err);
        }

        try {
          const unpaidCases = await api.getPaymentPendingCases(user.district);
          const pendingAssignment = unpaidCases.filter(
            (c) => !c.assignedLegalOfficerId
          ).length;
          newCounts.districtUnpaidCases = pendingAssignment;
        } catch (err) {
          console.error("Error loading district unpaid cases:", err);
          try {
            const submissions = await api.getSubmissionsByDistrict(
              user.district
            );
            let pendingCount = 0;
            submissions.forEach((submission) => {
              submission.borrowers.forEach((borrower) => {
                if (
                  borrower.status === "payment-pending" &&
                  borrower.approvedForDistrict === true &&
                  !borrower.assignedLegalOfficerId
                ) {
                  pendingCount++;
                }
              });
            });
            newCounts.districtUnpaidCases = pendingCount;
          } catch (alternateErr) {
            console.error("Alternate method also failed:", alternateErr);
          }
        }
      }

      if (isProvincialAdmin) {
        try {
          const districtsData = await api.getDistricts();
          let totalUnpaidCases = 0;

          for (const district of districtsData) {
            try {
              const unpaidCases = await api.getPaymentPendingCases(district.id);
              const pendingAssignment = unpaidCases.filter(
                (c) => !c.assignedLegalOfficerId
              ).length;
              totalUnpaidCases += pendingAssignment;
            } catch (err) {
              console.error(
                `Error loading unpaid cases for ${district.name}:`,
                err
              );
            }
          }

          newCounts.provincialUnpaidCases = totalUnpaidCases;
        } catch (err) {
          console.error("Error loading provincial unpaid cases:", err);
        }
      }

      if (isOfficer) {
        try {
          const data = await api.getOfficerAssignedBorrowers();
          const pendingDecisions = data.filter(
            (b) => b.status === "assigned" && !b.arbitrationDecision
          ).length;
          newCounts.officerBorrowers = pendingDecisions;
        } catch (err) {
          console.error("Error loading officer borrowers:", err);
        }
      }

      if (isLegalOfficer) {
        try {
          const data = await api.getLegalOfficerAssignedCases();
          const pendingJudgments = data.filter((c) => !c.judgmentResult).length;
          newCounts.legalOfficerCases = pendingJudgments;
        } catch (err) {
          console.error("Error loading legal officer cases:", err);
        }
      }

      setCounts(newCounts);
    } catch (err) {
      console.error("Error loading counts:", err);
    }
  };

  const NavItem = ({ to, icon: Icon, label, badge }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center justify-content-between px-3 ${
          isActive ? "text-white fw-semibold" : "text-white hover-bg-light"
        }`
      }
      style={({ isActive }) => ({
        borderRadius: "10px",
        transition: "all 0.2s ease",
        textDecoration: "none",
        background: isActive
          ? "linear-gradient(135deg, #667eea 0%, #a46eda 100%)"
          : "transparent",

        padding: "12px 10px",
        marginBottom: "6px", // Space between items
        minHeight: "40px", // Minimum height of each item
        display: "flex",
        alignItems: "center",
      })}
    >
      <div
        className="d-flex align-items-center"
        style={{ flex: 1, minWidth: 0 }}
      >
        <Icon size={18} className="me-2" style={{ flexShrink: 0 }} />
        <span style={{ wordBreak: "break-word" }}>{label}</span>
      </div>
      {badge > 0 && (
        <span
          className="badge bg-danger rounded-pill"
          style={{
            minWidth: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
            flexShrink: 0,
            marginLeft: "8px",
            animation: "pulse 2s ease-in-out infinite",
            boxShadow: "0 0 10px rgba(220, 38, 38, 0.6)",
          }}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <div
      className="d-flex flex-column text-white position-fixed"
      style={{
        background: "linear-gradient(135deg, #3f475e 0%, #7647a5 100%)",
        top: "60px",
        left: 0,
        height: "calc(100vh - 60px)",
        width: "250px",
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 1000,
      }}
    >
      <div className="p-3 flex-grow-1 mb-2" style={{ paddingTop: "1.5rem" }}>
        <nav className="nav flex-column">
          <NavItem to="/" icon={Home} label="මුල් පිටුව" />

          {isSocietyAdmin && (
            <>
              <NavItem
                to="/create-submission"
                icon={FileText}
                label="තීරකකරණය සදහා  ණය ගොනු  ඉදිරිපත් කිරීම"
              />
              <NavItem
                to="/my-submissions"
                icon={FileText}
                label="තීරකකරණය සදහා ඉදිරිපත් කරන ලද ණයගැතියන්"
              />
              <NavItem
                to="/unpaid-borrowers"
                icon={FileText}
                label="තිරක නිලධාරී තීන්දුවට අනුව ගෙවීම් නොකරන ලද ණයගැතියන්"
              />
            </>
          )}

          {isSocietyApproval && (
            <>
              <NavItem
                to="/pending-approvals"
                icon={Clock}
                label="තීරකකරණය සදහා අනුමැතියට "
                badge={counts.pendingApprovals}
              />
              <NavItem
                to="/unpaid-borrowers-approval"
                icon={Clock}
                label=" නීතිමය ක්‍රියාවලිය සදහා අනුමැතියට  "
                badge={counts.unpaidApprovals}
              />
              <NavItem
                to="/approved-submissions"
                icon={CheckCircle}
                label=" තීරකකරණය සදහා අනුමත කළ ඉදිරිපත් කිරීම්"
              />
            </>
          )}

          {isOfficer && (
            <>
              <NavItem
                to="/my-borrowers"
                icon={Users}
                label="මාගේ පවරා ඇති ණයගැතියන්"
                badge={counts.officerBorrowers}
              />
            </>
          )}

          {isLegalOfficer && (
            <>
              <NavItem
                to="/my-legal-cases"
                icon={Users}
                label="නීතිමය ක්‍රියාවලිය සදහා පැවරී ඇති ණයගැතියන් "
                badge={counts.legalOfficerCases}
              />
            </>
          )}

          {isAdmin && (
            <>
              <NavItem
                to="/district-submissions"
                icon={FileText}
                label={
                  isProvincialAdmin
                    ? "තීරකකරණය සදහා සියලුම ඉදිරිපත් කිරීම්"
                    : "තීරකකරණය සදහා දිස්ත්‍රික් ඉදිරිපත් කිරීම්"
                }
                badge={isDistrictAdmin ? counts.districtSubmissions : 0}
              />

              {isDistrictAdmin && (
                <NavItem
                  to="/district-pending-payments"
                  icon={FileText}
                  label="තීරකකරණයෙන් පසුව නීතිමය ක්‍රියාවලියට"
                  badge={counts.districtUnpaidCases}
                />
              )}

              {isProvincialAdmin && (
                <>
                  <NavItem
                    to="/provincial-pending-payments"
                    icon={Building}
                    label="තීරකකරණයෙන් පසුව නීතිමය ක්‍රියාවලියට"
                    badge={counts.provincialUnpaidCases}
                  />
                </>
              )}

              <NavItem
                to="/manage-societies"
                icon={Building}
                label={isProvincialAdmin ? "සමිති" : "සමිති කළමනාකරණය"}
              />

              <NavItem
                to="/manage-officers"
                icon={Users}
                label={
                  isProvincialAdmin
                    ? "තීරක නිලධාරීන්"
                    : "තීරක නිලධාරීන් කළමනාකරණය"
                }
              />

              <NavItem
                to="/manage-legalofficers"
                icon={UserCog}
                label={
                  isProvincialAdmin
                    ? "නීති නිලධාරීන්"
                    : "නීති නිලධාරීන් කළමනාකරණය"
                }
              />

              <NavItem
                to="/manage-courts"
                icon={Building}
                label={isProvincialAdmin ? "උසාවි" : "උසාවිය කළමනාකරණය"}
              />

              <NavItem
                to="/manage-users"
                icon={UserCog}
                label={isProvincialAdmin ? "පරිශීලකයින්" : "පරිශීලක කළමනාකරණය"}
              />
            </>
          )}
        </nav>
      </div>

      {/* Logout Button at Bottom */}
      <div className="p-3 border-top border-white border-opacity-25">
        <button
          className="btn btn-light w-100 d-flex align-items-center justify-content-center py-2"
          onClick={logout}
          style={{
            borderRadius: "10px",
            fontWeight: "600",
          }}
        >
          <LogOut size={18} className="me-2" />
          ඉවත් වන්න
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
