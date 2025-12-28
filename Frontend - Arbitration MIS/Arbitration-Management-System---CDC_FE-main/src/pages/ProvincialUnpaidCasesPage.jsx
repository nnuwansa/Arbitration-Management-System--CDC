import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Eye,
  UserPlus,
  Building,
  CheckCircle,
  XCircle,
  History,
  Gavel,
  Calendar,
  FileText,
  User,
  Search,
  MapPin,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";

const ProvincialUnpaidCasesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  const [paymentPendingCases, setPaymentPendingCases] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [legalOfficers, setLegalOfficers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedLegalOfficer, setSelectedLegalOfficer] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [districts, setDistricts] = useState([]);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
    icon: null,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, filterDistrict, historyData]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load districts first
      const districtsData = await api.getDistricts();
      setDistricts(districtsData);

      // Load data from all districts
      await Promise.all([
        loadPaymentPendingCasesForAllDistricts(districtsData),
        loadHistoryForAllDistricts(districtsData),
        loadAllLegalOfficers(districtsData),
        loadAllCourts(districtsData),
      ]);
    } catch (err) {
      console.error("❌ Error loading data:", err);
    } finally {
      setLoading(false);
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
          maxWidth: "250px",
          fontSize: "0.85rem",
        }}
      >
        <div className="d-flex align-items-start">
          {Icon && (
            <Icon
              size={14}
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

  // Function to open payment details modal
  const handleShowPaymentDetails = (borrower) => {
    setSelectedPaymentHistory({
      borrowerName: borrower.borrowerName,
      arbitrationNumber: borrower.arbitrationNumber,
      payments: borrower.courtPayments,
    });
    setShowPaymentDetailsModal(true);
  };

  // Helper function to calculate total
  const calculateTotal = (payments) => {
    return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const loadPaymentPendingCasesForAllDistricts = async (districtsData) => {
    try {
      const allCases = [];

      for (const district of districtsData) {
        try {
          const data = await api.getPaymentPendingCases(district.id);
          allCases.push(...data);
        } catch (err) {
          console.error(`❌ Error loading cases for ${district.name}:`, err);
        }
      }

      setPaymentPendingCases(allCases);
      console.log("✅ Total payment pending cases loaded:", allCases.length);
    } catch (err) {
      console.error("❌ Error loading payment pending cases:", err);
    }
  };

  const loadHistoryForAllDistricts = async (districtsData) => {
    try {
      const allHistory = [];

      for (const district of districtsData) {
        try {
          const submissions = await api.getSubmissionsByDistrict(district.id);

          submissions.forEach((submission) => {
            submission.borrowers.forEach((borrower) => {
              if (borrower.approvedForDistrict === true) {
                allHistory.push({
                  ...borrower,
                  submissionId: submission.id,
                  societyName: submission.societyName,
                  districtName: submission.districtName,
                  districtId: submission.districtId,
                  submittedDate: submission.submittedDate,
                });
              }
            });
          });
        } catch (err) {
          console.error(`❌ Error loading history for ${district.name}:`, err);
        }
      }

      // Sort by latest activity
      allHistory.sort((a, b) => {
        const dateA = new Date(
          a.judgmentDate ||
            a.legalAssignmentDate ||
            a.approvedForDistrictDate ||
            0
        );
        const dateB = new Date(
          b.judgmentDate ||
            b.legalAssignmentDate ||
            b.approvedForDistrictDate ||
            0
        );
        return dateB - dateA;
      });

      setHistoryData(allHistory);
      console.log("✅ Total history cases loaded:", allHistory.length);
    } catch (err) {
      console.error("❌ Error loading history:", err);
    }
  };

  const loadAllLegalOfficers = async (districtsData) => {
    try {
      const allOfficers = [];

      for (const district of districtsData) {
        try {
          const data = await api.getLegalOfficersByDistrict(district.id);
          const officersWithDistrict = data.map((officer) => ({
            ...officer,
            districtName: district.name,
          }));
          allOfficers.push(...officersWithDistrict);
        } catch (err) {
          console.error(`❌ Error loading officers for ${district.name}:`, err);
        }
      }

      setLegalOfficers(allOfficers);
    } catch (err) {
      console.error("❌ Error loading legal officers:", err);
    }
  };

  const loadAllCourts = async (districtsData) => {
    try {
      const allCourts = [];

      for (const district of districtsData) {
        try {
          const data = await api.getCourtsByDistrict(district.id);
          const courtsWithDistrict = data.map((court) => ({
            ...court,
            districtName: district.name,
          }));
          allCourts.push(...courtsWithDistrict);
        } catch (err) {
          console.error(`❌ Error loading courts for ${district.name}:`, err);
        }
      }

      setCourts(allCourts);
    } catch (err) {
      console.error("❌ Error loading courts:", err);
    }
  };

  //   const generateLetter = (caseData) => {
  //     const letterHTML = `
  // <!DOCTYPE html>
  // <html>
  // <head>
  //     <meta charset='utf-8'>
  //     <title>නඩු ලිපිය</title>
  //     <style>
  //         @page { size: A4; margin: 2cm; }
  //         body { font-family: 'FM Abhaya', 'Noto Sans Sinhala', 'Iskoola Pota', Arial, sans-serif; font-size: 11pt; line-height: 1.6; }
  //         .header { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 20px; }
  //         .content { margin: 20px 0; }
  //         .field { margin: 10px 0; }
  //         .label { font-weight: bold; }
  //     </style>
  // </head>
  // <body>
  //     <div class="header">නඩු විස්තර ලිපිය</div>
  //     <div class="content">
  //         <div class="field"><span class="label">තීරක අංකය:</span> ${
  //           caseData.arbitrationNumber || "-"
  //         }</div>
  //         <div class="field"><span class="label">ණයගැතියාගේ නම:</span> ${
  //           caseData.borrowerName
  //         }</div>
  //         <div class="field"><span class="label">ලිපිනය:</span> ${
  //           caseData.borrowerAddress
  //         }</div>
  //         <div class="field"><span class="label">ණය අංකය:</span> ${
  //           caseData.loanNumber
  //         }</div>
  //         <div class="field"><span class="label">ණය මුදල:</span> රු. ${parseFloat(
  //           caseData.loanAmount
  //         ).toLocaleString("si-LK")}</div>
  //         <div class="field"><span class="label">සමිතිය:</span> ${
  //           caseData.societyName
  //         }</div>
  //         <div class="field"><span class="label">දිස්ත්‍රික්කය:</span> ${
  //           caseData.districtName
  //         }</div>
  //         <div class="field"><span class="label">උසාවිය:</span> ${
  //           caseData.assignedCourtName || "-"
  //         }</div>
  //         <div class="field"><span class="label">පැවරූ දිනය:</span> ${
  //           caseData.legalAssignmentDate
  //             ? new Date(caseData.legalAssignmentDate).toLocaleDateString("si-LK")
  //             : "-"
  //         }</div>
  //         ${
  //           caseData.judgmentDate
  //             ? `<div class="field"><span class="label">නඩු දිනය:</span> ${new Date(
  //                 caseData.judgmentDate
  //               ).toLocaleDateString("si-LK")}</div>`
  //             : ""
  //         }
  //         ${
  //           caseData.judgmentNumber
  //             ? `<div class="field"><span class="label">නඩු අංකය:</span> ${caseData.judgmentNumber}</div>`
  //             : ""
  //         }
  //         ${
  //           caseData.judgmentResult
  //             ? `<div class="field"><span class="label">නඩු තීන්දුව:</span> ${caseData.judgmentResult}</div>`
  //             : ""
  //         }
  //     </div>
  // </body>
  // </html>`;

  //     const blob = new Blob(["\ufeff", letterHTML], {
  //       type: "application/msword;charset=utf-8",
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `නඩු_ලිපිය_${caseData.arbitrationNumber || "document"}.doc`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(url);
  //     alert("ලිපිය Word ලියවිල්ලක් ලෙස බාගත වේ");
  //   };

  const applyFilters = () => {
    let filtered = [...historyData];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (borrower) =>
          borrower.borrowerName?.toLowerCase().includes(search) ||
          borrower.arbitrationNumber?.toLowerCase().includes(search) ||
          borrower.loanNumber?.toLowerCase().includes(search) ||
          borrower.judgmentNumber?.toLowerCase().includes(search) ||
          borrower.societyName?.toLowerCase().includes(search) ||
          borrower.districtName?.toLowerCase().includes(search)
      );
    }

    if (filterDistrict !== "all") {
      filtered = filtered.filter(
        (borrower) => borrower.districtId === filterDistrict
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((borrower) => {
        switch (filterStatus) {
          case "assigned":
            return borrower.assignedLegalOfficerId && !borrower.judgmentResult;
          case "judgment":
            return borrower.judgmentResult;
          default:
            return true;
        }
      });
    }

    setFilteredData(filtered);
  };

  const handleOpenAssignModal = (caseItem) => {
    setSelectedCase(caseItem);
    setSelectedLegalOfficer(caseItem.legalOfficerId || "");
    setSelectedCourt(caseItem.courtId || "");
    setShowAssignModal(true);
  };

  const handleAssignLegalOfficer = async () => {
    if (!selectedLegalOfficer || !selectedCourt) {
      alert("කරුණාකර උසාවි නිලධාරියා	 සහ අධිකරණය තෝරන්න!");
      return;
    }

    if (
      !window.confirm("තෝරාගත් උසාවි නිලධාරියා	 සහ අධිකරණය මෙම නඩුවට පවරන්න?")
    ) {
      return;
    }

    setAssigning(true);
    try {
      await api.assignLegalOfficerToBorrower(
        selectedCase.submissionId,
        selectedCase.borrowerId,
        selectedLegalOfficer,
        selectedCourt
      );

      alert("උසාවි නිලධාරියා	 සාර්ථකව පවරන ලදී!");
      setShowAssignModal(false);
      loadAllData();
    } catch (err) {
      console.error("❌ Error assigning legal officer:", err);
      alert("උසාවි නිලධාරියා	 පැවරීමේදී දෝෂයක් ඇති විය!");
    } finally {
      setAssigning(false);
    }
  };

  // const getStatusBadge = (borrower) => {
  //   if (borrower.judgmentResult) {
  //     return (
  //       <span className="badge bg-success">
  //         <Gavel size={12} className="me-1" />
  //         නඩු තීන්දුව ලබා දී ඇත
  //       </span>
  //     );
  //   } else if (borrower.assignedLegalOfficerId) {
  //     return (
  //       <span className="badge bg-warning">
  //         <User size={12} className="me-1" />
  //         උසාවි නිලධාරියා	ට පවරා ඇත
  //       </span>
  //     );
  //   }
  //   return <span className="badge bg-secondary">-</span>;
  // };

  const getStatusBadge = (borrower) => {
    if (borrower.judgmentResult) {
      return (
        <span
          className="badge bg-success d-flex align-items-center justify-content-center"
          style={{ whiteSpace: "normal", lineHeight: "1.3", minWidth: "100px" }}
        >
          <Gavel size={12} className="me-1 flex-shrink-0" />
          <span>
            නඩු තීන්දුව
            <br />
            ලබා දී ඇත
          </span>
        </span>
      );
    } else if (borrower.assignedLegalOfficerId) {
      return (
        <span
          className="badge bg-warning d-flex align-items-center justify-content-center"
          style={{ whiteSpace: "normal", lineHeight: "1.3", minWidth: "100px" }}
        >
          <User size={12} className="me-1 flex-shrink-0" />
          <span>
            උසාවි නිලධාරියා ට
            <br />
            පවරා ඇත
          </span>
        </span>
      );
    }
    return <span className="badge bg-secondary">-</span>;
  };

  const AssignLegalOfficerModal = () => {
    if (!showAssignModal || !selectedCase) return null;

    // Filter officers and courts by selected case's district
    const relevantOfficers = legalOfficers.filter(
      (officer) => officer.districtId === selectedCase.districtId
    );
    const relevantCourts = courts.filter(
      (court) => court.districtId === selectedCase.districtId
    );

    return (
      <div
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={() => setShowAssignModal(false)}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content" style={{ borderRadius: "15px" }}>
            <div
              className="modal-header text-white"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                borderRadius: "15px 15px 0 0",
              }}
            >
              <h5 className="modal-title fw-bold">
                උසාවි නිලධාරියා සහ අධිකරණය පැවරීම
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowAssignModal(false)}
              />
            </div>
            <div className="modal-body p-4">
              <div
                className="alert alert-info mb-4"
                style={{ borderRadius: "10px" }}
              >
                <h6 className="fw-bold mb-3">නඩු තොරතුරු</h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <strong>තීරක අංකය:</strong>{" "}
                    <span className="text-primary">
                      {selectedCase.arbitrationNumber}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>ණය ගැතියා:</strong>{" "}
                    <span>{selectedCase.borrowerName}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>ණය අංකය:</strong> {selectedCase.loanNumber}
                  </div>
                  <div className="col-md-6">
                    <strong>සංගමය:</strong> {selectedCase.societyName}
                  </div>
                  <div className="col-md-6">
                    <strong>දිස්ත්‍රික්කය:</strong> {selectedCase.districtName}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <UserPlus size={18} className="me-2" />
                  උසාවි නිලධාරියා තෝරන්න *
                </label>
                <select
                  className="form-select"
                  value={selectedLegalOfficer}
                  onChange={(e) => setSelectedLegalOfficer(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="">නීති නිලධාරියෙක් තෝරන්න</option>
                  {relevantOfficers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} - {officer.designation}
                    </option>
                  ))}
                </select>
                {relevantOfficers.length === 0 && (
                  <small className="text-danger">
                    මෙම දිස්ත්‍රික්කයට නීති නිලධාරීන් නොමැත
                  </small>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <Building size={18} className="me-2" />
                  අධිකරණය තෝරන්න *
                </label>
                <select
                  className="form-select"
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="">අධිකරණයක් තෝරන්න</option>
                  {relevantCourts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name} - {court.type}
                    </option>
                  ))}
                </select>
                {relevantCourts.length === 0 && (
                  <small className="text-danger">
                    මෙම දිස්ත්‍රික්කයට අධිකරණ නොමැත
                  </small>
                )}
              </div>

              {selectedCase.legalOfficerId && (
                <div
                  className="alert alert-warning"
                  style={{ borderRadius: "10px" }}
                >
                  <strong>දැනට පවරා ඇත:</strong>
                  <br />
                  උසාවි නිලධාරියා : {selectedCase.legalOfficerName}
                  <br />
                  අධිකරණය: {selectedCase.courtName}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
                style={{ borderRadius: "10px" }}
              >
                <XCircle size={16} className="me-2" />
                අවලංගු කරන්න
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAssignLegalOfficer}
                disabled={!selectedLegalOfficer || !selectedCourt || assigning}
                style={{ borderRadius: "10px" }}
              >
                {assigning ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    පවරමින්...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="me-2" />
                    පවරන්න
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">දත්ත පූරණය වෙමින්...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold">
          පළාත් මට්ටමේ පැවරීමට අපේක්ෂිත නඩු (නීති කටයුතු සඳහා)
        </h2>
        <p className="text-muted">
          සියලු දිස්ත්‍රික්කවල තීරකකරණයෙන් පසුව නිසි පරිදි ගෙවීම් සිදු නොකළ
          ණයගැතියන්
        </p>
      </div>

      {/* Tabs */}
      {/* <ul
        className="nav nav-tabs mb-4"
        style={{ borderBottom: "2px solid #dee2e6" }}
      >
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
            style={{
              borderRadius: "10px 10px 0 0",
              fontWeight: activeTab === "pending" ? "bold" : "normal",
              backgroundColor: activeTab === "pending" ? "#fff" : "transparent",
              border: activeTab === "pending" ? "2px solid #dee2e6" : "none",
              borderBottom: activeTab === "pending" ? "2px solid #fff" : "none",
              marginBottom: "-2px",
            }}
          >
            <AlertCircle size={18} className="me-2" />
            නීති නිලධාරීන්ට පැවරීමට අපේක්ෂිත ({paymentPendingCases.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
            style={{
              borderRadius: "10px 10px 0 0",
              fontWeight: activeTab === "history" ? "bold" : "normal",
              backgroundColor: activeTab === "history" ? "#fff" : "transparent",
              border: activeTab === "history" ? "2px solid #dee2e6" : "none",
              borderBottom: activeTab === "history" ? "2px solid #fff" : "none",
              marginBottom: "-2px",
            }}
          >
            <History size={18} className="me-2" />
            නීති නිලධාරීන්ට පවරා ඇති ({historyData.length})
          </button>
        </li>
      </ul> */}

      <ul
        className="nav nav-tabs mb-4"
        style={{ borderBottom: "2px solid #dee2e6" }}
      >
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
            style={{
              borderRadius: "10px 10px 0 0",
              fontWeight: activeTab === "pending" ? "bold" : "normal",
              backgroundColor: activeTab === "pending" ? "#fff" : "#e9d5ff",
              color: activeTab === "pending" ? "#000" : "#7647a5",
              border:
                activeTab === "pending"
                  ? "2px solid #dee2e6"
                  : "2px solid #e9d5ff",
              borderBottom: activeTab === "pending" ? "2px solid #fff" : "none",
              marginBottom: "-2px",
              transition: "all 0.3s ease",
            }}
          >
            <AlertCircle size={18} className="me-2" />
            නීති නිලධාරීන්ට පැවරීමට අපේක්ෂිත ({paymentPendingCases.length})
          </button>
        </li>
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
            නීති නිලධාරීන්ට පවරා ඇති ({historyData.length})
          </button>
        </li>
      </ul>

      {/* Pending Cases Tab */}
      {activeTab === "pending" && (
        <>
          {paymentPendingCases.length === 0 ? (
            <div
              className="alert alert-info d-flex align-items-center"
              style={{ borderRadius: "10px" }}
            >
              <AlertCircle size={18} className="me-2" />
              පැවරීමට අපේක්ෂිත නඩු හමු නොවීය
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
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h6 className="mb-0 fw-bold">
                  පැවරීමට අපේක්ෂිත නඩු ({paymentPendingCases.length})
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="fw-semibold">දිස්ත්‍රික්කය</th>
                        <th className="fw-semibold">තීරක අංකය</th>
                        <th className="fw-semibold">ණය ගැතියාගේ නම</th>
                        <th className="fw-semibold">ලිපිනය</th>
                        <th className="fw-semibold">ණය අංකය</th>
                        <th className="fw-semibold">සංගමය</th>
                        <th className="fw-semibold">අවසන් මුදල</th>
                        <th className="fw-semibold">තීරණ දිනය</th>
                        <th className="fw-semibold">අනුමත දිනය</th>
                        <th className="fw-semibold">උසාවි නිලධාරියා </th>
                        <th className="fw-semibold">අධිකරණය</th>
                        <th className="fw-semibold">විස්තර</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentPendingCases.map((caseItem) => (
                        <tr
                          key={`${caseItem.submissionId}-${caseItem.borrowerId}`}
                        >
                          <td>
                            <span className="badge bg-info">
                              <MapPin size={12} className="me-1" />
                              {caseItem.districtName}
                            </span>
                          </td>
                          <td className="fw-bold text-primary">
                            {caseItem.arbitrationNumber}
                          </td>
                          <td>
                            <strong>{caseItem.borrowerName}</strong>
                          </td>
                          <td className="text-muted small">
                            {caseItem.borrowerAddress}
                          </td>
                          <td>{caseItem.loanNumber}</td>
                          <td className="text-muted">{caseItem.societyName}</td>
                          <td className="fw-bold text-success">
                            රු.{" "}
                            {parseFloat(
                              caseItem.finalLoanAmount
                            ).toLocaleString("si-LK")}
                          </td>
                          <td>
                            {caseItem.decisionDate
                              ? new Date(
                                  caseItem.decisionDate
                                ).toLocaleDateString("si-LK")
                              : "-"}
                          </td>
                          <td>
                            {caseItem.approvedForDistrictDate
                              ? new Date(
                                  caseItem.approvedForDistrictDate
                                ).toLocaleDateString("si-LK")
                              : "-"}
                          </td>
                          <td>
                            {caseItem.legalOfficerName ? (
                              <span className="badge bg-success">
                                {caseItem.legalOfficerName}
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                පවරා නැත
                              </span>
                            )}
                          </td>
                          <td>
                            {caseItem.courtName ? (
                              <span className="text-info small">
                                {caseItem.courtName}
                              </span>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {/* <button
                                onClick={() => handleOpenAssignModal(caseItem)}
                                className="btn btn-sm btn-primary"
                                style={{ borderRadius: "8px 0 0 8px" }}
                                title="උසාවි නිලධාරියා	 පැවරීම"
                              >
                                <UserPlus size={14} />
                              </button> */}
                              <button
                                onClick={() => {
                                  setSelectedBorrower(caseItem);
                                  setShowDetailsModal(true);
                                }}
                                className="btn btn-sm btn-outline-info"
                                style={{ borderRadius: "0 8px 8px 0" }}
                                title="විස්තර බලන්න"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">
                    මුළු නඩු: {paymentPendingCases.length} | නීති නිලධාරීන්ට
                    පවරා ඇත:{" "}
                    {paymentPendingCases.filter((c) => c.legalOfficerId).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <>
          {/* Search and Filters */}
          <div
            className="card mb-4 border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "10px 0 0 10px" }}
                    >
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="නම, තීරක අංකය, ණය අංකය, නඩු අංකය හෝ සංගමය අනුව සොයන්න..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: "0 10px 10px 0" }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="all">සියලු දිස්ත්‍රික්ක</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="all">සියලු තත්වයන්</option>
                    <option value="assigned">උසාවි නිලධාරියා ට පවරා ඇත</option>
                    <option value="judgment">නඩු තීන්දුව ලබා දී ඇත</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div
              className="alert alert-info d-flex align-items-center"
              style={{ borderRadius: "10px" }}
            >
              <History size={18} className="me-2" />
              {searchTerm || filterStatus !== "all" || filterDistrict !== "all"
                ? "සෙවුම් ප්‍රතිඵල හමු නොවීය"
                : "ඉතිහාස දත්ත හමු නොවීය"}
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
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">
                    නීති නිලධාරීන්ට පවරා ඇති ({filteredData.length})
                  </h6>
                  {(searchTerm || filterDistrict !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterDistrict("all");
                      }}
                      className="btn btn-sm btn-light"
                      style={{ borderRadius: "8px" }}
                    >
                      සෙවුම හිස් කරන්න
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="fw-semibold">දිස්ත්‍රික්කය</th>
                        <th className="fw-semibold">තීරක අංකය</th>
                        <th className="fw-semibold">නම</th>
                        <th className="fw-semibold">ලිපිනය</th>
                        <th className="fw-semibold">සංගමය</th>
                        <th className="fw-semibold">ණය අංකය</th>
                        <th className="fw-semibold">ණය මුදල</th>
                        <th className="fw-semibold">උසාවි නිලධාරියා </th>
                        <th className="fw-semibold">උසාවිය</th>
                        {/* <th className="fw-semibold">ලිපිය</th> */}
                        <th className="fw-semibold">නඩු දිනය</th>
                        <th className="fw-semibold">නඩු අංකය</th>
                        <th className="fw-semibold">නඩු තීන්දුව</th>
                        <th className="fw-semibold">උසාවි ගෙවීම</th>
                        <th className="fw-semibold">නීති නිලධාරී සටහන්</th>
                        <th className="fw-semibold">තත්වය</th>
                        <th className="fw-semibold">විස්තර</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((borrower) => (
                        <tr key={`${borrower.submissionId}-${borrower.id}`}>
                          <td>
                            <span className="badge bg-secondary">
                              <MapPin size={12} className="me-1" />
                              {borrower.districtName}
                            </span>
                          </td>
                          <td className="fw-bold text-primary">
                            {borrower.arbitrationNumber}
                          </td>
                          <td>
                            <strong>{borrower.borrowerName}</strong>
                          </td>
                          <td
                            className="small text-muted"
                            style={{ maxWidth: "150px" }}
                          >
                            {borrower.borrowerAddress}
                          </td>
                          <td className="text-muted small">
                            {borrower.societyName}
                          </td>
                          <td>{borrower.loanNumber}</td>
                          <td className="text-success fw-bold">
                            රු.{" "}
                            {parseFloat(
                              borrower.finalLoanAmount || 0
                            ).toLocaleString("si-LK")}
                          </td>
                          <td>
                            {borrower.assignedLegalOfficerName ? (
                              <span className="badge bg-secondary">
                                <User size={12} className="me-1" />
                                {borrower.assignedLegalOfficerName}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {borrower.assignedCourtName ? (
                              <span className="badge bg-secondary">
                                <Building size={12} className="me-1" />
                                {borrower.assignedCourtName}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          {/* <td className="text-center">
                            <button
                              onClick={() => generateLetter(borrower)}
                              className="btn btn-primary btn-sm"
                              style={{ borderRadius: "5px", fontSize: "11px" }}
                            >
                              <FileText size={12} className="me-1" />
                              ලිපිය
                            </button>
                          </td> */}
                          <td>
                            {borrower.judgmentDate ? (
                              <span className="text-muted small">
                                <Calendar size={14} className="me-1" />
                                {new Date(
                                  borrower.judgmentDate
                                ).toLocaleDateString("si-LK")}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {borrower.judgmentNumber ? (
                              <span className="fw-bold text-secondary">
                                <FileText size={14} className="me-1" />
                                {borrower.judgmentNumber}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          {/* <td>
                            {borrower.judgmentResult ? (
                              <div
                                className="p-2 bg-light"
                                style={{
                                  borderRadius: "6px",
                                  maxWidth: "200px",
                                  fontSize: "0.85rem",
                                }}
                              >
                                <Gavel
                                  size={14}
                                  className="me-1 text-warning"
                                />
                                {borrower.judgmentResult}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td> */}
                          <td>
                            <TableTextCell
                              content={borrower.judgmentResult}
                              icon={Gavel}
                              iconColor="text-warning"
                              type="judgment"
                            />
                          </td>

                          <td>
                            {borrower.courtPayments &&
                            borrower.courtPayments.length > 0 ? (
                              <div className="text-center">
                                <span className="badge bg-success d-block mb-1">
                                  <DollarSign size={12} className="me-1" />
                                  ගෙවා ඇත
                                </span>
                                <div className="small text-success fw-bold">
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
                                  className="small text-muted"
                                  style={{ fontSize: "10px" }}
                                >
                                  ({borrower.courtPayments.length} ගෙවීම්)
                                </div>

                                {/* Show payment details button */}
                                <button
                                  className="btn btn-sm btn-outline-secondary mt-1"
                                  style={{
                                    fontSize: "8px",
                                    padding: "1px 6px",
                                  }}
                                  onClick={() =>
                                    handleShowPaymentDetails(borrower)
                                  }
                                >
                                  විස්තර බලන්න
                                </button>
                              </div>
                            ) : (
                              <span className="badge bg-secondary">
                                ගෙවීම් නැත
                              </span>
                            )}
                          </td>
                          {/* Legal Officer Remarks */}
                          {/* <td>
                            {borrower.legalOfficerRemarks ? (
                              <div
                                className="p-2 bg-light"
                                style={{
                                  borderRadius: "6px",
                                  maxWidth: "200px",
                                  maxHeight: "80px",
                                  overflow: "auto",
                                  fontSize: "0.85rem",
                                }}
                                title={borrower.legalOfficerRemarks}
                              >
                                <MessageSquare
                                  size={14}
                                  className="me-1 text-info"
                                />
                                {borrower.legalOfficerRemarks.length > 100
                                  ? borrower.legalOfficerRemarks.substring(
                                      0,
                                      100
                                    ) + "..."
                                  : borrower.legalOfficerRemarks}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td> */}

                          <td>
                            <TableTextCell
                              content={borrower.legalOfficerRemarks}
                              icon={MessageSquare}
                              iconColor="text-info"
                              type="remarks"
                            />
                          </td>
                          <td>{getStatusBadge(borrower)}</td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedBorrower(borrower);
                                setShowDetailsModal(true);
                              }}
                              className="btn btn-outline-info btn-sm"
                              style={{ borderRadius: "8px" }}
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
              <div className="card-footer bg-light">
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-primary">
                        {filteredData.length}
                      </div>
                      <div className="small text-muted">
                        {searchTerm ||
                        filterStatus !== "all" ||
                        filterDistrict !== "all"
                          ? "සෙවුම් ප්‍රතිඵල"
                          : "මුළු නඩු"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-warning">
                        {
                          filteredData.filter(
                            (b) => b.assignedLegalOfficerId && !b.judgmentResult
                          ).length
                        }
                      </div>
                      <div className="small text-muted">
                        නීති නිලධාරීන්ට පවරා ඇත
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-success">
                        {filteredData.filter((b) => b.judgmentResult).length}
                      </div>
                      <div className="small text-muted">නඩු තීන්දු ලබා ඇත</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="fs-4 fw-bold text-info">
                        {districts.length}
                      </div>
                      <div className="small text-muted">දිස්ත්‍රික්ක</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
                {/* Borrower Info */}
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

                {/* Payment History Table */}
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
                        <th className="fw-semibold">
                          <User size={14} className="me-1" />
                          එකතු කළ අය
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
                          <td>
                            <span className="badge bg-info">
                              {payment.addedBy}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Total Row */}
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
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="alert alert-info d-flex align-items-center mt-3">
                  <DollarSign size={18} className="me-2" />
                  <div>
                    <strong>මුළු ගෙවීම් ගණන:</strong>{" "}
                    {selectedPaymentHistory.payments.length} ගෙවීම්
                  </div>
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
                  {modalContent.icon && (
                    <modalContent.icon
                      size={18}
                      className={`me-2 ${modalContent.iconColor}`}
                    />
                  )}
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

      <AssignLegalOfficerModal />

      <BorrowerDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        borrower={selectedBorrower}
      />
    </div>
  );
};

export default ProvincialUnpaidCasesPage;
