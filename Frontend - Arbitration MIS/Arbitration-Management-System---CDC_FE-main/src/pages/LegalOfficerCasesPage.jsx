import React, { useState, useEffect } from "react";
import {
  Scale,
  Eye,
  AlertCircle,
  Save,
  Edit2,
  X,
  DollarSign,
  MessageSquare,
  Plus,
  Trash2,
  Calendar,
  User,
  FileText,
  Download,
  Clock,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";

const LegalOfficerCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Judgment Modal States
  const [showJudgmentModal, setShowJudgmentModal] = useState(false);
  const [selectedCaseForJudgment, setSelectedCaseForJudgment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [judgmentModalType, setJudgmentModalType] = useState("date"); // 'date' or 'result'
  const [newJudgmentEntry, setNewJudgmentEntry] = useState({
    hearingDate: new Date().toISOString().split("T")[0],
    judgmentResult: "",
    selectedJudgmentId: "", // For updating existing judgment
  });
  const [savingJudgment, setSavingJudgment] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [savingRemarks, setSavingRemarks] = useState(false);

  // Monthly Report States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [loadingReport, setLoadingReport] = useState(false);
  // Add these state variables after the existing useState declarations:

  const [editingBorrower, setEditingBorrower] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await api.getLegalOfficerAssignedCases();
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.legalAssignmentDate || 0);
        const dateB = new Date(b.legalAssignmentDate || 0);
        return dateB - dateA;
      });
      setCases(sortedData);
    } catch (err) {
      console.error("Error loading cases:", err);
      alert("නඩු පූරණය කිරීමේදී දෝෂයක් ඇති විය!");
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpand = (borrowerId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [borrowerId]: !prev[borrowerId],
    }));
  };

  // ==================== JUDGMENT NUMBER EDIT FUNCTIONS ====================

  const isEditing = (borrowerId, fieldType) => {
    return (
      editingBorrower?.borrowerId === borrowerId &&
      editingBorrower?.fieldType === fieldType
    );
  };

  const handleStartEdit = (caseData, fieldType) => {
    setEditingBorrower({
      borrowerId: caseData.borrowerId,
      fieldType: fieldType,
      submissionId: caseData.submissionId,
    });
    setEditValue(caseData.judgmentNumber || "");
  };

  const handleCancelEdit = () => {
    setEditingBorrower(null);
    setEditValue("");
  };

  const handleSaveField = async (caseData) => {
    if (!editValue.trim()) {
      alert("කරුණාකර අගයක් ඇතුළත් කරන්න");
      return;
    }

    try {
      // Use the dedicated updateJudgmentNumber endpoint
      await api.updateJudgmentNumber(
        caseData.submissionId,
        caseData.borrowerId,
        { judgmentNumber: editValue.trim() }
      );

      alert("සාර්ථකව යාවත්කාලීන කරන ලදී!");
      setEditingField(null);
      setEditValue("");

      // Reload cases to reflect the updated judgment number
      await loadCases();
    } catch (err) {
      console.error("❌ Error updating judgment number:", err);
      alert(err.message || "යාවත්කාලීන කිරීමේදී දෝෂයක් ඇති විය!");
    }
  };
  // ==================== JUDGMENT MANAGEMENT ====================

  const handleOpenJudgmentDateModal = (caseData) => {
    setSelectedCaseForJudgment(caseData);
    setJudgmentModalType("date");
    setNewJudgmentEntry({
      hearingDate: new Date().toISOString().split("T")[0],
      judgmentResult: "",
      selectedJudgmentId: "",
    });
    setShowJudgmentModal(true);
  };

  const handleOpenJudgmentResultModal = (caseData) => {
    setSelectedCaseForJudgment(caseData);
    setJudgmentModalType("result");

    // Find judgments without results
    const judgementsWithoutResult =
      caseData.judgments?.filter(
        (j) => !j.judgmentResult || j.judgmentResult.trim() === ""
      ) || [];
    const defaultJudgment =
      judgementsWithoutResult.length > 0 ? judgementsWithoutResult[0] : null;

    setNewJudgmentEntry({
      hearingDate:
        defaultJudgment?.judgmentDate || new Date().toISOString().split("T")[0],
      judgmentResult: "",
      selectedJudgmentId: defaultJudgment?.id || "",
    });
    setShowJudgmentModal(true);
  };

  const handleAddJudgmentEntry = async () => {
    if (judgmentModalType === "date" && !newJudgmentEntry.hearingDate) {
      alert("කරුණාකර නඩු දිනය ඇතුළත් කරන්න!");
      return;
    }

    if (judgmentModalType === "result") {
      if (!newJudgmentEntry.selectedJudgmentId) {
        alert("කරුණාකර නඩු දිනයක් තෝරන්න!");
        return;
      }
      if (
        !newJudgmentEntry.judgmentResult ||
        newJudgmentEntry.judgmentResult.trim() === ""
      ) {
        alert("කරුණාකර නඩු තීන්දුව ඇතුළත් කරන්න!");
        return;
      }
    }

    setSavingJudgment(true);
    try {
      if (judgmentModalType === "result") {
        // Update existing judgment with result
        const selectedJudgment = selectedCaseForJudgment.judgments.find(
          (j) => j.id === newJudgmentEntry.selectedJudgmentId
        );

        if (!selectedJudgment) {
          alert("නඩු දිනය සොයාගත නොහැක!");
          return;
        }

        const judgmentData = {
          judgmentDate: selectedJudgment.judgmentDate,
          judgmentNumber: selectedCaseForJudgment.judgmentNumber,
          judgmentResult: newJudgmentEntry.judgmentResult.trim(),
        };

        // Add new judgment entry with result
        await api.addJudgmentEntry(
          selectedCaseForJudgment.submissionId,
          selectedCaseForJudgment.borrowerId,
          judgmentData
        );

        // Delete the old judgment entry without result
        await api.deleteJudgmentEntry(
          selectedCaseForJudgment.submissionId,
          selectedCaseForJudgment.borrowerId,
          newJudgmentEntry.selectedJudgmentId
        );

        alert("නඩු තීන්දුව සාර්ථකව එකතු කරන ලදී!");
      } else {
        // Add new judgment date
        const judgmentData = {
          judgmentDate: newJudgmentEntry.hearingDate,
          judgmentNumber: selectedCaseForJudgment.judgmentNumber,
          judgmentResult: "",
        };

        await api.addJudgmentEntry(
          selectedCaseForJudgment.submissionId,
          selectedCaseForJudgment.borrowerId,
          judgmentData
        );

        alert("නඩු දිනය සාර්ථකව එකතු කරන ලදී!");
      }

      setShowJudgmentModal(false);
      await loadCases();
    } catch (err) {
      console.error("Error adding judgment:", err);
      alert(err.message || "නඩු එකතු කිරීමේදී දෝෂයක් ඇති විය!");
    } finally {
      setSavingJudgment(false);
    }
  };

  const handleDeleteJudgmentEntry = async (judgmentId) => {
    if (!confirm("ඔබට මෙම නඩු මකා දැමීමට අවශ්‍ය ද?")) {
      return;
    }

    try {
      await api.deleteJudgmentEntry(
        selectedCaseForJudgment.submissionId,
        selectedCaseForJudgment.borrowerId,
        judgmentId
      );

      alert("නඩු සාර්ථකව මකා දමන ලදී!");
      await loadCases();

      const updatedCase = cases.find(
        (c) => c.borrowerId === selectedCaseForJudgment.borrowerId
      );
      if (updatedCase) {
        setSelectedCaseForJudgment(updatedCase);
      }
    } catch (err) {
      console.error("Error deleting judgment:", err);
      alert(err.message || "නඩු මකා දැමීමේදී දෝෂයක් ඇති විය!");
    }
  };

  // ==================== PAYMENT MANAGEMENT ====================

  const handleOpenPaymentModal = (caseData) => {
    const latestJudgment = caseData.judgments && caseData.judgments.length > 0;
    if (!latestJudgment) {
      alert("මුලින්ම නඩු තීන්දුව එකතු කරන්න!");
      return;
    }
    setSelectedCase(caseData);
    setNewPayment({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
    });
    setShowPaymentModal(true);
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      alert("කරුණාකර වලංගු මුදලක් ඇතුළත් කරන්න!");
      return;
    }

    if (!newPayment.paymentDate) {
      alert("කරුණාකර ගෙවීම් දිනය ඇතුළත් කරන්න!");
      return;
    }

    setSaving(true);
    try {
      await api.addCourtPayment(
        selectedCase.submissionId,
        selectedCase.borrowerId,
        newPayment
      );

      alert("ගෙවීම සාර්ථකව එකතු කරන ලදී!");
      setShowPaymentModal(false);
      await loadCases();
    } catch (err) {
      console.error("Error adding payment:", err);
      alert(err.message || "ගෙවීම එකතු කිරීමේදී දෝෂයක් ඇති විය!");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm("ඔබට මෙම ගෙවීම මකා දැමීමට අවශ්‍ය ද?")) {
      return;
    }

    try {
      await api.deleteCourtPayment(
        selectedCase.submissionId,
        selectedCase.borrowerId,
        paymentId
      );

      alert("ගෙවීම සාර්ථකව මකා දමන ලදී!");
      await loadCases();

      const updatedCase = cases.find(
        (c) => c.borrowerId === selectedCase.borrowerId
      );
      if (updatedCase) {
        setSelectedCase(updatedCase);
      }
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert(err.message || "ගෙවීම මකා දැමීමේදී දෝෂයක් ඇති විය!");
    }
  };

  // ==================== REMARKS MANAGEMENT ====================

  const handleOpenRemarksModal = (caseData) => {
    setSelectedCase(caseData);
    setRemarks(caseData.legalOfficerRemarks || "");
    setShowRemarksModal(true);
  };

  const handleSaveRemarks = async () => {
    setSavingRemarks(true);
    try {
      await api.updateLegalRemarks(
        selectedCase.submissionId,
        selectedCase.borrowerId,
        { remarks }
      );

      alert("විශේෂ සටහන් සාර්ථකව සුරකින ලදී!");
      setShowRemarksModal(false);
      await loadCases();
    } catch (err) {
      console.error("Error saving remarks:", err);
      alert(err.message || "විශේෂ සටහන් සුරකින කිරීමේදී දෝෂයක් ඇති විය!");
    } finally {
      setSavingRemarks(false);
    }
  };

  // ==================== MONTHLY REPORT ====================

  const handleGenerateAndDownloadReport = async () => {
    setLoadingReport(true);
    try {
      // Get all payments for the selected month
      const allPayments = [];
      let courtName = ""; // To store the court name

      cases.forEach((caseData) => {
        if (caseData.courtPayments && caseData.courtPayments.length > 0) {
          caseData.courtPayments.forEach((payment) => {
            const paymentDate = new Date(payment.paymentDate);
            if (
              paymentDate.getFullYear() === reportYear &&
              paymentDate.getMonth() + 1 === reportMonth
            ) {
              allPayments.push({
                date: payment.paymentDate,
                borrowerName: caseData.borrowerName,
                judgmentNumber:
                  caseData.judgmentNumber || caseData.arbitrationNumber,
                societyName: caseData.societyName,
                amount: parseFloat(payment.amount),
              });

              // Set court name from the first payment (all payments should be from same court)
              if (!courtName && caseData.assignedCourtName) {
                courtName = caseData.assignedCourtName;
              }
            }
          });
        }
      });

      // Sort by date
      allPayments.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Generate CSV content matching the sample format
      const monthNames = [
        "ජනවාරි",
        "පෙබරවාරි",
        "මාර්තු",
        "අප්‍රේල්",
        "මැයි",
        "ජූනි",
        "ජූලි",
        "අගෝස්තු",
        "සැප්තැම්බර්",
        "ඔක්තෝබර්",
        "නොවැම්බර්",
        "දෙසැම්බර්",
      ];

      let csvContent = `මාසික ගෙවීම් වාර්තාව\n`;

      // Add court name at the top
      if (courtName) {
        csvContent += `උසාවිය: ${courtName}\n`;
      }

      csvContent += `වර්ෂය: ${reportYear} | මාසය: ${
        monthNames[reportMonth - 1]
      }\n`;
      csvContent += `${reportYear}.${String(reportMonth).padStart(
        2,
        "0"
      )}.01 සිට ${reportYear}.${String(reportMonth).padStart(
        2,
        "0"
      )}.28 දක්වා\n\n`;
      csvContent += `අ.න,දිනය,නඩු අංකය,ණයගැතියා,සමිතිය,මුදල (රු.)\n`;

      let totalAmount = 0;
      allPayments.forEach((payment, index) => {
        const formattedDate = `${reportYear}.${String(reportMonth).padStart(
          2,
          "0"
        )}.${String(new Date(payment.date).getDate()).padStart(2, "0")}`;
        csvContent += `${index + 1},${formattedDate},${
          payment.judgmentNumber
        },${payment.borrowerName},${
          payment.societyName
        },${payment.amount.toFixed(2)}\n`;
        totalAmount += payment.amount;
      });

      csvContent += `\n,,,,,\n`;
      csvContent += `,,,,මුළු එකතුව:,${totalAmount.toFixed(2)}\n`;

      // Create and download blob with UTF-8 BOM for proper Sinhala character encoding
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payment-report-${reportYear}-${String(reportMonth).padStart(
          2,
          "0"
        )}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`වාර්තාව සාර්ථකව බාගත කරන ලදී! (${allPayments.length} ගෙවීම්)`);
      setShowReportModal(false);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("වාර්තාව ජනනය කිරීමේදී දෝෂයක් ඇති විය!");
    } finally {
      setLoadingReport(false);
    }
  };
  // ==================== HELPER FUNCTIONS ====================

  const getTotalPaid = (payments) => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const getLatestJudgment = (judgments) => {
    if (!judgments || judgments.length === 0) return null;
    return judgments.reduce((latest, current) =>
      new Date(current.judgmentDate) > new Date(latest.judgmentDate)
        ? current
        : latest
    );
  };

  const formatSinhalaDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("si-LK");
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">දත්ත පූරණය වෙමින්...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          නීතිමය ක්‍රියාවලිය සදහා පැවරී ඇති ණයගැතියන්
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowReportModal(true)}
          style={{ borderRadius: "10px" }}
        >
          <FileText size={18} className="me-2" />
          මාසික වාර්තාව
        </button>
      </div>

      <div
        className="alert alert-info d-flex align-items-center mb-4"
        style={{ borderRadius: "10px" }}
      >
        <Scale size={18} className="me-2" />
        ඔබට නීතිමය ක්‍රියාවලිය සදහා පැවරී ඇති ණයගැතියන් සඳහා නඩු තොරතුරු, ගෙවීම්
        තත්වය සහ විශේෂ සටහන් එකතු කරන්න
      </div>

      {cases.length === 0 ? (
        <div
          className="alert alert-warning d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          ඔබට තවම නඩු පවරා නැත
        </div>
      ) : (
        <div
          className="card shadow-sm border-0"
          style={{ borderRadius: "15px" }}
        >
          <div className="table-responsive">
            <table
              className="table table-hover mb-0"
              style={{ fontSize: "12px" }}
            >
              <thead
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "11px",
                }}
                className="text-white"
              >
                <tr>
                  <th className="fw-semibold">පැවරූ දිනය</th>
                  <th className="fw-semibold">තීරක අංකය</th>
                  <th className="fw-semibold">ණයගැතියා</th>
                  <th className="fw-semibold">සමිතිය</th>
                  <th className="fw-semibold">ණය මුදල</th>
                  <th className="fw-semibold">උසාවිය</th>
                  <th className="fw-semibold"> නඩු දිනය</th>
                  <th className="fw-semibold"> නඩු අංකය</th>
                  <th className="fw-semibold"> නඩු ප්‍රතිඵලය</th>
                  <th className="fw-semibold">ගෙවීම් තත්වය</th>
                  <th className="fw-semibold">විශේෂ සටහන්</th>
                  <th className="fw-semibold">විස්තර</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseData) => {
                  const totalPaid = getTotalPaid(caseData.courtPayments);
                  const paymentCount = caseData.courtPayments?.length || 0;
                  const latestJudgment = getLatestJudgment(caseData.judgments);
                  const judgmentCount = caseData.judgments?.length || 0;
                  const isExpanded = expandedRows[caseData.borrowerId];

                  return (
                    <React.Fragment key={caseData.borrowerId}>
                      <tr>
                        <td className="text-muted">
                          {caseData.legalAssignmentDate
                            ? formatSinhalaDate(caseData.legalAssignmentDate)
                            : "-"}
                        </td>
                        <td className="fw-bold text-primary">
                          {caseData.arbitrationNumber}
                        </td>
                        <td>
                          <strong>{caseData.borrowerName}</strong>
                        </td>
                        <td>{caseData.societyName}</td>
                        <td>
                          රු.{" "}
                          {parseFloat(caseData.loanAmount).toLocaleString(
                            "si-LK"
                          )}
                        </td>
                        <td>{caseData.assignedCourtName || "-"}</td>

                        {/* Judgment Date Column */}
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <button
                              onClick={() =>
                                handleOpenJudgmentDateModal(caseData)
                              }
                              className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                              style={{
                                borderRadius: "5px",
                                fontSize: "11px",
                                padding: "4px 8px",
                              }}
                            >
                              <Edit2 size={11} className="me-1" />
                            </button>
                            {latestJudgment && (
                              <div className="text-center">
                                <div
                                  className="badge bg-success"
                                  style={{ fontSize: "10px" }}
                                >
                                  {formatSinhalaDate(
                                    latestJudgment.judgmentDate
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Case Number */}
                        <td>
                          {isEditing(caseData.borrowerId, "number") ? (
                            <div className="d-flex gap-1 align-items-center">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="නඩු අංකය"
                                style={{ borderRadius: "5px", width: "120px" }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveField(caseData)}
                                className="btn btn-success btn-sm"
                                style={{ borderRadius: "5px" }}
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="btn btn-secondary btn-sm"
                                style={{ borderRadius: "5px" }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              {caseData.judgmentNumber ? (
                                <span className="badge bg-success">
                                  {caseData.judgmentNumber}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                              <button
                                onClick={() =>
                                  handleStartEdit(caseData, "number")
                                }
                                className="btn btn-outline-primary btn-sm"
                                style={{
                                  borderRadius: "5px",
                                  fontSize: "11px",
                                }}
                              >
                                <Edit2 size={10} />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Judgment Result Column */}
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <button
                              onClick={() =>
                                handleOpenJudgmentResultModal(caseData)
                              }
                              className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                              style={{
                                borderRadius: "5px",
                                fontSize: "11px",
                                padding: "4px 8px",
                              }}
                            >
                              <Edit2 size={11} className="me-1" />
                            </button>
                            {latestJudgment && (
                              <div
                                className="text-center"
                                style={{ maxWidth: "200px" }}
                              >
                                <div
                                  className="small text-dark mb-1"
                                  style={{ fontSize: "10px" }}
                                >
                                  {latestJudgment.judgmentResult || "-"}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <button
                              onClick={() => handleOpenPaymentModal(caseData)}
                              className="btn btn-sm btn-success"
                              style={{
                                borderRadius: "5px",
                                fontSize: "8px",
                              }}
                              disabled={!latestJudgment}
                              title={
                                !latestJudgment
                                  ? "මුලින්ම නඩු නඩුව එකතු කරන්න"
                                  : ""
                              }
                            >
                              <Plus size={10} className="me-1" />
                              කළමනාකරණය
                            </button>
                            {paymentCount > 0 && (
                              <div className="small text-center">
                                <div className="text-success fw-semibold">
                                  රු. {totalPaid.toLocaleString("si-LK")}
                                </div>
                                <div
                                  style={{ fontSize: "8px" }}
                                  className="text-muted"
                                >
                                  ({paymentCount} ගෙවීම්)
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Remarks */}
                        <td>
                          <button
                            onClick={() => handleOpenRemarksModal(caseData)}
                            className={`btn btn-sm ${
                              caseData.legalOfficerRemarks
                                ? "btn-info"
                                : "btn-outline-secondary"
                            }`}
                            style={{ borderRadius: "5px", fontSize: "11px" }}
                          >
                            <MessageSquare size={12} className="me-1" />
                            {caseData.legalOfficerRemarks ? "සංස්කරණය" : "එකතු"}
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedBorrower(caseData);
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
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== JUDGMENT MODAL (DATE OR RESULT) ==================== */}
      {showJudgmentModal && selectedCaseForJudgment && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div
                className="modal-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <Scale size={20} className="me-2" />
                  {judgmentModalType === "date"
                    ? "නඩු දිනය එකතු කරන්න"
                    : "නඩු තීන්දුව එකතු කරන්න"}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowJudgmentModal(false)}
                  disabled={savingJudgment}
                />
              </div>
              <div className="modal-body p-4">
                {/* Case Info */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">
                        තීරක අංකය
                      </small>
                      <strong className="text-primary fs-5">
                        {selectedCaseForJudgment.arbitrationNumber}
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">
                        ණයගැතියා
                      </small>
                      <strong className="fs-5">
                        {selectedCaseForJudgment.borrowerName}
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">
                        නඩු අංකය
                      </small>
                      <strong className="fs-5">
                        {selectedCaseForJudgment.judgmentNumber}
                      </strong>
                    </div>
                  </div>
                </div>
                {/* Existing Judgments */}
                {selectedCaseForJudgment.judgments &&
                  selectedCaseForJudgment.judgments.length > 0 && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">
                          <History size={18} className="me-2" />
                          පවතින නඩු
                        </h6>
                        <span className="badge bg-primary">
                          {selectedCaseForJudgment.judgments.length} නඩු
                        </span>
                      </div>

                      <div
                        className="table-responsive"
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        <table className="table table-bordered table-hover mb-0">
                          <thead
                            style={{
                              background: "#f8f9fa",
                              position: "sticky",
                              top: 0,
                            }}
                          >
                            <tr>
                              <th style={{ fontSize: "12px" }}>#</th>
                              <th style={{ fontSize: "12px" }}>දිනය</th>
                              <th style={{ fontSize: "12px" }}>නඩු තීන්දුව</th>
                              <th style={{ fontSize: "12px" }}>එකතු කළ අය</th>
                              <th style={{ fontSize: "12px" }}>එකතු කළ දිනය</th>
                              <th
                                style={{ fontSize: "12px" }}
                                className="text-center"
                              >
                                ක්‍රියාව
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCaseForJudgment.judgments.map(
                              (judgment, index) => (
                                <tr key={judgment.id}>
                                  <td style={{ fontSize: "12px" }}>
                                    {index + 1}
                                  </td>
                                  <td style={{ fontSize: "12px" }}>
                                    {new Date(
                                      judgment.judgmentDate
                                    ).toLocaleDateString("si-LK")}
                                  </td>
                                  <td
                                    style={{
                                      fontSize: "11px",
                                      maxWidth: "200px",
                                    }}
                                  >
                                    {judgment.judgmentResult || "-"}
                                  </td>
                                  <td style={{ fontSize: "11px" }}>
                                    <span className="badge bg-secondary">
                                      {judgment.addedBy}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: "11px" }}>
                                    {new Date(judgment.addedAt).toLocaleString(
                                      "si-LK"
                                    )}
                                  </td>
                                  <td className="text-center">
                                    <button
                                      onClick={() =>
                                        handleDeleteJudgmentEntry(judgment.id)
                                      }
                                      className="btn btn-sm btn-outline-danger"
                                      style={{
                                        borderRadius: "5px",
                                        padding: "2px 6px",
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                <hr className="my-4" />

                {/* Add New Entry Form */}
                <h6 className="fw-bold mb-3">
                  <Plus size={18} className="me-2" />
                  {judgmentModalType === "date"
                    ? "නඩු දිනය ඇතුළත් කරන්න"
                    : "නඩු තීන්දුව ඇතුළත් කරන්න"}
                </h6>

                <div className="row">
                  {judgmentModalType === "date" ? (
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">
                        නඩු දිනය *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={newJudgmentEntry.hearingDate}
                        onChange={(e) =>
                          setNewJudgmentEntry({
                            ...newJudgmentEntry,
                            hearingDate: e.target.value,
                          })
                        }
                        style={{ borderRadius: "10px" }}
                        disabled={savingJudgment}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold">
                          නඩු දිනය තෝරන්න *
                        </label>
                        <select
                          className="form-control"
                          value={newJudgmentEntry.selectedJudgmentId}
                          onChange={(e) =>
                            setNewJudgmentEntry({
                              ...newJudgmentEntry,
                              selectedJudgmentId: e.target.value,
                            })
                          }
                          style={{ borderRadius: "10px" }}
                          disabled={savingJudgment}
                        >
                          <option value="">නඩු දිනයක් තෝරන්න</option>
                          {selectedCaseForJudgment.judgments
                            ?.filter(
                              (j) =>
                                !j.judgmentResult ||
                                j.judgmentResult.trim() === ""
                            )
                            .map((judgment) => (
                              <option key={judgment.id} value={judgment.id}>
                                {formatSinhalaDate(judgment.judgmentDate)}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold">
                          නඩු තීන්දුව *
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={newJudgmentEntry.judgmentResult}
                          onChange={(e) =>
                            setNewJudgmentEntry({
                              ...newJudgmentEntry,
                              judgmentResult: e.target.value,
                            })
                          }
                          placeholder="නඩු තීන්දුව විස්තර කරන්න"
                          style={{ borderRadius: "10px" }}
                          disabled={savingJudgment}
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleAddJudgmentEntry}
                  style={{ borderRadius: "10px" }}
                  disabled={savingJudgment}
                >
                  {savingJudgment ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      එකතු කරමින්...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2" />
                      නඩු එකතු කරන්න
                    </>
                  )}
                </button>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowJudgmentModal(false)}
                  style={{ borderRadius: "10px" }}
                  disabled={savingJudgment}
                >
                  වසන්න
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAYMENT MODAL ==================== */}
      {showPaymentModal && selectedCase && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
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
                  උසාවි ගෙවීම් කළමනාකරණය
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={saving}
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
                      <strong className="text-primary fs-5">
                        {selectedCase.arbitrationNumber}
                      </strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted d-block mb-1">
                        ණයගැතියා
                      </small>
                      <strong className="fs-5">
                        {selectedCase.borrowerName}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                {selectedCase.courtPayments &&
                  selectedCase.courtPayments.length > 0 && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">
                          <DollarSign size={18} className="me-2" />
                          පවතින ගෙවීම් ඉතිහාසය
                        </h6>
                        <span className="badge bg-success">
                          {selectedCase.courtPayments.length} ගෙවීම්
                        </span>
                      </div>

                      <div
                        className="table-responsive"
                        style={{ maxHeight: "250px", overflowY: "auto" }}
                      >
                        <table className="table table-sm table-hover table-bordered mb-0">
                          <thead
                            style={{
                              background: "#f8f9fa",
                              position: "sticky",
                              top: 0,
                            }}
                          >
                            <tr>
                              <th
                                className="fw-semibold"
                                style={{ fontSize: "12px" }}
                              >
                                #
                              </th>
                              <th
                                className="fw-semibold"
                                style={{ fontSize: "12px" }}
                              >
                                <Calendar size={12} className="me-1" />
                                දිනය
                              </th>
                              <th
                                className="fw-semibold text-end"
                                style={{ fontSize: "12px" }}
                              >
                                මුදල (රු.)
                              </th>
                              <th
                                className="fw-semibold"
                                style={{ fontSize: "12px" }}
                              >
                                <User size={12} className="me-1" />
                                එකතු කළ අය
                              </th>
                              <th
                                className="fw-semibold text-center"
                                style={{ fontSize: "12px" }}
                              >
                                ක්‍රියාව
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCase.courtPayments.map(
                              (payment, index) => (
                                <tr key={payment.id || index}>
                                  <td
                                    className="text-center"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td style={{ fontSize: "12px" }}>
                                    {new Date(
                                      payment.paymentDate
                                    ).toLocaleDateString("si-LK", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </td>
                                  <td
                                    className="text-end fw-semibold text-success"
                                    style={{ fontSize: "12px" }}
                                  >
                                    රු.{" "}
                                    {parseFloat(payment.amount).toLocaleString(
                                      "si-LK"
                                    )}
                                  </td>
                                  <td style={{ fontSize: "11px" }}>
                                    <span className="badge bg-info">
                                      {payment.addedBy}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <button
                                      onClick={() =>
                                        handleDeletePayment(payment.id)
                                      }
                                      className="btn btn-sm btn-outline-danger"
                                      style={{
                                        borderRadius: "5px",
                                        padding: "2px 6px",
                                      }}
                                      disabled={saving}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                          <tfoot style={{ background: "#d1fae5" }}>
                            <tr>
                              <td
                                colSpan="2"
                                className="text-end fw-bold"
                                style={{ fontSize: "13px" }}
                              >
                                මුළු ගෙවූ මුදල:
                              </td>
                              <td
                                className="text-end fw-bold text-success"
                                style={{ fontSize: "14px" }}
                              >
                                රු.{" "}
                                {getTotalPaid(
                                  selectedCase.courtPayments
                                ).toLocaleString("si-LK")}
                              </td>
                              <td colSpan="2"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                <hr className="my-4" />

                {/* Add New Payment */}
                <h6 className="fw-bold mb-3">
                  <Plus size={18} className="me-2" />
                  නව ගෙවීමක් එකතු කරන්න
                </h6>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      ගෙවූ මුදල (රු.) *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={newPayment.amount}
                      onChange={(e) =>
                        setNewPayment({ ...newPayment, amount: e.target.value })
                      }
                      style={{ borderRadius: "10px" }}
                      disabled={saving}
                      min="0"
                      step="0.01"
                      placeholder="මුදල ඇතුළත් කරන්න"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      ගෙවීම් දිනය *
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={newPayment.paymentDate}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          paymentDate: e.target.value,
                        })
                      }
                      style={{ borderRadius: "10px" }}
                      disabled={saving}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-success w-100"
                  onClick={handleAddPayment}
                  style={{ borderRadius: "10px" }}
                  disabled={
                    saving || !newPayment.amount || !newPayment.paymentDate
                  }
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      එකතු කරමින්...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="me-2" />
                      ගෙවීම එකතු කරන්න
                    </>
                  )}
                </button>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                  style={{ borderRadius: "10px" }}
                  disabled={saving}
                >
                  වසන්න
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== REMARKS MODAL ==================== */}
      {showRemarksModal && selectedCase && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div
                className="modal-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">විශේෂ සටහන්</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowRemarksModal(false)}
                  disabled={savingRemarks}
                />
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <strong>තීරක අංකය:</strong>{" "}
                  <span className="text-primary">
                    {selectedCase.arbitrationNumber}
                  </span>
                </div>
                <div className="mb-3">
                  <strong>ණයගැතියා:</strong> {selectedCase.borrowerName}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    නීති නිලධාරී විශේෂ සටහන්
                  </label>
                  <textarea
                    className="form-control"
                    rows="6"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="නඩුව සම්බන්ධ විශේෂ තොරතුරු හෝ සටහන් මෙහි ඇතුළත් කරන්න..."
                    style={{ borderRadius: "10px" }}
                    disabled={savingRemarks}
                  />
                </div>

                {selectedCase.remarksAddedAt && (
                  <div className="alert alert-info">
                    <small>
                      අවසන් යාවත්කාලීන කිරීම:{" "}
                      {new Date(selectedCase.remarksAddedAt).toLocaleString(
                        "si-LK"
                      )}
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRemarksModal(false)}
                  style={{ borderRadius: "10px" }}
                  disabled={savingRemarks}
                >
                  අවලංගු
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveRemarks}
                  style={{ borderRadius: "10px" }}
                  disabled={savingRemarks}
                >
                  {savingRemarks ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      සුරකිමින්...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2" />
                      සුරකින්න
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BorrowerDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        borrower={selectedBorrower}
      />

      {/* ==================== MONTHLY REPORT MODAL ==================== */}
      {showReportModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div
                className="modal-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <FileText size={20} className="me-2" />
                  මාසික ගෙවීම් වාර්තාව
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowReportModal(false)}
                  disabled={loadingReport}
                />
              </div>
              <div className="modal-body p-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">වසර *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={reportYear}
                      onChange={(e) => setReportYear(parseInt(e.target.value))}
                      style={{ borderRadius: "10px" }}
                      disabled={loadingReport}
                      min="2020"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">මාසය *</label>
                    <select
                      className="form-control"
                      value={reportMonth}
                      onChange={(e) => setReportMonth(parseInt(e.target.value))}
                      style={{ borderRadius: "10px" }}
                      disabled={loadingReport}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                        <option key={month} value={month}>
                          {new Date(2024, month - 1).toLocaleDateString(
                            "si-LK",
                            {
                              month: "long",
                            }
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                  style={{ borderRadius: "10px" }}
                  disabled={loadingReport}
                >
                  අවලංගු
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateAndDownloadReport}
                  style={{ borderRadius: "10px" }}
                  disabled={loadingReport}
                >
                  {loadingReport ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      ජනනය කරමින්...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="me-2" />
                      බාගත කරන්න
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalOfficerCasesPage;
