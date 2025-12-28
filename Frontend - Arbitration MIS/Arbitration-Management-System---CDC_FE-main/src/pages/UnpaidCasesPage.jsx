import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Send,
  Eye,
  History,
  Calendar,
  DollarSign,
  MessageSquare,
  Gavel,
  Scale,
  X,
  CheckCircle,
  Info,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";

const UnpaidCasesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  const [unpaidCases, setUnpaidCases] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
    icon: null,
  });

  // NEW: State for deductions modal
  const [showDeductionsModal, setShowDeductionsModal] = useState(false);
  const [deductionsData, setDeductionsData] = useState({});

  useEffect(() => {
    loadUnpaidCases();
    loadHistory();
  }, []);

  const loadUnpaidCases = async () => {
    try {
      if (!user.societyId) {
        console.error("❌ No societyId found!");
        return;
      }

      const data = await api.getUnpaidBorrowersAfterDecision(user.societyId);
      setUnpaidCases(data);
      console.log("✅ Unpaid cases loaded:", data.length);
    } catch (err) {
      console.error("❌ Error loading unpaid cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      if (!user.societyId) return;

      const submissions = await api.getSubmissionsBySociety(user.societyId);
      const history = [];

      submissions.forEach((submission) => {
        submission.borrowers.forEach((borrower) => {
          if (borrower.submittedForApproval === true) {
            history.push({
              ...borrower,
              submissionId: submission.id,
              societyName: submission.societyName,
              districtName: submission.districtName,
            });
          }
        });
      });

      history.sort((a, b) => {
        const dateA = new Date(a.submittedForApprovalDate || 0);
        const dateB = new Date(b.submittedForApprovalDate || 0);
        return dateB - dateA;
      });

      setHistoryData(history);
    } catch (err) {
      console.error("❌ Error loading history:", err);
    }
  };

  const TableTextCell = ({ content, icon: Icon, iconColor, type }) => {
    if (!content) {
      return <span className="text-muted">-</span>;
    }

    const handleViewMore = () => {
      setModalContent({
        title: type === "judgment" ? "නඩු තීන්දුව" : "නීති නිලධාරී සටහන්",
        content: content,
        icon: Icon,
        iconColor: iconColor,
      });
      setShowTextModal(true);
    };

    return (
      <div
        className="p-2 bg-light"
        style={{
          borderRadius: "6px",
          maxWidth: "180px",
          fontSize: "0.75rem",
        }}
      >
        <div className="d-flex align-items-start">
          {Icon && (
            <Icon
              size={12}
              className={`me-2 ${iconColor} flex-shrink-0`}
              style={{ marginTop: "2px" }}
            />
          )}
          <div className="flex-grow-1">
            <div
              style={{
                display: "-webkit-box",
                WebkitLineClamp: "1",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: "4px",
              }}
            >
              {content}
            </div>
            <button
              onClick={handleViewMore}
              className="btn btn-link btn-sm p-0"
              style={{
                fontSize: "0.7rem",
                textDecoration: "none",
                lineHeight: "1",
              }}
            >
              <Eye size={11} className="me-1" />
              විස්තර බලන්න
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleShowPaymentDetails = (borrower) => {
    setSelectedPaymentHistory({
      borrowerName: borrower.borrowerName,
      arbitrationNumber: borrower.arbitrationNumber,
      payments: borrower.courtPayments,
    });
    setShowPaymentDetailsModal(true);
  };

  const calculateTotal = (payments) => {
    return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const handleSelectCase = (caseItem) => {
    const isSelected = selectedCases.some(
      (c) => c.borrowerId === caseItem.borrowerId
    );

    if (isSelected) {
      setSelectedCases(
        selectedCases.filter((c) => c.borrowerId !== caseItem.borrowerId)
      );
    } else {
      setSelectedCases([...selectedCases, caseItem]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCases.length === unpaidCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases([...unpaidCases]);
    }
  };

  // NEW: Open deductions modal
  const handleOpenDeductionsModal = () => {
    if (selectedCases.length === 0) {
      alert("කරුණාකර අවම වශයෙන් එක් නඩුවක් තෝරන්න!");
      return;
    }

    // Initialize deductions data for each selected case
    const initialData = {};
    selectedCases.forEach((c) => {
      initialData[c.borrowerId] = {
        deductionsFromLoanAmount: c.deductionsFromLoanAmount || "0",
        deductionsFromInterestAmount: c.deductionsFromInterestAmount || "0",
        courtCharges: c.courtCharges || "0",
        rebateDeductions: c.rebateDeductions || "0",
        bondAndInterest: c.bondAndInterest || "0",
        otherRebateDeductions: c.otherRebateDeductions || "0",
        totalDeductions: c.totalDeductions || "0",
      };
    });

    setDeductionsData(initialData);
    setShowDeductionsModal(true);
  };

  // NEW: Update deduction field
  const updateDeductionField = (borrowerId, field, value) => {
    setDeductionsData((prev) => {
      const updated = {
        ...prev,
        [borrowerId]: {
          ...prev[borrowerId],
          [field]: value,
        },
      };

      // Auto-calculate total when any field changes
      if (field !== "totalDeductions") {
        const data = updated[borrowerId];
        const total = (
          parseFloat(data.courtCharges || 0) +
          parseFloat(data.rebateDeductions || 0) +
          parseFloat(data.bondAndInterest || 0) +
          parseFloat(data.otherRebateDeductions || 0)
        ).toFixed(2);

        updated[borrowerId].totalDeductions = total;
      }

      return updated;
    });
  };

  // NEW: Validate all deductions before submission
  const validateDeductions = () => {
    for (const caseItem of selectedCases) {
      const data = deductionsData[caseItem.borrowerId];

      if (!data) {
        alert(
          `කරුණාකර ${caseItem.borrowerName} සඳහා අඩු කිරීම් විස්තර පුරවන්න`
        );
        return false;
      }

      const requiredFields = [
        { key: "deductionsFromLoanAmount", label: "මුල් මුදලින් අඩු කිරීම්" },
        { key: "deductionsFromInterestAmount", label: "පොළියෙන් අඩු කිරීම්" },
        { key: "courtCharges", label: "නඩු ගාස්තු" },
        { key: "rebateDeductions", label: "හිලව් කිරීම්" },
        { key: "bondAndInterest", label: "ඇප හා පොළිය" },
        { key: "otherRebateDeductions", label: "වෙනත් හිලව් කිරීම්" },
        { key: "totalDeductions", label: "මුළු එකතුව" },
      ];

      for (const field of requiredFields) {
        const value = data[field.key];
        if (value === "" || value === null || value === undefined) {
          alert(
            `කරුණාකර ${caseItem.borrowerName} සඳහා "${field.label}" පුරවන්න`
          );
          return false;
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          alert(`"${field.label}" වලංගු අංකයක් විය යුතුය (0 හෝ ඊට වැඩි)`);
          return false;
        }
      }
    }

    return true;
  };

  // NEW: Submit to legal action with deductions
  const handleSubmitToLegalAction = async () => {
    if (!validateDeductions()) {
      return;
    }

    if (
      !window.confirm(
        `තෝරාගත් නඩු ${selectedCases.length}ක් නීතිමය ක්‍රියාමාර්ගයට යවන්න?\n\nකරුණාකර සියලුම අඩු කිරීම් විස්තර නිවැරදි බව තහවුරු කරන්න.`
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const casesToSubmit = selectedCases.map((c) => ({
        submissionId: c.submissionId,
        borrowerId: c.borrowerId,
        societyId: user.societyId,
        districtId: user.district,
        ...deductionsData[c.borrowerId],
      }));

      const result = await api.submitCasesToLegalAction(casesToSubmit);
      alert(result.message || "නඩු සාර්ථකව නීතිමය ක්‍රියාමාර්ගයට යවන ලදී!");

      setSelectedCases([]);
      setDeductionsData({});
      setShowDeductionsModal(false);
      loadUnpaidCases();
      loadHistory();
    } catch (err) {
      console.error("❌ Error submitting cases:", err);
      alert("නඩු යැවීමේදී දෝෂයක් ඇති විය: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (borrower) => {
    const badgeStyle = {
      whiteSpace: "normal",
      lineHeight: "1.2",
      minWidth: "90px",
      minHeight: "36px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "4px 8px",
      fontSize: "9px",
    };

    if (borrower.judgmentResult) {
      return (
        <span
          className="badge"
          style={{
            ...badgeStyle,
            background: "linear-gradient(135deg, #4f8696 0%, #96d7ef 100%)",
          }}
        >
          නඩු තීන්දුව
          <br />
          ලබා දී ඇත
        </span>
      );
    } else if (borrower.assignedLegalOfficerId) {
      return (
        <span
          className="badge"
          style={{
            ...badgeStyle,
            background: "linear-gradient(135deg, #ab9f36 0%, #f0eb99 100%)",
          }}
        >
          උසාවි නිලධාරියා
          <br />
          පවරා ඇත
        </span>
      );
    } else if (borrower.approvedForDistrict) {
      return (
        <span
          className="badge"
          style={{
            ...badgeStyle,
            background: "linear-gradient(135deg, #4cab6f 0%, #8ff1b2 100%)",
          }}
        >
          දිස්ත්‍රික්
          <br />
          කාර්යාලයට
          <br />
          යවා ඇත
        </span>
      );
    } else if (borrower.submittedForApproval) {
      return (
        <span
          className="badge"
          style={{
            ...badgeStyle,
            background: "linear-gradient(135deg, #295373 0%, #80c4e6 100%)",
          }}
        >
          අනුමැතියට
          <br />
          යවා ඇත
        </span>
      );
    }
    return (
      <span
        className="badge"
        style={{
          ...badgeStyle,
          background: "linear-gradient(135deg, #585b59 0%, #8a8e8b 100%)",
        }}
      >
        -
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">
          තීරක නිලධාරියාගේ තීන්දුවට අනුව ගෙවීම් නොකළ ණයගැතියන්
        </h3>
        {activeTab === "unpaid" && unpaidCases.length > 0 && (
          <button
            onClick={handleOpenDeductionsModal}
            disabled={selectedCases.length === 0 || submitting}
            className="btn btn-primary"
            style={{ borderRadius: "10px" }}
          >
            <Scale size={18} className="me-2" />
            තෝරගත් ණයගැතියන් නීතිමය ක්‍රියාවලිය සදහා සමිති අනුමැතියට යවන්න (
            {selectedCases.length})
          </button>
        )}
      </div>

      {/* Tabs */}
      <ul
        className="nav nav-tabs mb-4"
        style={{ borderBottom: "2px solid #dee2e6" }}
      >
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
            style={{
              borderRadius: "10px 10px 0 0",
              fontWeight: activeTab === "history" ? "bold" : "normal",
              backgroundColor: activeTab === "history" ? "#fff" : "#e9d5ff",
              color: activeTab === "history" ? "#000" : "#7647a5",
              border:
                activeTab === "history"
                  ? "2px solid #dee2e6"
                  : "2px solid #e9d5ff",
              borderBottom: activeTab === "history" ? "2px solid #fff" : "none",
              marginBottom: "-2px",
              transition: "all 0.3s ease",
            }}
          >
            <History size={18} className="me-2" />
            නීතිමය ක්‍රියාවලියට ඉදිරිපත් කළ ණයගැතියන් ({historyData.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "unpaid" ? "active" : ""}`}
            onClick={() => setActiveTab("unpaid")}
            style={{
              borderRadius: "10px 10px 0 0",
              fontWeight: activeTab === "unpaid" ? "bold" : "normal",
              backgroundColor: activeTab === "unpaid" ? "#fff" : "#e9d5ff",
              color: activeTab === "unpaid" ? "#000" : "#7424c4",
              border:
                activeTab === "unpaid"
                  ? "2px solid #dee2e6"
                  : "2px solid #e9d5ff",
              borderBottom: activeTab === "unpaid" ? "2px solid #fff" : "none",
              marginBottom: "-2px",
              transition: "all 0.3s ease",
            }}
          >
            <AlertCircle size={18} className="me-2" />
            තීරක තීන්දුව ලැබුණු සියළුම ණයගැතියන් ({unpaidCases.length})
          </button>
        </li>
      </ul>

      {/* History Tab */}
      {activeTab === "history" && (
        <>
          {historyData.length === 0 ? (
            <div
              className="alert alert-info d-flex align-items-center"
              style={{ borderRadius: "10px" }}
            >
              <History size={18} className="me-2" />
              ඉතිහාස දත්ත හමු නොවීය
            </div>
          ) : (
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: "15px" }}
            >
              <div
                className="card-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #9756f2 0%, #736ddf 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h6 className="mb-0 fw-bold">
                  නඩු සදහා ඉදිරිපත් අනුමැතියට යවන ලද ණයගැතියන් (
                  {historyData.length})
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table
                    className="table table-bordered mb-0"
                    style={{ fontSize: "14px" }}
                  >
                    <thead
                      style={{
                        background: "#f5f5f5",
                        borderBottom: "2px solid #333",
                      }}
                    >
                      <tr>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          තීරක අංකය
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නම
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          ලිපිනය
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          ණය අංකය
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          ණය මුදල
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          උසාවිය
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නීති නිලධාරීයා
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නඩු දිනය
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නඩු අංකය
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නඩු තීන්දුව
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          උසාවි ගෙවීම
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නීති නිලධාරී සටහන්
                        </th>
                        <th
                          className="fw-semibold"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          විස්තර
                        </th>
                        <th className="fw-semibold">තත්වය</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((borrower) => (
                        <tr
                          key={`${borrower.submissionId}-${borrower.id}`}
                          style={{ borderBottom: "1px solid #ddd" }}
                        >
                          <td
                            style={{
                              borderRight: "1px solid #ddd",
                              fontWeight: "500",
                            }}
                          >
                            {borrower.arbitrationNumber}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.borrowerName}
                          </td>
                          <td
                            className="small"
                            style={{
                              borderRight: "1px solid #ddd",
                              color: "#666",
                            }}
                          >
                            {borrower.borrowerAddress}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.loanNumber}
                          </td>
                          <td
                            style={{
                              borderRight: "1px solid #ddd",
                              fontWeight: "500",
                            }}
                          >
                            රු.{" "}
                            {parseFloat(borrower.loanAmount).toLocaleString(
                              "si-LK"
                            )}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.assignedCourtName ? (
                              <span
                                style={{
                                  padding: "3px 8px",
                                  background: "#e8e8e8",
                                  borderRadius: "3px",
                                  fontSize: "12px",
                                }}
                              >
                                {borrower.assignedCourtName}
                              </span>
                            ) : (
                              <span style={{ color: "#999" }}>-</span>
                            )}
                          </td>
                          <td
                            className="small"
                            style={{
                              borderRight: "1px solid #ddd",
                              color: "#666",
                            }}
                          >
                            {borrower.assignedLegalOfficerName || "-"}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.judgmentDate ? (
                              <span style={{ color: "#666", fontSize: "13px" }}>
                                <Calendar size={12} className="me-1" />
                                {new Date(
                                  borrower.judgmentDate
                                ).toLocaleDateString("si-LK")}
                              </span>
                            ) : (
                              <span style={{ color: "#999" }}>-</span>
                            )}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.judgmentNumber ? (
                              <span style={{ fontWeight: "500" }}>
                                <FileText size={12} className="me-1" />
                                {borrower.judgmentNumber}
                              </span>
                            ) : (
                              <span style={{ color: "#999" }}>-</span>
                            )}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            <TableTextCell
                              content={borrower.judgmentResult}
                              icon={Gavel}
                              iconColor="text-secondary"
                              type="judgment"
                            />
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.courtPayments &&
                            borrower.courtPayments.length > 0 ? (
                              <div className="text-center">
                                <div
                                  style={{
                                    padding: "4px 8px",
                                    background: "#f0f0f0",
                                    borderRadius: "3px",
                                    marginBottom: "4px",
                                    fontSize: "10px",
                                  }}
                                >
                                  Paid
                                </div>
                                <div
                                  className="small fw-bold"
                                  style={{ color: "#333" }}
                                >
                                  රු.{" "}
                                  {borrower.courtPayments
                                    .reduce(
                                      (sum, p) =>
                                        sum + parseFloat(p.amount || 0),
                                      0
                                    )
                                    .toLocaleString("si-LK")}
                                </div>
                                <div
                                  className="small"
                                  style={{ fontSize: "8px", color: "#666" }}
                                >
                                  (ගෙවීම් - {borrower.courtPayments.length} )
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-success mt-1"
                                  style={{
                                    fontSize: "7px",
                                    padding: "1px 2px",
                                    borderRadius: "3px",
                                  }}
                                  onClick={() =>
                                    handleShowPaymentDetails(borrower)
                                  }
                                >
                                  විස්තර බලන්න
                                </button>
                              </div>
                            ) : (
                              <span
                                style={{
                                  padding: "1px 3px",
                                  background: "#f5f5f5",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  color: "#666",
                                }}
                              >
                                Non Paid
                              </span>
                            )}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            <TableTextCell
                              content={borrower.legalOfficerRemarks}
                              icon={MessageSquare}
                              iconColor="text-secondary"
                              type="remarks"
                            />
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            <button
                              onClick={() => {
                                setSelectedBorrower(borrower);
                                setShowDetailsModal(true);
                              }}
                              className="btn btn-outline-secondary btn-sm"
                              style={{ borderRadius: "3px", fontSize: "12px" }}
                            >
                              <Eye size={12} className="me-1" />
                              විස්තර
                            </button>
                          </td>
                          <td>{getStatusBadge(borrower)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-light">
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-primary">
                        {historyData.length}
                      </div>
                      <div className="small text-muted">
                        අනුමැතියට යවන ලද ණයගැතියන්{" "}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-success">
                        {
                          historyData.filter(
                            (b) => b.approvedForDistrict === true
                          ).length
                        }
                      </div>
                      <div className="small text-muted">
                        අනුමත කර දිස්ත්‍රික් කාර්යාලයට යවා ඇති{" "}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-warning">
                        {
                          historyData.filter((b) => b.assignedLegalOfficerId)
                            .length
                        }
                      </div>
                      <div className="small text-muted">
                        නීති නිලධාරීන්ට පවරා ඇති
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-info">
                        {historyData.filter((b) => b.judgmentResult).length}
                      </div>
                      <div className="small text-muted">
                        නඩු තීන්දු ලබා දී ඇති
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Unpaid Cases Tab */}
      {activeTab === "unpaid" && (
        <>
          {unpaidCases.length === 0 ? (
            <div
              className="alert alert-info d-flex align-items-center"
              style={{ borderRadius: "10px" }}
            >
              <AlertCircle size={18} className="me-2" />
              තීරක තීන්දුව ලැබුණු සියළුම ණයගැතියන් හමු නොවීය
            </div>
          ) : (
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: "15px" }}
            >
              <div
                className="card-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">
                    තීරක තීන්දුව ලැබුණු සියළුම ණයගැතියන් - මේ අතරින් තීරක
                    තීන්දුවට අනුව ගෙවීම් නොකළ ණයගැතියන් තෝරාගෙන නීතිමය
                    ක්‍රියාවලියට යොමු කළ යුතුය.
                  </h6>
                  {/* <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="selectAll"
                      checked={selectedCases.length === unpaidCases.length}
                      onChange={handleSelectAll}
                      style={{ cursor: "pointer" }}
                    />
                    <label
                      className="form-check-label text-white"
                      htmlFor="selectAll"
                      style={{ cursor: "pointer" }}
                    >
                      සියල්ල තෝරන්න
                    </label>
                  </div> */}
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="fw-semibold" style={{ width: "50px" }}>
                          තෝරන්න
                        </th>
                        <th className="fw-semibold">තීරක අංකය</th>
                        <th className="fw-semibold">ණයගැතියාගේ නම</th>
                        <th className="fw-semibold">ණය අංකය</th>
                        <th className="fw-semibold">ණය මුදල</th>
                        <th className="fw-semibold">පොළිය</th>
                        <th className="fw-semibold">තීරණ දිනය</th>
                        <th className="fw-semibold">තීරක නිලධාරියා</th>
                        <th className="fw-semibold">විස්තර</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unpaidCases.map((caseItem) => {
                        const isSelected = selectedCases.some(
                          (c) => c.borrowerId === caseItem.borrowerId
                        );
                        return (
                          <tr
                            key={caseItem.borrowerId}
                            style={{
                              backgroundColor: isSelected
                                ? "#fff3cd"
                                : "transparent",
                            }}
                          >
                            <td>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isSelected}
                                  onChange={() => handleSelectCase(caseItem)}
                                  style={{
                                    cursor: "pointer",
                                    border: "2px solid #0d6efd",
                                  }}
                                />
                              </div>
                            </td>
                            <td className="fw-bold text-primary">
                              {caseItem.arbitrationNumber}
                            </td>
                            <td>
                              <strong>{caseItem.borrowerName}</strong>
                            </td>
                            <td>{caseItem.loanNumber}</td>
                            <td>
                              රු.{" "}
                              {parseFloat(caseItem.loanAmount).toLocaleString(
                                "si-LK"
                              )}
                            </td>
                            <td>
                              රු.{" "}
                              {parseFloat(caseItem.interest).toLocaleString(
                                "si-LK"
                              )}
                            </td>
                            <td>
                              {caseItem.decisionDate
                                ? new Date(
                                    caseItem.decisionDate
                                  ).toLocaleDateString("si-LK")
                                : "-"}
                            </td>
                            <td className="text-muted">
                              {caseItem.assignedOfficerName}
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  setSelectedBorrower(caseItem);
                                  setShowDetailsModal(true);
                                }}
                                className="btn btn-outline-info btn-sm"
                                style={{ borderRadius: "8px" }}
                              >
                                <Eye size={12} className="me-1" />
                                විස්තර
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    මුළු නඩු: {unpaidCases.length} | තෝරාගත්:{" "}
                    {selectedCases.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Deductions Modal */}
      {showDeductionsModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }}
          onClick={() => !submitting && setShowDeductionsModal(false)}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "95%", margin: "1.75rem auto" }}
          >
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div
                className="modal-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <Scale size={20} className="me-2" />
                  නීතිමය ක්‍රියාවලිය සඳහා අඩු කිරීම් විස්තර
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => !submitting && setShowDeductionsModal(false)}
                  disabled={submitting}
                />
              </div>

              <div
                className="modal-body p-4"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <div className="alert alert-info d-flex align-items-start mb-4">
                  <Info size={20} className="me-2 flex-shrink-0 mt-1" />
                  <div>
                    <strong>වැදගත්:</strong> නීතිමය ක්‍රියාමාර්ගයට යැවීමට පෙර
                    සියලුම අඩු කිරීම් විස්තර නිවැරදිව පුරවන්න. සියලුම ක්ෂේත්‍ර
                    අනිවාර්ය වේ.
                  </div>
                </div>

                {selectedCases.map((caseItem, index) => {
                  const data = deductionsData[caseItem.borrowerId] || {};

                  return (
                    <div
                      key={caseItem.borrowerId}
                      className="card mb-4 border"
                      style={{ borderRadius: "10px" }}
                    >
                      <div
                        className="card-header"
                        style={{
                          background:
                            "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                          borderRadius: "10px 10px 0 0",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 fw-bold">
                            {index + 1}. {caseItem.borrowerName}
                          </h6>
                          <span className="badge bg-primary">
                            {caseItem.arbitrationNumber}
                          </span>
                        </div>
                        <div className="mt-2 small text-muted">
                          ණය මුදල: රු.{" "}
                          {parseFloat(caseItem.loanAmount).toLocaleString(
                            "si-LK"
                          )}{" "}
                          | පොළිය: රු.{" "}
                          {parseFloat(caseItem.interest).toLocaleString(
                            "si-LK"
                          )}
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="row g-3">
                          {/* Deductions from Loan Amount */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <span className="text-danger">*</span> මුල්
                              මුදලින් අඩු කිරීම් (රු.)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={data.deductionsFromLoanAmount || ""}
                              onChange={(e) =>
                                updateDeductionField(
                                  caseItem.borrowerId,
                                  "deductionsFromLoanAmount",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              disabled={submitting}
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          {/* Deductions from Interest */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <span className="text-danger">*</span> පොළියෙන්
                              අඩු කිරීම් (රු.)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={data.deductionsFromInterestAmount || ""}
                              onChange={(e) =>
                                updateDeductionField(
                                  caseItem.borrowerId,
                                  "deductionsFromInterestAmount",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              disabled={submitting}
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          {/* Court Charges Section */}
                          <div className="col-12">
                            <hr className="my-3" />
                            <h6 className="fw-bold text-primary mb-3">
                              නඩු ගාස්තු විස්තර
                            </h6>
                          </div>

                          {/* Court Charges */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <span className="text-danger">*</span> නඩු ගාස්තු
                              (රු.)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={data.courtCharges || ""}
                              onChange={(e) =>
                                updateDeductionField(
                                  caseItem.borrowerId,
                                  "courtCharges",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              disabled={submitting}
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          {/* Rebate Deductions */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <span className="text-danger">*</span> හිලව්
                              කිරීම් (රු.)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={data.rebateDeductions || ""}
                              onChange={(e) =>
                                updateDeductionField(
                                  caseItem.borrowerId,
                                  "rebateDeductions",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              disabled={submitting}
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          {/* Bond and Interest */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <span className="text-danger">*</span> ඇප හා පොළිය
                              (රු.)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={data.bondAndInterest || ""}
                              onChange={(e) =>
                                updateDeductionField(
                                  caseItem.borrowerId,
                                  "bondAndInterest",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              disabled={submitting}
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          {/* Other Rebate Deductions */}
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <span className="text-danger">*</span> වෙනත් හිලව්
                              කිරීම් (රු.)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={data.otherRebateDeductions || ""}
                              onChange={(e) =>
                                updateDeductionField(
                                  caseItem.borrowerId,
                                  "otherRebateDeductions",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              disabled={submitting}
                              style={{ borderRadius: "8px" }}
                            />
                          </div>

                          {/* Total Deductions */}
                          <div className="col-12">
                            <hr className="my-3" />
                            <div className="alert alert-success">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">මුළු එකතුව :</span>
                                <span className="fs-5 fw-bold">
                                  රු.{" "}
                                  {parseFloat(
                                    data.totalDeductions || 0
                                  ).toLocaleString("si-LK", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeductionsModal(false)}
                  disabled={submitting}
                  style={{ borderRadius: "10px" }}
                >
                  <X size={16} className="me-2" />
                  අවලංගු කරන්න
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSubmitToLegalAction}
                  disabled={submitting}
                  style={{ borderRadius: "10px" }}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      යවමින්...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="me-2" />
                      නීතිමය ක්‍රියාවලිය සදහා සමිති අනුමැතියට යවන්න
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Borrower Details Modal */}
      <BorrowerDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        borrower={selectedBorrower}
      />

      {/* Payment Details Modal */}
      {showPaymentDetailsModal && selectedPaymentHistory && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowPaymentDetailsModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div
                className="modal-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <DollarSign size={20} className="me-2" />
                  උසාවි ගෙවීම් විස්තර
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowPaymentDetailsModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">
                        තීරක අංකය
                      </small>
                      <strong className="text-primary">
                        {selectedPaymentHistory.arbitrationNumber}
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">
                        ණයගැතියා
                      </small>
                      <strong>{selectedPaymentHistory.borrowerName}</strong>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">ගෙවීම් ඉතිහාසය</h6>
                <div className="table-responsive">
                  <table className="table table-hover table-bordered">
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="fw-semibold">#</th>
                        <th className="fw-semibold">
                          <Calendar size={14} className="me-1" />
                          දිනය
                        </th>
                        <th className="fw-semibold text-end">
                          <DollarSign size={14} className="me-1" />
                          මුදල (රු.)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPaymentHistory.payments.map((payment, index) => (
                        <tr key={payment.id || index}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "si-LK",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td className="text-end fw-semibold text-success">
                            රු.{" "}
                            {parseFloat(payment.amount).toLocaleString("si-LK")}
                          </td>
                        </tr>
                      ))}
                      <tr className="table-success">
                        <td colSpan="2" className="text-end fw-bold">
                          මුළු ගෙවූ මුදල:
                        </td>
                        <td className="text-end fw-bold fs-5">
                          රු.{" "}
                          {calculateTotal(
                            selectedPaymentHistory.payments
                          ).toLocaleString("si-LK")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentDetailsModal(false)}
                  style={{ borderRadius: "10px" }}
                >
                  වසන්න
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Details Modal */}
      {showTextModal && modalContent && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowTextModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div
                className="modal-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a485ec 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  {modalContent.icon && (
                    <modalContent.icon size={20} className="me-2" />
                  )}
                  {modalContent.title}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowTextModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                <div
                  className="p-3 bg-light rounded"
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.8",
                    whiteSpace: "pre-wrap",
                    maxHeight: "60vh",
                    overflowY: "auto",
                  }}
                >
                  {modalContent.content}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowTextModal(false)}
                  style={{ borderRadius: "10px" }}
                >
                  වසන්න
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnpaidCasesPage;
