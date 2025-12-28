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
  DollarSign,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";

const DistrictUnpaidCasesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
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
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
    icon: null,
  });

  useEffect(() => {
    loadPaymentPendingCases();
    loadHistory();
    loadLegalOfficers();
    loadCourts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, historyData]);

  const loadPaymentPendingCases = async () => {
    try {
      if (!user.district) {
        console.error("❌ No district found!");
        return;
      }

      const data = await api.getPaymentPendingCases(user.district);
      setPaymentPendingCases(data);
      console.log("✅ Payment pending cases loaded:", data.length);
    } catch (err) {
      console.error("❌ Error loading payment pending cases:", err);
      try {
        console.log("📝 Trying alternate method...");
        const submissions = await api.getSubmissionsByDistrict(user.district);
        const pendingCases = [];

        submissions.forEach((submission) => {
          submission.borrowers.forEach((borrower) => {
            if (
              borrower.status === "payment-pending" &&
              borrower.approvedForDistrict === true
            ) {
              pendingCases.push({
                ...borrower,
                submissionId: submission.id,
                societyName: submission.societyName,
                districtName: submission.districtName,
              });
            }
          });
        });

        setPaymentPendingCases(pendingCases);
        console.log(
          "✅ Payment pending cases loaded (alternate):",
          pendingCases.length
        );
      } catch (alternateErr) {
        console.error("❌ Alternate method also failed:", alternateErr);
      }
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
          maxWidth: type === "judgment" ? "190px" : "250px",
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

  const loadHistory = async () => {
    try {
      if (!user.district) return;

      const submissions = await api.getSubmissionsByDistrict(user.district);
      const history = [];

      submissions.forEach((submission) => {
        submission.borrowers.forEach((borrower) => {
          if (borrower.approvedForDistrict === true) {
            history.push({
              ...borrower,
              submissionId: submission.id,
              societyName: submission.societyName,
              districtName: submission.districtName,
              submittedDate: submission.submittedDate,
            });
          }
        });
      });

      history.sort((a, b) => {
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

      setHistoryData(history);
      console.log("✅ District legal cases history loaded:", history.length);
    } catch (err) {
      console.error("❌ Error loading history:", err);
    }
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

  const generateLetter = (caseData) => {
    const currentDate = new Date().toLocaleDateString("en-GB");

    const loanAmount = parseFloat(
      caseData.proposedLoanBalance || caseData.outstandingLoanAmount || 0
    );
    const interest = parseFloat(
      caseData.proposedLoanInterest || caseData.interest || 0
    );
    const stationeryFees = parseFloat(caseData.stationeryFees || 0);
    const deductLoan = parseFloat(caseData.deductionsFromLoanAmount || 0);
    const deductInterest = parseFloat(
      caseData.deductionsFromInterestAmount || 0
    );
    const courtCharges = parseFloat(caseData.courtCharges || 0);
    const rebateDeductions = parseFloat(caseData.rebateDeductions || 0);
    const bondAndInterest = parseFloat(caseData.bondAndInterest || 0);
    const otherRebate = parseFloat(caseData.otherRebateDeductions || 0);
    const totalDeductions =
      deductLoan +
      deductInterest +
      courtCharges +
      rebateDeductions +
      bondAndInterest +
      otherRebate;
    const subtotal = loanAmount + interest + stationeryFees;
    const forwardInterest = parseFloat(caseData.forwardInterest || 0);
    const remainingAmount = subtotal - totalDeductions;
    const totalClaim = remainingAmount + forwardInterest;

    const letterHTML = `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0.5in 0.6in; }
    body { font-family: 'FM Abhaya', 'Noto Sans Sinhala', Arial, sans-serif; font-size: 9pt; line-height: 1.3; margin: 0; padding: 0; }
    .header-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 9pt; }
    .title { text-align: center; font-weight: bold; margin: 10px 0 12px 0; font-size: 10pt; text-decoration: underline; }
    .content { text-align: justify; margin: 6px 0; font-size: 9pt; line-height: 1.35; }
    .section-header { text-align: center; font-weight: bold; margin: 2px 0 2px 0; font-size: 9pt; }
    .financial-table { width: 100%; margin: 2px 0; border-collapse: collapse; font-size: 9pt; }
    .financial-table td { padding: 0px 4px; border: none; line-height: 1.05; }
    .financial-table .label { width: 60%; text-align: left; }
    .financial-table .currency { width: 10%; text-align: left; }
    .financial-table .value { width: 30%; border-bottom: 1px dotted #666; text-align: right; }
    .total-row { font-weight: bold; border-top: 1px solid #000; }
    .guarantor-list { margin: 8px 0 8px 20px; font-size: 9pt; line-height: 1.4; }
    .guarantor-item { margin: 4px 0; }
    .signature-section { margin-top: 20px; font-size: 9pt; }
    .signature-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 10px; }
    .copies-section { margin-top: 15px; font-size: 8.5pt; line-height: 1.3; }
    .copies-section p { margin: 2px 0; }
    p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="header-row">
    <div>තීරක අංකය: ${
      caseData.arbitrationNumber || "..................................."
    }</div>
    <div>නඩු අංකය: ${
      caseData.judgmentNumber ||
      ".................................................."
    }</div>
  </div>
  <div class="content">
    <p>1993අංක 04 දරණ සමුපකාර සමිති (සංශෝධිත) ප්‍රඥ්ප්තියෙන් සංශෝධිත මධ්‍යම පළාත් සභාවේ 1990 අංක 10 දරණ සමුපකාර සමිති ප්‍රඥ්ප්තියෙන් 59 (1) ඇ වගන්තිය යටතේ නිකුත් කරනු ලබන</p>
  </div>
  <div class="title">තීරක තීන්දු සහතිකය</div>
  <div class="content">
    <p>${
      caseData.assignedCourtName || "....................."
    } මහෙස්ත්‍රාත්තුමා වෙතටයි,</p>
    <p>1993අංක 04 දරණ සමුපකාර සමිති (සංශෝධිත) ප්‍රඥ්ප්තියෙන් සංශෝධිත මධ්‍යම පළාත් සභාවේ 1990 අංක 10 දරණ සමුපකාර සමිති ප්‍රඥ්ප්තියෙන් 59 (1) ඇ වගන්තියෙන් මධ්‍යම පළාත් සභාවේ සමිති රෙජිස්ටාර් වෙත පැවරුණු බලතල අනුව හා අංක 2258/55 හා ${
      caseData.legalAssignmentDate
        ? new Date(caseData.legalAssignmentDate).toLocaleDateString("en-GB")
        : "......................."
    } දිනැති ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රීක සමාජවාදී ජනරජයේ ගැසට් පත්‍රයේ සඳහන් නිවේදනයෙන් සමුපකාර සංවර්ධන සහකාර කොමසාරිස් / නියෝජ්‍ය කොමසාරිස් ${
      caseData.user?.name || "................................."
    } වන ම වෙත පැවරී ඇති බලතල ප්‍රකාරව මෙසේ සහතික කරමි. ඉහත කී සමුපකාර සමිති ප්‍රඥ්ප්තිය යටතේ ${
      caseData.decisionDate
        ? new Date(caseData.decisionDate).toLocaleDateString("en-GB")
        : "................................."
    } වෙනි දින ලබා දී ඇත්තා වූ ද, මීට අමුණා ඇති තීරක තීන්දුව අනුව</p>
  </div>
  <table class="financial-table">
    <tr><td class="label">මුල් මුදල</td><td class="currency">රු :</td><td class="value">${loanAmount.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr><td class="label">පොළිය</td><td class="currency">රු :</td><td class="value">${interest.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr><td class="label">බේරුම්කරණ වියදම්</td><td class="currency">රු :</td><td class="value">${stationeryFees.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr class="total-row"><td class="label">එකතුව</td><td class="currency">රු:</td><td class="value">${subtotal.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
  </table>
  <div class="section-header">අඩුකිරීම්</div>
  <table class="financial-table">
    <tr><td class="label">මුල් මුදලින්</td><td class="currency">රු :</td><td class="value">${deductLoan.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr><td class="label">පොළිය</td><td class="currency">රු :</td><td class="value">${deductInterest.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr><td class="label">නඩු ගාස්තු</td><td class="currency">රු :</td><td class="value">${courtCharges.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr><td class="label">හිලව් කිරීම්</td><td class="currency">රු :</td><td class="value">${rebateDeductions.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr><td class="label">ඇප හා පොළිය</td><td class="currency">රු :</td><td class="value">${bondAndInterest.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr><td class="label">වෙනත් හිලව් කිරීම්</td><td class="currency">රු :</td><td class="value">${otherRebate.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr class="total-row"><td class="label">එකතුව</td><td class="currency">රු :</td><td class="value">${totalDeductions.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
  </table>
  <table class="financial-table" style="margin-top: 2px;">
    <tr><td class="label">${
      caseData.decisionDate
        ? new Date(caseData.decisionDate).toLocaleDateString("en-GB")
        : "................"
    } දින සිට ${currentDate} දින දක්වා මුල් මුදලට ${
      caseData.forwardInterestRate || "..."
    }% බැගින් පොළිය</td><td class="currency">රු :</td><td class="value">${forwardInterest.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
    <tr class="total-row"><td class="label">අයවීමට ඇති මුදල</td><td class="currency">රු :</td><td class="value">${totalClaim.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}</td></tr>
  </table>
  <div class="content" style="margin-top: 6px;">
    <p>එකී මුදල පහත සඳහන් විත්තිකරුවන්ගෙන් අයවීමට ඇත.</p>
  </div>
  <table style="width: 100%; margin: 8px 0; border-collapse: collapse; font-size: 9pt;">
    <tr>
      <td style="width: 48%; vertical-align: top; padding-right: 20px;">
        <div style="margin-bottom: 5px;"><strong>විත්තිකරු</strong></div>
        <div style="margin: 3px 0;">1. ${
          caseData.guarantor1Name || "................................."
        }</div>
        <div style="margin: 3px 0;">2. ${
          caseData.guarantor2Name || "................................."
        }</div>
        <div style="margin: 3px 0;">3. ${
          caseData.borrowerName || "................................."
        }</div>
      </td>
      <td style="width: 52%; vertical-align: top; padding-left: 20px;">
        <div style="margin-bottom: 5px;"><strong>පදිංචි ලිපිනය</strong></div>
        <div style="margin: 3px 0;">${
          caseData.guarantor1Address || "................................."
        }</div>
        <div style="margin: 3px 0;">${
          caseData.guarantor2Address || "................................."
        }</div>
        <div style="margin: 3px 0;">${
          caseData.borrowerAddress || "................................."
        }</div>
      </td>
    </tr>
  </table>
  <div class="content" style="margin-top: 12px;">
    <p>මෙම අයවිය යුතු මුදලින් කිසිවක් ගෙවා නොමැති බැවින් ඉහත සඳහන් ප්‍රඥප්තියේ 59(4) වගන්තිය අනුව එකී මුදල් අයකර ම වෙත එවන මෙන් ඉල්ලමි.</p>
  </div>
  <div class="signature-section">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="width: 35%; vertical-align: top;">
          <p>...................................</p>
          <p>දිනය</p>
        </td>
        <td style="width: 65%; vertical-align: top; text-align: center;">
          <p>...................................</p>
          <p>සමුපකාර සංවර්ධන සහකාර කොමසාරිස් / නියෝජ්‍ය කොමසාරිස්</p>
          <p style="margin-top: 5px;">මධ්‍යම පළාත</p>
        </td>
      </tr>
    </table>
  </div>
  <div class="copies-section">
    <p><strong>පිටපත් විත්තිකරුවන්ට ප්‍රඥප්තියේ 59(4) වගන්තිය යටතේ,</strong></p>
    <p>1. ${caseData.guarantor1Name || "..........."}</p>
    <p>2. ${caseData.guarantor2Name || "..........."}</p>
    <p>3. ${caseData.borrowerName || "................"}</p>
    <br/>
    <p><strong>පැමිණිලිකරු</strong></p>
    <p>1. ${caseData.societyName || "society name"}</p>
    <p>2. උසාවි නිලධාරි</p>
    <p>3. කාර්යාල පිටපත</p>
  </div>
</body>
</html>`;

    const blob = new Blob(["\ufeff", letterHTML], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `තීරක_තීන්දු_සහතිකය_${
      caseData.arbitrationNumber || "document"
    }.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(letterHTML);
    printWindow.document.close();

    alert("තීරක තීන්දු සහතිකය Word ලියවිල්ලක් ලෙස බාගත වේ");
  };

  const loadLegalOfficers = async () => {
    try {
      const data = await api.getLegalOfficersByDistrict(user.district);
      setLegalOfficers(data);
    } catch (err) {
      console.error("❌ Error loading legal officers:", err);
    }
  };

  const loadCourts = async () => {
    try {
      const data = await api.getCourtsByDistrict(user.district);
      setCourts(data);
    } catch (err) {
      console.error("❌ Error loading courts:", err);
    }
  };

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
          borrower.societyName?.toLowerCase().includes(search)
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
      alert("කරුණාකර උසාවි නිලධාරියා	 සහ උසාවිය තෝරන්න!");
      return;
    }

    if (
      !window.confirm("තෝරාගත් උසාවි නිලධාරියා	 සහ උසාවිය මෙම නඩුවට පවරන්න?")
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
      loadPaymentPendingCases();
      loadHistory();
    } catch (err) {
      console.error("❌ Error assigning legal officer:", err);
      alert("උසාවි නිලධාරියා	 පැවරීමේදී දෝෂයක් ඇති විය!");
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (borrower) => {
    if (borrower.judgmentResult) {
      return (
        <span
          className="badge  d-flex align-items-center justify-content-center"
          style={{
            whiteSpace: "normal",
            lineHeight: "1.1",
            minWidth: "80px",
            fontSize: "10px !important",
            background: "linear-gradient(135deg, #24af7c 0%, #6cd6a3 100%)",
            padding: "4px 6px",
          }}
        >
          <Gavel size={10} className="me-1 flex-shrink-0" />
          <span style={{ fontSize: "10px" }}>
            නඩු තීන්දුව
            <br />
            ලබා දී ඇත
          </span>
        </span>
      );
    } else if (borrower.assignedLegalOfficerId) {
      return (
        <span
          className="badge d-flex align-items-center justify-content-center"
          style={{
            whiteSpace: "normal",
            lineHeight: "1.1",
            minWidth: "100px",
            fontSize: "10px !important",
            background: "linear-gradient(135deg, #bcae17 0%, #f0f47d 100%)",
            padding: "4px 6px",
          }}
        >
          <User size={10} className="me-1 flex-shrink-0" />
          <span style={{ fontSize: "10px" }}>
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
                background: "linear-gradient(135deg, #7c3aed 0%, #b299ea 100%)",
                borderRadius: "15px 15px 0 0",
              }}
            >
              <h5 className="modal-title fw-bold">
                උසාවි නිලධාරියා සහ උසාවිය පැවරීම
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
                  {legalOfficers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} - {officer.designation}
                    </option>
                  ))}
                </select>
                {legalOfficers.length === 0 && (
                  <small className="text-danger">
                    මෙම දිස්ත්‍රික්කයට නීති නිලධාරීන් නොමැත
                  </small>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <Building size={18} className="me-2" />
                  උසාවිය තෝරන්න *
                </label>
                <select
                  className="form-select"
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="">උසාවියක් තෝරන්න</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name} - {court.type}
                    </option>
                  ))}
                </select>
                {courts.length === 0 && (
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
                  උසාවිය: {selectedCase.courtName}
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
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold">
          නීති නිලධාරීන්ට පැවරීමට අපේක්ෂිත (නීති කටයුතු සඳහා)
        </h2>
        <p className="text-muted">
          තීරකකරණයෙන් පසුව නිසි පරිදි ගෙවීම් සිදු නොකළ ණයගැතියන් - නීති
          නිලධාරීන්ට පැවරීමට
        </p>
      </div>

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
            නීති නිලධාරීන්ට පැවරීමට ඇති ({paymentPendingCases.length})
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
              color: activeTab === "history" ? "#000" : "#7424c4",
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

      {activeTab === "pending" && (
        <>
          {paymentPendingCases.length === 0 ? (
            <div
              className="alert alert-info d-flex align-items-center"
              style={{ borderRadius: "10px" }}
            >
              <AlertCircle size={18} className="me-2" />
              නීති නිලධාරීන්ට පැවරීමට ඇති ණයගැතියන් හමු නොවීය.
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
                    "linear-gradient(135deg, #7c3aed 0%, #a485ec 100%)",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <h6 className="mb-0 fw-bold">
                  නීති නිලධාරීන්ට පැවරීමට අපේක්ෂිත ({paymentPendingCases.length}
                  )
                </h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="fw-semibold">තීරක අංකය</th>
                        <th className="fw-semibold">ණයගැතියාගේ නම</th>
                        <th className="fw-semibold">ලිපිනය</th>
                        <th className="fw-semibold">ණය අංකය</th>
                        <th className="fw-semibold">සංගමය</th>
                        <th className="fw-semibold">අවසන් මුදල</th>
                        <th className="fw-semibold">තීරණ දිනය</th>
                        <th className="fw-semibold">අනුමත දිනය</th>
                        <th className="fw-semibold">උසාවි නිලධාරියා </th>
                        <th className="fw-semibold">උසාවිය</th>
                        <th className="fw-semibold">ක්‍රියාමාර්ග</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentPendingCases.map((caseItem) => (
                        <tr
                          key={`${caseItem.submissionId}-${caseItem.borrowerId}`}
                        >
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
                              <button
                                onClick={() => handleOpenAssignModal(caseItem)}
                                className="btn btn-sm btn-primary"
                                style={{ borderRadius: "8px 0 0 8px" }}
                                title="උසාවි නිලධාරියා	 පැවරීම"
                              >
                                <UserPlus size={14} />
                              </button>
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
              <div className="card-footer bg-light"></div>
            </div>
          )}
        </>
      )}

      {activeTab === "history" && (
        <>
          <div
            className="card mb-4 border shadow-sm"
            style={{ borderRadius: "3px", borderColor: "#ddd" }}
          >
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span
                      className="input-group-text"
                      style={{
                        borderRadius: "3px 0 0 3px",
                        background: "#f5f5f5",
                        borderColor: "#999",
                      }}
                    >
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="නම, තීරක අංකය, ණය අංකය, නඩු අංකය හෝ සංගමය අනුව සොයන්න..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        borderRadius: "0 3px 3px 0",
                        borderColor: "#999",
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ borderRadius: "3px", borderColor: "#999" }}
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
              className="d-flex align-items-center p-3"
              style={{
                borderRadius: "3px",
                background: "#f8f8f8",
                border: "1px solid #ddd",
              }}
            >
              <History size={18} className="me-2" />
              {searchTerm || filterStatus !== "all"
                ? "සෙවුම් ප්‍රතිඵල හමු නොවීය"
                : "ඉතිහාස දත්ත හමු නොවීය"}
            </div>
          ) : (
            <div
              className="card border shadow-sm"
              style={{ borderRadius: "3px", borderColor: "#ddd" }}
            >
              <div
                className="card-header"
                style={{
                  background:
                    "linear-gradient(135deg, #8c58c3 0%, #8e44ad 100%)",
                  borderBottom: "none",
                  borderRadius: "0",
                  color: "#fff",
                  borderRadius: "5px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h6
                    className="mb-0 fw-bold text-white"
                    style={{ color: "#fff" }}
                  >
                    නීති නිලධාරීන්ට පවරා ඇති ({filteredData.length})
                  </h6>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="btn btn-sm btn-light"
                      style={{ borderRadius: "3px" }}
                    >
                      සෙවුම හිස් කරන්න
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table
                    className="table table-bordered mb-0"
                    style={{ fontSize: "14px" }}
                  >
                    <thead
                      style={{
                        background:
                          "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                        color: "#fff",
                      }}
                    >
                      <tr>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          තීරක අංකය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නම
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          ලිපිනය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          සංගමය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          ණය අංකය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          ණය මුදල
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          උසාවි නිලධාරියා
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          උසාවිය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          ලිපිය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නඩු දිනය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          නඩු අංකය
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{
                            borderRight: "1px solid #ddd",
                            width: "200px",
                            minWidth: "200px",
                          }}
                        >
                          නඩු තීන්දුව
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{
                            borderRight: "1px solid #ddd",
                            width: "150px",
                            minWidth: "150px",
                          }}
                        >
                          උසාවි ගෙවීම
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          උසාවි නිලධාරී සටහන්
                        </th>
                        <th
                          className="fw-semibold text-dark"
                          style={{ borderRight: "1px solid #ddd" }}
                        >
                          තත්වය
                        </th>
                        <th className="fw-semibold text-dark">විස්තර</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((borrower) => (
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
                          <td
                            style={{
                              borderRight: "1px solid #ddd",
                              fontWeight: "500",
                            }}
                          >
                            {borrower.borrowerName}
                          </td>
                          <td
                            className="small"
                            style={{
                              borderRight: "1px solid #ddd",
                              maxWidth: "150px",
                              color: "#666",
                            }}
                          >
                            {borrower.borrowerAddress}
                          </td>
                          <td
                            className="small"
                            style={{
                              borderRight: "1px solid #ddd",
                              color: "#666",
                            }}
                          >
                            {borrower.societyName}
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
                            {parseFloat(
                              borrower.finalLoanAmount || 0
                            ).toLocaleString("si-LK")}
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.assignedLegalOfficerName ? (
                              <span
                                style={{
                                  padding: "3px 8px",
                                  background: "#e8e8e8",
                                  borderRadius: "3px",
                                  fontSize: "12px",
                                  display: "inline-block",
                                }}
                              >
                                <User size={12} className="me-1" />
                                {borrower.assignedLegalOfficerName}
                              </span>
                            ) : (
                              <span style={{ color: "#999" }}>-</span>
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
                                  display: "inline-block",
                                }}
                              >
                                <Building size={12} className="me-1" />
                                {borrower.assignedCourtName}
                              </span>
                            ) : (
                              <span style={{ color: "#999" }}>-</span>
                            )}
                          </td>
                          <td
                            className="text-center"
                            style={{ borderRight: "1px solid #ddd" }}
                          >
                            <button
                              onClick={() => generateLetter(borrower)}
                              className="btn btn-outline-secondary btn-sm"
                              style={{
                                borderRadius: "3px",
                                fontSize: "11px",
                                padding: "3px 8px",
                              }}
                            >
                              <FileText size={12} className="me-1" />
                              ලිපිය
                            </button>
                          </td>
                          <td style={{ borderRight: "1px solid #ddd" }}>
                            {borrower.judgmentDate ? (
                              <span className="small" style={{ color: "#666" }}>
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
                          <td
                            style={{
                              borderRight: "1px solid #ddd",
                              width: "200px",
                              minWidth: "200px",
                            }}
                          >
                            <TableTextCell
                              content={borrower.judgmentResult}
                              icon={Gavel}
                              iconColor="text-secondary"
                              type="judgment"
                            />
                          </td>
                          <td
                            style={{
                              borderRight: "1px solid #ddd",
                              width: "150px",
                              minWidth: "150px",
                              padding: "6px",
                            }}
                          >
                            {borrower.courtPayments &&
                            borrower.courtPayments.length > 0 ? (
                              <div
                                className="d-flex align-items-center justify-content-between"
                                style={{ width: "100%", padding: "4px" }}
                              >
                                <div style={{ textAlign: "left", flex: "1" }}>
                                  <div
                                    style={{
                                      fontSize: "9px",
                                      color: "#666",
                                      lineHeight: "1.3",
                                    }}
                                  >
                                    <span
                                      style={{
                                        background: "#e8f5e9",
                                        padding: "2px 8px",
                                        borderRadius: "2px",
                                        fontSize: "10px",
                                      }}
                                    >
                                      ගෙවා ඇත
                                    </span>{" "}
                                    රු.{" "}
                                    <span
                                      className="fw-bold"
                                      style={{
                                        color: "#333",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {borrower.courtPayments
                                        .reduce(
                                          (sum, p) =>
                                            sum + parseFloat(p.amount || 0),
                                          0
                                        )
                                        .toLocaleString("si-LK")}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "9px",
                                      color: "#666",
                                      lineHeight: "1.3",
                                    }}
                                  >
                                    (ගෙවීම් - {borrower.courtPayments.length} )
                                  </div>
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  style={{
                                    fontSize: "9px",
                                    padding: "3px 8px",
                                    borderRadius: "3px",
                                    lineHeight: "1.3",
                                    whiteSpace: "nowrap",
                                  }}
                                  onClick={() =>
                                    handleShowPaymentDetails(borrower)
                                  }
                                >
                                  විස්තර
                                </button>
                              </div>
                            ) : (
                              <span
                                style={{
                                  padding: "4px 8px",
                                  background: "#f5f5f5",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  color: "#666",
                                }}
                              >
                                ගෙවීම් නැත
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
                            {getStatusBadge(borrower)}
                          </td>
                          <td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                className="card-footer"
                style={{ background: "#fafafa", borderTop: "1px solid #ddd" }}
              >
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="fs-4 fw-bold" style={{ color: "#333" }}>
                        {filteredData.length}
                      </div>
                      <div className="small" style={{ color: "#666" }}>
                        {searchTerm || filterStatus !== "all"
                          ? "සෙවුම් ප්‍රතිඵල"
                          : "මුළු නඩු"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="fs-4 fw-bold" style={{ color: "#333" }}>
                        {
                          filteredData.filter(
                            (b) => b.assignedLegalOfficerId && !b.judgmentResult
                          ).length
                        }
                      </div>
                      <div className="small" style={{ color: "#666" }}>
                        නීති නිලධාරීන්ට පවරා ඇත
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="fs-4 fw-bold" style={{ color: "#333" }}>
                        {filteredData.filter((b) => b.judgmentResult).length}
                      </div>
                      <div className="small" style={{ color: "#666" }}>
                        නඩු තීන්දු ලබා ඇත
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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

export default DistrictUnpaidCasesPage;
