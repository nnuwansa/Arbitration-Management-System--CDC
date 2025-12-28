import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Eye, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";

const UnpaidCasesApprovalPage = () => {
  const { user } = useAuth();
  const [pendingCases, setPendingCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCases, setSelectedCases] = useState({});

  useEffect(() => {
    loadPendingCases();
  }, []);

  const loadPendingCases = async () => {
    try {
      const data = await api.getUnpaidCasesPendingApproval(user.societyId);
      setPendingCases(data);
      console.log("✅ Loaded pending approval cases:", data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = (caseId) => {
    setSelectedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const handleApproveAndSendToDistrict = async () => {
    const selectedIds = Object.keys(selectedCases).filter(
      (id) => selectedCases[id]
    );

    if (selectedIds.length === 0) {
      alert("කරුණාකර අවම වශයෙන් එක් නඩුවක් තෝරන්න");
      return;
    }

    // Prepare cases with all required fields
    const casesToApprove = selectedIds.map((id) => {
      const caseData = pendingCases.find(
        (c) => `${c.submissionId}-${c.borrowerId}` === id
      );
      return {
        submissionId: caseData.submissionId,
        borrowerId: caseData.borrowerId,
        districtId: user.district, // Add districtId for email notification
      };
    });

    if (
      !window.confirm(
        `තෝරාගත් නඩු ${selectedIds.length} අනුමත කර දිස්ත්‍රික් කාර්යාලයට යැවීමට තහවුරු කරන්නද?`
      )
    ) {
      return;
    }

    try {
      const result = await api.approveUnpaidCasesAndSendToDistrict(
        casesToApprove
      );
      alert(
        result.message || "නඩු සාර්ථකව අනුමත කර දිස්ත්‍රික් කාර්යාලයට යවන ලදී!"
      );
      setSelectedCases({});
      loadPendingCases();
    } catch (err) {
      alert(err.message || "දෝෂයක් ඇති විය");
    }
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
      <h2 className="fw-bold mb-3">
        ගෙවීම් නොකළ ණයගැතියන්ට නීති කටයුතු සඳහා අනුමැතිය
      </h2>
      <div
        className="alert alert-info d-flex align-items-center mb-4"
        style={{ borderRadius: "10px" }}
      >
        <Clock size={18} className="me-2" />
        සමිති පරිපාලක විසින් යවන ලද ගෙවීම් නොකළ ණයගැතියන්ට නීති කටයුතු සඳහා
        අනුමත කර දිස්ත්‍රික් කාර්යාලයට යවන්න
      </div>

      {/* Batch Approval Section */}
      {pendingCases.length > 0 && (
        <div
          className="card border-0 shadow-sm mb-4"
          style={{ borderRadius: "15px" }}
        >
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">
                  ගෙවීම් නොකළ ණයගැතියන් අනුමත කර දිස්ත්‍රික්කයට යවන්න
                </h5>
                <small className="text-muted">
                  අනුමත කළ පසු නීති කටයුතු සඳහා දිස්ත්‍රික් කාර්යාලයට යවනු ලැබේ
                </small>
              </div>
              <button
                onClick={handleApproveAndSendToDistrict}
                className="btn btn-success"
                style={{ borderRadius: "10px" }}
                disabled={
                  Object.values(selectedCases).filter(Boolean).length === 0
                }
              >
                <CheckCircle size={16} className="me-2" />
                අනුමත කර දිස්ත්‍රික්කයට යවන්න (
                {Object.values(selectedCases).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingCases.length === 0 ? (
        <div
          className="alert alert-warning d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          ගෙවීම් නොකළ ණයගැතියන් අනුමැතියට බලාපොරොත්තු
        </div>
      ) : (
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "15px" }}
        >
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead
                style={{
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                }}
                className="text-white"
              >
                <tr>
                  <th className="fw-semibold">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const newSelected = {};
                        if (e.target.checked) {
                          pendingCases.forEach((b) => {
                            newSelected[
                              `${b.submissionId}-${b.borrowerId}`
                            ] = true;
                          });
                        }
                        setSelectedCases(newSelected);
                      }}
                      className="form-check-input"
                    />
                  </th>
                  <th className="fw-semibold">යවන ලද දිනය</th>
                  <th className="fw-semibold">තීරක අංකය</th>
                  <th className="fw-semibold">ණයගැතියාගේ නම</th>
                  <th className="fw-semibold">ණය අංකය</th>
                  <th className="fw-semibold">මුල් ණය මුදල</th>
                  <th className="fw-semibold">අඩු කළ පොළිය</th>
                  <th className="fw-semibold">තීරණ දිනය</th>
                  <th className="fw-semibold">තීන්දුව</th>
                  <th className="fw-semibold">විස්තර</th>
                </tr>
              </thead>
              <tbody>
                {pendingCases.map((borrower) => {
                  const caseId = `${borrower.submissionId}-${borrower.borrowerId}`;
                  return (
                    <tr key={caseId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCases[caseId] || false}
                          onChange={() => handleSelectCase(caseId)}
                          className="form-check-input"
                        />
                      </td>
                      <td>
                        {borrower.submittedForApprovalDate
                          ? new Date(
                              borrower.submittedForApprovalDate
                            ).toLocaleDateString("si-LK")
                          : "-"}
                      </td>
                      <td className="fw-bold text-primary">
                        {borrower.arbitrationNumber}
                      </td>
                      <td>
                        <strong>{borrower.borrowerName}</strong>
                      </td>
                      <td>{borrower.loanNumber}</td>
                      <td>
                        රු.{" "}
                        {parseFloat(borrower.loanAmount).toLocaleString(
                          "si-LK"
                        )}
                      </td>
                      <td className="text-danger fw-bold">
                        රු.{" "}
                        {parseFloat(
                          borrower.interestDeducted || 0
                        ).toLocaleString("si-LK")}
                      </td>
                      <td>
                        {borrower.decisionDate
                          ? new Date(borrower.decisionDate).toLocaleDateString(
                              "si-LK"
                            )
                          : "-"}
                      </td>
                      <td>
                        <div
                          style={{
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={borrower.arbitrationDecision}
                        >
                          {borrower.arbitrationDecision}
                        </div>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BorrowerDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        borrower={selectedBorrower}
      />
    </div>
  );
};

export default UnpaidCasesApprovalPage;
