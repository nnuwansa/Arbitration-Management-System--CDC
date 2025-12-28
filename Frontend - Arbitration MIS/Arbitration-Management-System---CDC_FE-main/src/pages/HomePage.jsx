import React, { useState, useEffect } from "react";
import {
  Users,
  Building,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Activity,
  BarChart3,
  Calendar,
  Award,
  Target,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [societyName, setSocietyName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingJudgments, setUpcomingJudgments] = useState([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingApprovals: 0,
    approvedSubmissions: 0,
    totalBorrowers: 0,
    decisionGiven: 0,
    feePaid: 0,
    totalCases: 0,
    judgmentGiven: 0,
    pendingJudgment: 0,
  });

  const isSocietyAdmin = user?.roles?.includes("SOCIETY_ADMIN");
  const isSocietyApproval = user?.roles?.includes("SOCIETY_APPROVAL");
  const isDistrictAdmin = user?.roles?.includes("DISTRICT_ADMIN");
  const isProvincialAdmin = user?.roles?.includes("PROVINCIAL_ADMIN");
  const isOfficer = user?.roles?.includes("OFFICER");
  const isLegalOfficer = user?.roles?.includes("LEGAL_OFFICER");

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        console.log("⏳ Waiting for user data...");
        return;
      }

      setLoading(true);
      setError(null);

      await loadUserData();
      await loadStatistics();

      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      if (user?.society || user?.societyId) {
        const societies = await api.getSocieties();
        const userSociety = societies.find(
          (s) => s.id === (user.society || user.societyId)
        );
        if (userSociety) {
          setSocietyName(userSociety.name);
        } else {
          setSocietyName(user.society || user.societyId || "");
        }
      }

      if (user?.district) {
        const districts = await api.getDistricts();
        const userDistrict = districts.find((d) => d.id === user.district);
        if (userDistrict) {
          setDistrictName(userDistrict.name);
        } else {
          setDistrictName(user.district);
        }
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      if (user?.society || user?.societyId)
        setSocietyName(user.society || user.societyId);
      if (user?.district) setDistrictName(user.district);
    }
  };

  const loadStatistics = async () => {
    try {
      if (isSocietyAdmin || isSocietyApproval) {
        if (!user.society) {
          console.error("❌ No society ID found for user");
          setError("Society information not found");
          return;
        }

        let submissions = [];
        let pending = [];

        try {
          submissions = await api.getSubmissionsBySociety(user.societyId);
        } catch (err) {
          console.error("❌ Error loading submissions:", err.message);
          setError(`Failed to load submissions: ${err.message}`);
        }

        try {
          pending = await api.getPendingApprovalsBySociety(user.societyId);
        } catch (err) {
          console.error("❌ Error loading pending approvals:", err.message);
          if (submissions && submissions.length > 0) {
            pending = submissions.filter((sub) => sub.status === "pending");
          }
        }

        const totalBorrowers = submissions.reduce(
          (sum, sub) => sum + (sub.borrowers?.length || 0),
          0
        );
        const approved = submissions.filter(
          (sub) => sub.status === "approved"
        ).length;

        setStats({
          totalSubmissions: submissions.length,
          pendingApprovals: pending.length,
          approvedSubmissions: approved,
          totalBorrowers: totalBorrowers,
        });
      } else if (isDistrictAdmin || isProvincialAdmin) {
        let allSubmissions = [];
        if (isProvincialAdmin) {
          const districts = await api.getDistricts();
          const promises = districts.map((d) =>
            api.getApprovedSubmissionsByDistrict(d.id)
          );
          const results = await Promise.all(promises);
          allSubmissions = results.flat();
        } else {
          allSubmissions = await api.getApprovedSubmissionsByDistrict(
            user.district
          );
        }

        const totalBorrowers = allSubmissions.reduce(
          (sum, sub) => sum + (sub.borrowers?.length || 0),
          0
        );
        const decisionGiven = allSubmissions.reduce((sum, sub) => {
          return (
            sum +
            (sub.borrowers?.filter((b) => b.status === "decision-given")
              .length || 0)
          );
        }, 0);
        const feePaid = allSubmissions.reduce((sum, sub) => {
          return (
            sum +
            (sub.borrowers?.filter((b) => b.arbitrationFeePaid).length || 0)
          );
        }, 0);

        setStats({
          totalSubmissions: allSubmissions.length,
          totalBorrowers: totalBorrowers,
          decisionGiven: decisionGiven,
          feePaid: feePaid,
        });
      } else if (isOfficer) {
        const borrowers = await api.getOfficerAssignedBorrowers();
        const decisionGiven = borrowers.filter(
          (b) => b.status === "decision-given"
        ).length;

        setStats({
          totalBorrowers: borrowers.length,
          decisionGiven: decisionGiven,
          pending: borrowers.length - decisionGiven,
        });
      } else if (isLegalOfficer) {
        const cases = await api.getLegalOfficerAssignedCases();
        const judgmentGiven = cases.filter((c) => c.judgmentResult).length;

        setStats({
          totalCases: cases.length,
          judgmentGiven: judgmentGiven,
          pendingJudgment: cases.length - judgmentGiven,
        });

        // Calculate upcoming judgments
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = cases
          .filter((c) => c.judgmentDate)
          .map((c) => ({
            ...c,
            judgmentDate: new Date(c.judgmentDate),
            daysUntil: Math.ceil(
              (new Date(c.judgmentDate) - today) / (1000 * 60 * 60 * 24)
            ),
          }))
          .filter((c) => c.daysUntil >= -7 && c.daysUntil <= 14) // Show overdue up to 7 days and upcoming up to 14 days
          .sort((a, b) => a.daysUntil - b.daysUntil);

        setUpcomingJudgments(upcoming);
      }
    } catch (err) {
      console.error("❌ Error loading statistics:", err);
      setError(`Failed to load statistics: ${err.message}`);
    }
  };

  const getQuickActions = () => {
    if (isSocietyAdmin) {
      return [
        {
          label: "තීරකකරණය  සදහා නව ණයගැතියන් ඉදිරිපත් කිරීම",
          path: "/create-submission",
          icon: FileText,
          color: "#667eea",
        },
        {
          label: "තීරකකරණය  සදහා ඉදිරිපත් කිරීම්",
          path: "/my-submissions",
          icon: Building,
          color: "#764ba2",
        },
      ];
    }
    if (isSocietyApproval) {
      return [
        {
          label: "අනුමැතියට",
          path: "/pending-approvals",
          icon: Clock,
          color: "#f093fb",
        },
        {
          label: "අනුමත කළ",
          path: "/approved-submissions",
          icon: CheckCircle,
          color: "#4facfe",
        },
      ];
    }
    if (isDistrictAdmin || isProvincialAdmin) {
      return [
        {
          label: "තීරකකරණය  සදහා ඉදිරිපත් කිරීම්",
          path: "/district-submissions",
          icon: FileText,
          color: "#667eea",
        },
        {
          label: "නීතිමය ක්‍රියාවලිය සදහා ඉදිරිපත් කිරීම්",
          path: "/district-pending-payments",
          icon: FileText,
          color: "#f093fb",
        },
        {
          label: "සමිති ",
          path: "/manage-societies",
          icon: Building,
          color: "#764ba2",
        },
      ];
    }
    if (isOfficer) {
      return [
        {
          label: " තීරකකරණය  සදහා පවරා ඇති ණයගැතියන්",
          path: "/my-borrowers",
          icon: Users,
          color: "#667eea",
        },
      ];
    }
    if (isLegalOfficer) {
      return [
        {
          label: "නීතිමය ක්‍රියාවලිය සදහා පවරා ඇති ණයගැතියන්",
          path: "/my-legal-cases",
          icon: FileText,
          color: "#667eea",
        },
      ];
    }
    return [];
  };

  const getJudgmentStatusBadge = (daysUntil) => {
    if (daysUntil < 0) {
      return {
        bg: "danger",
        icon: AlertTriangle,
        text: `${Math.abs(daysUntil)} දින ප්‍රමාද`,
        label: "අතීතයේ",
      };
    } else if (daysUntil === 0) {
      return {
        bg: "danger",
        icon: Bell,
        text: "අද",
        label: "අද",
      };
    } else if (daysUntil <= 3) {
      return {
        bg: "warning",
        icon: Clock,
        text: `දින ${daysUntil}`,
        label: "ඉතා ඉක්මනින්",
      };
    } else if (daysUntil <= 7) {
      return {
        bg: "info",
        icon: Calendar,
        text: `දින ${daysUntil}`,
        label: "මේ සතියේ",
      };
    } else {
      return {
        bg: "secondary",
        icon: Calendar,
        text: `දින ${daysUntil}`,
        label: "ඉදිරියේ",
      };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading dashboard...</p>
      </div>
    );
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("si-LK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      <div className="p-3">
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: "20px",
            background: "linear-gradient(135deg, #b988e9dd 0%, #a4afdffa 100%)",
          }}
        >
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h3 className="text-white fw-bold mb-2">
                  ආයුබෝවන්, {user?.name}!
                </h3>
                {(isSocietyAdmin || isSocietyApproval || isDistrictAdmin) && (
                  <p className="text-white opacity-90 mb-0">
                    {(isSocietyAdmin || isSocietyApproval) && user?.society && (
                      <span className="me-3">
                        <Building size={16} className="me-1" />
                        {user?.society}
                      </span>
                    )}
                    {!isProvincialAdmin && user?.district && (
                      <span>
                        <Building size={16} className="me-1" />
                        {user?.district}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="col-md-4 text-end">
                <div
                  className="bg-white bg-opacity-20 px-4 py-3 rounded-3 d-inline-block"
                  style={{ backdropFilter: "blur(10px)" }}
                >
                  <Calendar
                    size={20}
                    className="mb-2 d-block mx-auto"
                    style={{ color: "#b988e9" }}
                  />
                  <div
                    className="fw-semibold"
                    style={{ fontSize: "0.95rem", color: "#b988e9" }}
                  >
                    {getCurrentDate()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show mb-4"
          role="alert"
        >
          <AlertCircle size={18} className="me-2" />
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Judgment Date Notifications - ONLY for Legal Officers */}
      {isLegalOfficer && upcomingJudgments.length > 0 && (
        <div className="mb-4 px-3">
          {/* Professional Header */}
          <div className="d-flex align-items-center mb-3 mt-3">
            {/* <div
        className="d-flex align-items-center justify-content-center me-2"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      > */}
            <Bell size={18} className="text-primary me-2" />
            {/* </div> */}
            <h6 className="fw-bold mb-0 me-4">ඉදිරි නඩු දිනයන්</h6>
            <span
              className="badge text-white"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "15px",
              }}
            >
              {upcomingJudgments.length}
            </span>
          </div>

          {/* Notification Cards in Grid - 3 per row */}
          <div className="row g-3">
            {upcomingJudgments.slice(0, 6).map((judgment, index) => {
              const status = getJudgmentStatusBadge(judgment.daysUntil);
              const StatusIcon = status.icon;

              return (
                <div key={index} className="col-md-6 col-lg-4">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      borderRadius: "12px",
                      borderLeft: `4px solid var(--bs-${status.bg})`,
                      overflow: "hidden",
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex align-items-start mb-2">
                        <div
                          className={`d-flex align-items-center justify-content-center me-2`}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: `var(--bs-${status.bg})`,
                            opacity: 0.15,
                            flexShrink: 0,
                          }}
                        >
                          <StatusIcon
                            size={18}
                            style={{ color: `var(--bs-${status.bg})` }}
                          />
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <span
                              className={`badge bg-${status.bg}`}
                              style={{ fontSize: "9px" }}
                            >
                              {status.label}
                            </span>
                          </div>
                          <h6
                            className="mb-0 fw-bold"
                            style={{ fontSize: "14px" }}
                          >
                            {judgment.arbitrationNumber}
                          </h6>
                        </div>
                      </div>

                      <div className="text-muted small mb-2">
                        <strong>ණයගැතියා:</strong> {judgment.borrowerName}
                      </div>

                      <div
                        className="d-flex align-items-center text-muted mb-2"
                        style={{ fontSize: "12px" }}
                      >
                        <Calendar size={12} className="me-1" />
                        <span className="fw-semibold me-1">නඩු දිනය:</span>
                        {judgment.judgmentDate.toLocaleDateString("si-LK")}
                      </div>

                      <div
                        className={`fw-bold text-${status.bg}`}
                        style={{ fontSize: "12px" }}
                      >
                        {status.text}
                      </div>

                      <button
                        onClick={() => navigate("/my-legal-cases")}
                        className="btn btn-sm btn-outline-primary w-100 mt-2"
                        style={{
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "12px",
                        }}
                      >
                        විස්තර
                        <ArrowRight size={12} className="ms-1" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {upcomingJudgments.length > 6 && (
            <div className="text-center mt-3">
              <button
                onClick={() => navigate("/my-legal-cases")}
                className="btn btn-sm"
                style={{
                  borderRadius: "20px",
                  padding: "8px 24px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  fontWeight: "600",
                }}
              >
                තවත් {upcomingJudgments.length - 6} දැනුම්දීම් බලන්න
                <ArrowRight size={14} className="ms-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions - Hide for Legal Officers */}
      {!isLegalOfficer && (
        <div className="row g-4 mb-4 mt-3">
          <div className="col-12">
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <Target size={20} className="me-2 text-primary" />
              ඉක්මන් ක්‍රියාමාර්ග
            </h6>
          </div>
          {getQuickActions().map((action, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div
                className="card border-2 shadow-sm h-100 cursor-pointer"
                style={{
                  borderRadius: "15px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
                onClick={() => navigate(action.path)}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div
                        className="rounded p-3 mb-3"
                        style={{
                          backgroundColor: `${action.color}15`,
                          display: "inline-block",
                        }}
                      >
                        <action.icon
                          size={24}
                          style={{ color: action.color }}
                        />
                      </div>
                      <h6 className="fw-semibold mb-0">{action.label}</h6>
                    </div>
                    <ArrowRight size={20} className="text-muted" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Section Title */}
      <div className="mb-3">
        <h6 className="fw-bold d-flex align-items-center">
          <BarChart3 size={20} className="me-2 text-primary" />
          දළ විශ්ලේෂණය
        </h6>
      </div>

      {/* Statistics Cards for Society Users */}
      {/* {(isSocietyAdmin || isSocietyApproval) && (
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #8391ce 0%, #af8ecf 100%)",
              }}
            >
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="bg-white bg-opacity-25 p-3 rounded"
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    <Users size={24} />
                  </div>
                  <Activity size={18} className="opacity-75" />
                </div>
                <h6 className="opacity-90 mb-1">පවරා ඇති ණයගැතියන්</h6>
                <h3 className="fw-bold mb-0">{stats.totalBorrowers}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #4b94aa 0%, #a77adf 100%)",
              }}
            >
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="bg-white bg-opacity-25 p-3 rounded"
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    <CheckCircle size={24} />
                  </div>
                  <Award size={18} className="opacity-75" />
                </div>
                <h6 className="opacity-90 mb-1">තීරණ ලබා දී ඇත</h6>
                <h3 className="fw-bold mb-0">{stats.decisionGiven}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #8c2e9d 0%, #c68bed 100%)",
              }}
            >
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="bg-white bg-opacity-25 p-3 rounded"
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    <AlertCircle size={24} />
                  </div>
                  <Clock size={18} className="opacity-75" />
                </div>
                <h6 className="opacity-90 mb-1">තීරණ බලාපොරොත්තුවෙන්</h6>
                <h3 className="fw-bold mb-0">{stats.pending}</h3>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Statistics Cards for Society Users */}
      {(isSocietyAdmin || isSocietyApproval) && (
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #8391ce 0%, #af8ecf 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <FileText size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">මුළු ඉදිරිපත් කිරීම්</h6>
                <h5 className="fw-bold mb-0">{stats.totalSubmissions}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #6f80cc 0%, #79bddf 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <Clock size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">අනුමැතියට</h6>
                <h5 className="fw-bold mb-0">{stats.pendingApprovals}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #4b94aa 0%, #a77adf 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">අනුමත කළ</h6>
                <h5 className="fw-bold mb-0">{stats.approvedSubmissions}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #7340cd 0%, #e48fec 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <Users size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">මුළු ණයගැතියන්</h6>
                <h5 className="fw-bold mb-0">{stats.totalBorrowers}</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards for District/Provincial Admins */}
      {(isDistrictAdmin || isProvincialAdmin) && (
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #8f9ddc 0%, #b797d5 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <Building size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">මුළු ඉදිරිපත් කිරීම්</h6>
                <h5 className="fw-bold mb-0">{stats.totalSubmissions}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #7c8edf 0%, #79bddf 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <Users size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">මුළු ණයගැතියන්</h6>
                <h5 className="fw-bold mb-0">{stats.totalBorrowers}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #4b94aa 0%, #a77adf 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">තීරණ ලබා දී ඇත</h6>
                <h5 className="fw-bold mb-0">{stats.decisionGiven}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #5cbfbf 0%, #b895e3 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <TrendingUp size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">ගාස්තු ගෙවා ඇත</h6>
                <h5 className="fw-bold mb-0">{stats.feePaid}</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards for Officers */}
      {isOfficer && (
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #965ecf 0%, #9ca9e1 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <Users size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">පවරා ඇති ණයගැතියන්</h6>
                <h5 className="fw-bold mb-0">{stats.totalBorrowers}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #4b94aa 0%, #a77adf 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">තීරණ ලබා දී ඇත</h6>
                <h5 className="fw-bold mb-0">{stats.decisionGiven}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #8c2e9d 0%, #c68bed 100%)",
              }}
            >
              <div className="card-body text-white">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-white bg-opacity-25 p-3 rounded">
                    <AlertCircle size={24} />
                  </div>
                </div>
                <h6 className="opacity-95 mb-1">තීරණ බලාපොරොත්තුවෙන්</h6>
                <h5 className="fw-bold mb-0">{stats.pending}</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards for Legal Officers */}
      {isLegalOfficer && (
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #4a5a8a 0%, #7c5fa8 100%)",
              }}
            >
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="bg-white bg-opacity-25 p-3 rounded"
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    <FileText size={24} />
                  </div>
                  <Activity size={18} className="opacity-75" />
                </div>
                <h6 className="opacity-90 mb-1">
                  නීතිමය ක්‍රියාවලිය සදහා පැවරී ඇති ණයගැතියන්
                </h6>
                <h3 className="fw-bold mb-0">{stats.totalCases}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #4b94aa 0%, #a77adf 100%)",
              }}
            >
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="bg-white bg-opacity-25 p-3 rounded"
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    <CheckCircle size={24} />
                  </div>
                  <Award size={18} className="opacity-75" />
                </div>
                <h6 className="opacity-90 mb-1">තීන්දු ලබා දී ඇත</h6>
                <h3 className="fw-bold mb-0">{stats.judgmentGiven}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #4d76cf 0%, #8f59d4 100%)",
              }}
            >
              <div className="card-body text-white p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="bg-white bg-opacity-25 p-3 rounded"
                    style={{ backdropFilter: "blur(10px)" }}
                  >
                    <Clock size={24} />
                  </div>
                  <AlertCircle size={18} className="opacity-75" />
                </div>
                <h6 className="opacity-90 mb-1">තීන්දු බලාපොරොත්තුවෙන්</h6>
                <h3 className="fw-bold mb-0">{stats.pendingJudgment}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Info Footer */}
      {/* <div
        className="card border-0 shadow-sm mt-4"
        style={{ borderRadius: "15px", background: "#f3eaf6" }}
      >
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h6 className="fw-bold mb-2">
                ණය අය කිරීමේ තීරණ කළමනාකරණ පද්ධතිය
              </h6>
              <p className="text-muted mb-0 small">
                මධ්‍යම පළාත් සමුපකාර සංවර්ධන දෙපාර්තමේන්තුව | Central Province
                Cooperative Development Department
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <div className="d-flex align-items-center justify-content-md-end">
                <div
                  className="bg-primary bg-opacity-10 p-3 rounded me-3"
                  style={{ borderRadius: "12px" }}
                >
                  <Building size={24} className="text-primary" />
                </div>
                <div>
                  <div className="fw-semibold text-primary">
                    {user?.roles?.join(", ")}
                  </div>
                  <small className="text-muted">{user?.email}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default HomePage;
