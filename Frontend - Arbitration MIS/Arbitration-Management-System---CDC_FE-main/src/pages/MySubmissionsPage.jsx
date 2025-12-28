import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";
import DecisionViewModal from "../components/DecisionViewModal";

const MySubmissionsPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedDecisionView, setSelectedDecisionView] = useState(null);
  const [showDecisionViewModal, setShowDecisionViewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      if (!user.societyId) {
        console.error("❌ No societyId found in user object!");
        return;
      }

      const data = await api.getSubmissionsBySociety(user.societyId);
      const sortedData = data.sort(
        (a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)
      );

      setSubmissions(sortedData);
      console.log("✅ Submissions loaded (newest first):", sortedData.length);
    } catch (err) {
      console.error("❌ Error loading submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          badge: "bg-success",
          text: "අනුමත",
          icon: CheckCircle,
          gradient: "linear-gradient(135deg, #7755b5 0%, #bfa4e9 100%)",
          borderColor: "rgba(255, 255, 255, 0.4)",
        };
      case "rejected":
        return {
          badge: "bg-danger",
          text: "ප්‍රතික්ෂේප",
          icon: XCircle,
          gradient: "linear-gradient(135deg, #7755b5 0%, #e75c5c 100%)",
          borderColor: "rgba(255, 255, 255, 0.4)",
        };
      default:
        return {
          badge: "bg-warning",
          text: "අනුමැතියට",
          icon: Clock,
          gradient: "linear-gradient(135deg, #7755b5 0%, #d5a44e 100%)",
          borderColor: "rgba(255, 255, 255, 0.4)",
        };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        />
        <p className="mt-3 text-muted">පූරණය වෙමින් පවතී...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">තීරකකරණය සදහා ඉදිරිපත් කරන ලද ගොනු</h2>
          <p className="text-muted mb-0">
            <FileText size={16} className="me-2" />
            මුළු ඉදිරිපත් කිරීම්: <strong>{submissions.length}</strong>
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div
          className="card shadow-sm"
          style={{
            borderRadius: "20px",
            border: "2px solid rgba(163, 173, 219, 0.2)",
          }}
        >
          <div className="card-body text-center p-5">
            <AlertCircle size={48} className="text-muted mb-3" />
            <h5 className="text-muted">ඉදිරිපත් කිරීම් හමු නොවීය</h5>
            <p className="text-muted mb-0">
              ඔබ තවමත් කිසිදු ඉදිරිපත් කිරීමක් සිදු කර නැත
            </p>
          </div>
        </div>
      ) : (
        submissions.map((submission) => {
          const statusConfig = getStatusConfig(submission.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={submission.id}
              className="card mb-4 shadow-sm"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                border: `2px solid ${statusConfig.borderColor}`,
              }}
            >
              {/* Card Header */}
              <div
                className="card-header text-white p-2"
                style={{
                  background: statusConfig.gradient,
                  border: "none",
                  borderBottom: `2px solid ${statusConfig.borderColor}`,
                }}
              >
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-1">
                      <Calendar size={18} className="me-3" />
                      <h6 className="mb-0 fw-semibold">
                        ඉදිරිපත් කළ දිනය:{" "}
                        {new Date(submission.submittedDate).toLocaleDateString(
                          "si-LK"
                        )}
                      </h6>
                    </div>
                    <small className="opacity-90 mx-2">
                      ඉදිරිපත් කළ අය: <strong>{submission.submittedBy}</strong>
                    </small>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <div className="d-flex align-items-center justify-content-md-end">
                      <StatusIcon size={16} className="me-2" />
                      <span
                        className="badge bg-white text-dark px-2 py-2"
                        style={{
                          fontSize: "0.75rem",
                          border: "2px solid rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        {statusConfig.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body - Table */}
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead
                      style={{
                        background: "#f8f9fa",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <tr>
                        <th
                          className="fw-semibold px-4 py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          ඉදිරිපත් කළ දිනය
                        </th>
                        <th
                          className="fw-semibold py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          ණය අංකය
                        </th>
                        <th
                          className="fw-semibold py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          නම
                        </th>
                        <th
                          className="fw-semibold py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          ලිපිනය
                        </th>
                        <th
                          className="fw-semibold py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          ණය මුදල
                        </th>
                        <th
                          className="fw-semibold py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          තීරක අංකය
                        </th>
                        <th
                          className="fw-semibold py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          තීරක නිලධාරියා
                        </th>
                        <th
                          className="fw-semibold py-3"
                          style={{
                            borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          තීන්දුව
                        </th>
                        <th className="fw-semibold py-3">විස්තර</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submission.borrowers.map((borrower, idx) => (
                        <tr
                          key={borrower.id}
                          style={{
                            transition: "all 0.2s",
                            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <td
                            className="fw-semibold text-muted px-4 py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            {submission.submittedDate
                              ? new Date(
                                  submission.submittedDate
                                ).toLocaleDateString("si-LK")
                              : "-"}
                          </td>
                          <td
                            className="py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            <span
                              className="badge bg-light text-dark"
                              style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
                            >
                              {borrower.loanNumber}
                            </span>
                          </td>
                          <td
                            className="py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            <strong>{borrower.borrowerName}</strong>
                          </td>
                          <td
                            className="py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            {borrower.borrowerAddress}
                          </td>
                          <td
                            className="py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            <strong className="text-primary">
                              රු.{" "}
                              {parseFloat(borrower.loanAmount).toLocaleString(
                                "si-LK"
                              )}
                            </strong>
                          </td>
                          <td
                            className="py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            <span
                              className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
                              style={{
                                border: "1px solid rgba(99, 102, 241, 0.2)",
                              }}
                            >
                              {borrower.arbitrationNumber || "-"}
                            </span>
                          </td>
                          <td
                            className="py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            <span className="text-success fw-semibold">
                              {borrower.assignedOfficerName || "-"}
                            </span>
                          </td>
                          <td
                            className="py-3"
                            style={{
                              borderRight: "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            {borrower.status === "decision-given" ? (
                              <button
                                onClick={() => {
                                  setSelectedDecisionView(borrower);
                                  setShowDecisionViewModal(true);
                                }}
                                className="btn btn-sm btn-success"
                                style={{
                                  borderRadius: "10px",
                                  border: "2px solid rgba(16, 185, 129, 0.3)",
                                }}
                              >
                                <Eye size={14} className="me-1" />
                                තීන්දුව බලන්න
                              </button>
                            ) : (
                              <span
                                className="badge bg-secondary bg-opacity-25 text-secondary px-3 py-2"
                                style={{
                                  border: "1px solid rgba(108, 117, 125, 0.2)",
                                }}
                              >
                                තීන්දුවක් ලබා දී නැත
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => {
                                setSelectedBorrower(borrower);
                                setShowDetailsModal(true);
                              }}
                              className="btn btn-outline-info btn-sm"
                              style={{
                                borderRadius: "10px",
                                border: "2px solid rgba(6, 182, 212, 0.3)",
                              }}
                            >
                              <Eye size={14} className="me-1" />
                              විස්තර
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* {showDecisionModal && (
        <DecisionModal
          borrower={selectedBorrower}
          onClose={() => {
            setShowDecisionModal(false);
            setSelectedBorrower(null);
          }}
        />
      )} */}

      <DecisionViewModal
        show={showDecisionViewModal}
        onClose={() => {
          setShowDecisionViewModal(false);
          setSelectedDecisionView(null);
        }}
        borrower={selectedDecisionView}
      />

      <BorrowerDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        borrower={selectedBorrower}
      />
    </div>
  );
};

export default MySubmissionsPage;
