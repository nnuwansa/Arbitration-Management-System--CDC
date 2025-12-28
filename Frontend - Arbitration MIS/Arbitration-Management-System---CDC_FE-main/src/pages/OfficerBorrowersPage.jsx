import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, FileText, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import DecisionModal from "../components/DecisionModal";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";

const OfficerBorrowersPage = () => {
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showViewDecisionModal, setShowViewDecisionModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [decisionData, setDecisionData] = useState({
    decisionDate: "",
    finalLoanAmount: "",
    interestDeducted: "",
    arbitrationDecision: "",
  });

  useEffect(() => {
    loadBorrowers();
  }, []);

  const loadBorrowers = async () => {
    try {
      const data = await api.getOfficerAssignedBorrowers();
      // Sort by assignedDate (newest first) - assuming there's an assignedDate or createdAt field
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.assignedDate || a.createdAt || 0);
        const dateB = new Date(b.assignedDate || b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      setBorrowers(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDecisionModal = (borrower) => {
    setSelectedBorrower(borrower);
    setShowDecisionModal(true);
    setDecisionData({
      decisionDate: new Date().toISOString().split("T")[0],
      finalLoanAmount: borrower.loanAmount || "",
      interestDeducted: "",
      arbitrationDecision: "",
    });
  };

  const openDetailsModal = (borrower) => {
    setSelectedBorrower(borrower);
    setShowDetailsModal(true);
  };

  const openViewDecisionModal = (borrower) => {
    setSelectedBorrower(borrower);
    setShowViewDecisionModal(true);
  };

  const submitDecision = async () => {
    if (
      !decisionData.decisionDate ||
      !decisionData.finalLoanAmount ||
      !decisionData.interestDeducted ||
      !decisionData.arbitrationDecision
    ) {
      alert("කරුණාකර සියලු තොරතුරු පුරවන්න");
      return;
    }

    try {
      await api.addArbitrationDecision(
        selectedBorrower.submissionId,
        selectedBorrower.borrowerId,
        decisionData
      );
      alert("තීන්දුව සාර්ථකව එකතු කරන ලදී!");
      setShowDecisionModal(false);
      loadBorrowers();
    } catch (err) {
      alert(err.message);
    }
  };

  const generateLetter = (borrower, submission) => {
    const currentDate = new Date().toLocaleDateString("si-LK");
    const totalAmount =
      parseFloat(borrower.loanAmount) + parseFloat(borrower.interest);

    const letterHTML = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>ආරවුලක් සිරවත් කිරීමට භාර කිරීම</title>
    <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: 'FM Abhaya', 'Noto Sans Sinhala', 'Iskoola Pota', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #000; margin: 0; padding: 0; }
        .page-border { border: 2px solid #000; padding: 25px; margin: 20px; }
        .header-logo { text-align: right; font-size: 10pt; font-style: italic; color: #666; margin-bottom: 20px; }
        .header-title { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 25px; text-decoration: underline; }
        .ref-text { font-size: 11pt; text-align: justify; margin-bottom: 15px; line-height: 1.8; }
        .main-section { margin-top: 20px; }
        .amount-section { margin: 20px 0; font-size: 12pt; }
        .content-para { text-align: justify; margin-bottom: 15px; line-height: 1.8; font-size: 11pt; }
        .department-info { margin-top: 30px; line-height: 1.8; }
        .date-section { margin-top: 25px; line-height: 1.8; }
        .signature-section { margin-top: 50px; line-height: 1.8; }
        .footer-note { margin-top: 35px; font-size: 9pt; font-style: italic; line-height: 1.6; border-top: 1px solid #ccc; padding-top: 15px; }
        .filled-data { font-weight: bold; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="page-border">
        <div class="header-logo">තීරක අංකය: <span class="filled-data">${
          borrower.arbitrationNumber || "..........................."
        }</span></div>
        <div class="header-title">ආරවුලක් නිරවුල් කිරීමට භාර කිරීම ( ණය මුදල් )</div>
        <div class="ref-text">1953 අංක 04 දරණ සමුපකාර සමිති (සංශෝධන) පනතෙහි සංශෝධිත ආධ්‍යාය පළාත් සභාවේ 1000 අංක 10 දරණ සමුපකාර සමිති ආඥා පනතේ 58 වන වගන්තිය සහ ඊ වෙනි ප්‍රඥප්තියේ 51 වගන්ති හා 83 110 (ඇ) වගන්ති යටතේ රෙජිස්ට්‍රාර්වරයා වෙත පැවරී ඇති බලයන්ත අනුව අංක <span class="filled-data">${
          borrower.membershipNo || "............................."
        }</span> දරණ ගැසට් පත්‍රයේ ප්‍රකාශිත සමුපකාර සංවර්ධන සහකාර කොමසාරිස් / නියෝජ්‍ය කොමසාරිස්</div>
        <div class="ref-text">දරණ ගැසට් පත්‍රයේ සඳහන් කරන ලද නිවේදනයෙන් මා වෙත පවරන ලද බලය අනුව මධ්‍යම පළාතේ ලියාපදිංචි කරු වශයෙන් ලියාපදිංචි සමුපකාර සමිතියක් වන <span class="filled-data">${
          submission?.societyName || "සමිතිය"
        }</span> සමිතිය හා විත්තිකරුවන් වශයෙන් ඊ සමිතියේ සාමාජිකයින් වන ණයකරුවෝ <span class="filled-data">${
      borrower.borrowerName
    }</span> සහ ඇපකරුවෝ නම් <span class="filled-data">${
      borrower.guarantor1Name
    }</span> සහ <span class="filled-data">${
      borrower.guarantor2Name
    }</span> අතර ණය මුදල වශයෙන්</div>
        <div class="main-section">
            <div class="amount-section">රු. <span class="filled-data">${parseFloat(
              borrower.loanAmount
            ).toLocaleString("si-LK")}</span></div>
            <div class="content-para">සහ වාර්ෂික පොළියක්, අංක <span class="filled-data">${
              borrower.loanNumber
            }</span> වන ණය ගිණුම සම්බන්ධයෙන් මුළු මුදල <span class="filled-data">රු. ${totalAmount.toLocaleString(
      "si-LK"
    )}</span> පොලී ප්‍රතිශතයක් <span class="filled-data">${
      borrower.interestRate
    }%</span> දී ණය දුන් දිනයෙන් සිට මුළු මුදල ගෙවා නිම කරන්නා වන තුරු මුල් මුදලට අදුනා ගත යුතු පොළියක්, සමුපකාර සමිතියට අයවිය යුතු වශයෙන් පැන ඇති බවට ආරවුල නිසා අනු අතිහීමක් යටතේ මා වෙත ඉදිරිපත් කරන ලදින්, එම ආරවුල තීන්දුව කිරීමට තීරණ තාවක්කාරු දීම සඳහා ආරවුල් බේරුම්කරු තීරණ තාවක්කාරුවක් වශයෙන් <span class="filled-data">${
      user.name || "බේරුම්කරු"
    }</span> මහතා / මිය මෙයින් පත් කරමි.</div>
            <div class="department-info"><div>මධ්‍ය පළාත් සමුපකාර සංවර්ධන දෙපාර්තුමේන්තුව</div><div>සමුපකාර සංවර්ධන සහකාර කොමසාරිස් / නියෝජ්‍ය කොමසාරිස්</div><div><span class="filled-data">${
              submission?.districtName || "දිස්ත්‍රික්කය"
            }</span></div></div>
            <div class="date-section"><div>දිනය: ..............................</div></div>
            <div class="signature-section"><div>...........................................................</div><div>සමුපකාර සංවර්ධන සහකාර කොමසාරිස් /</div><div>නියෝජ්‍ය කොමසාරිස්</div></div>
            <div class="footer-note"><strong>සටහන්:</strong><br/><br/>* ආරවුලේ එක් පාර්ශවයක් ඇපකරුවෙකු නොවන අවස්ථාවේදී ඒ වගන්තිය තහවුරු කර එහි සම්පූර්ණ නම් සඳහන් කරන්න.</div>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob(["\ufeff", letterHTML], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ආරවුල_භාර_කිරීම_${
      borrower.arbitrationNumber || "document"
    }.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("ලිපිය Word ලියවිල්ලක් ලෙස බාගත වේ");
  };

  // View Decision Modal Component
  const ViewDecisionModal = ({ borrower, onClose }) => {
    if (!borrower) return null;

    const loanAmount = parseFloat(borrower.loanAmount || 0);
    const interest = parseFloat(borrower.interest || 0);

    return (
      <div
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content" style={{ borderRadius: "15px" }}>
            <div
              className="modal-header text-white"
              style={{
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                borderRadius: "15px 15px 0 0",
              }}
            >
              <h5 className="modal-title fw-bold">
                තීරක නිලධාරියාගේ තීන්දුවේ තොරතුරු
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
            <div className="modal-body p-4">
              {/* Basic Information */}
              <div
                className="alert alert-info mb-4"
                style={{ borderRadius: "10px" }}
              >
                <h6 className="fw-bold mb-3">ණයගැතියාගේ තොරතුරු</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>නම:</strong> <span>{borrower.borrowerName}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>ලිපිනය:</strong>{" "}
                    <span>{borrower.borrowerAddress}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>ණය අංකය:</strong> <span>{borrower.loanNumber}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>තීරක අංකය:</strong>{" "}
                    <span className="text-primary fw-bold">
                      {borrower.arbitrationNumber}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>තීරක නිලධාරියා:</strong>{" "}
                    <span className="text-success">
                      {borrower.assignedOfficerName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: "10px", background: "#f8f9fa" }}
              >
                <div
                  className="card-header bg-success text-white"
                  style={{ borderRadius: "10px 10px 0 0" }}
                >
                  <h6 className="mb-0 fw-bold">මූල් ණය විස්තර</h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <strong>ණය මුදල:</strong>
                      <div className="fs-5 text-primary">
                        රු. {loanAmount.toLocaleString("si-LK")}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <strong>පොළිය:</strong>
                      <div className="fs-5 text-warning">
                        රු. {interest.toLocaleString("si-LK")}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <strong>පොළී අනුපාතය:</strong>
                      <div className="fs-5 text-info">
                        {borrower.interestRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arbitration Decision */}
              {borrower.status === "decision-given" &&
              borrower.arbitrationDecision ? (
                <div
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: "10px" }}
                >
                  <div
                    className="card-header text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderRadius: "10px 10px 0 0",
                    }}
                  >
                    <h6 className="mb-0 fw-bold">තීරක නිලධාරියාගේ තීන්දුව</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          තීරණ දුන් දිනය:
                        </label>
                        <div className="text-muted">
                          {borrower.decisionDate
                            ? new Date(
                                borrower.decisionDate
                              ).toLocaleDateString("si-LK")
                            : "-"}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          අඩු කළ පොළිය:
                        </label>
                        <div className="fs-5 text-danger fw-bold">
                          රු.{" "}
                          {parseFloat(
                            borrower.interestDeducted || 0
                          ).toLocaleString("si-LK")}
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          තීන්දුව / සටහන්:
                        </label>
                        <div
                          className="p-3 bg-light"
                          style={{ borderRadius: "8px" }}
                        >
                          {borrower.arbitrationDecision || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="alert alert-warning"
                  style={{ borderRadius: "10px" }}
                >
                  <AlertCircle size={18} className="me-2" />
                  තීන්දුවක් තවමත් ලබා දී නොමැත
                </div>
              )}
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
      <h2 className="fw-bold mb-3">තීරකකරණය සදහා පවරා ඇති ණයගැතියන්</h2>
      <div
        className="alert alert-info d-flex align-items-center mb-4"
        style={{ borderRadius: "10px" }}
      >
        <CheckCircle size={18} className="me-2" />
        ඔබට පවරා ඇති ණයගැතියන් සඳහා තීරණ එකතු කරන්න
      </div>

      {borrowers.length === 0 ? (
        <div
          className="alert alert-warning d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          ඔබට තවම ණයගැතියන් පවරා නැත
        </div>
      ) : (
        <div
          className="card shadow-sm border-0"
          style={{ borderRadius: "15px" }}
        >
          <div className="table-responsive">
            <table
              className="table table-hover mb-0"
              style={{
                fontSize: "13px",
              }}
            >
              <thead
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                className="text-white"
              >
                <tr>
                  <th className="fw-semibold">ලැබුණු දිනය</th>
                  <th className="fw-semibold">ණය අංකය</th>
                  <th className="fw-semibold">නම</th>
                  <th className="fw-semibold">ණය මුදල</th>
                  <th className="fw-semibold">පොලිය</th>
                  <th className="fw-semibold">තීරක අංකය</th>
                  <th className="fw-semibold">තීන්දුව</th>
                  <th className="fw-semibold">ලිපිය</th>
                  <th className="fw-semibold">විස්තර</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((borrower) => (
                  <tr key={borrower.borrowerId}>
                    <td className="fw-semibold text-muted">
                      {borrower.assignedDate
                        ? new Date(borrower.assignedDate).toLocaleString(
                            "si-LK",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false, // use 24-hour format
                            }
                          )
                        : "-"}
                    </td>

                    <td className="fw-semibold">{borrower.loanNumber}</td>
                    <td>
                      <strong>{borrower.borrowerName}</strong>
                    </td>
                    <td>
                      රු.{" "}
                      {parseFloat(borrower.loanAmount).toLocaleString("si-LK")}
                    </td>
                    <td>
                      රු.{" "}
                      {parseFloat(borrower.interest).toLocaleString("si-LK")}
                    </td>
                    <td className=" text-primary">
                      {borrower.arbitrationNumber}
                    </td>

                    <td className="text-center">
                      {borrower.status === "assigned" &&
                        !borrower.arbitrationDecision && (
                          <button
                            onClick={() => openDecisionModal(borrower)}
                            className="btn  btn-sm"
                            style={{
                              borderRadius: "8px",
                              fontSize: "12px",
                              color: "#fffff",
                              background:
                                "linear-gradient(135deg, #8f95af 0%, #a29da8 100%)",
                            }}
                          >
                            තීන්දුව එකතු කරන්න
                          </button>
                        )}
                      {borrower.arbitrationDecision && (
                        <button
                          onClick={() => openViewDecisionModal(borrower)}
                          className="btn btn-success btn-sm"
                          style={{ borderRadius: "8px", fontSize: "12px" }}
                        >
                          <Eye size={14} className="me-1" />
                          තීන්දුව
                        </button>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() =>
                          generateLetter(borrower, {
                            societyName: borrower.societyName,
                            districtName: borrower.districtName,
                          })
                        }
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: "8px", fontSize: "12px" }}
                      >
                        <FileText size={14} className="me-1" />
                        ලිපිය
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => openDetailsModal(borrower)}
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
      )}

      {/* Add Decision Modal */}
      <DecisionModal
        show={showDecisionModal}
        onClose={() => setShowDecisionModal(false)}
        borrower={selectedBorrower}
        decisionData={decisionData}
        setDecisionData={setDecisionData}
        onSubmit={submitDecision}
      />

      {/* View Decision Modal */}
      {showViewDecisionModal && (
        <ViewDecisionModal
          borrower={selectedBorrower}
          onClose={() => {
            setShowViewDecisionModal(false);
            setSelectedBorrower(null);
          }}
        />
      )}

      {/* Borrower Details Modal */}
      <BorrowerDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        borrower={selectedBorrower}
      />
    </div>
  );
};

export default OfficerBorrowersPage;
