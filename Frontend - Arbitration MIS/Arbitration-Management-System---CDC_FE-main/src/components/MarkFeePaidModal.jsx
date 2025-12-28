import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import api from "../services/api";

const MarkFeePaidModal = ({
  show,
  onClose,
  borrower,
  submissionId,
  districtId,
  onSuccess,
}) => {
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [officers, setOfficers] = useState([]);
  const [arbitrationFeePaid, setArbitrationFeePaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && districtId) {
      loadOfficers();
    }
  }, [show, districtId]);

  const loadOfficers = async () => {
    try {
      const data = await api.getOfficersByDistrict(districtId);
      setOfficers(data);
    } catch (err) {
      console.error("Error loading officers:", err);
      setError("නිලධාරීන් පැටවීමේදී දෝෂයක්");
    }
  };

  const handleSubmit = async () => {
    // Debug: Check borrower data
    console.log("🔍 Borrower data:", borrower);
    console.log("🔍 Loan type:", borrower?.loanType);

    // Validate all required fields
    if (!selectedOfficer) {
      alert("කරුණාකර තීරක නිලධාරියෙකු තෝරන්න");
      return;
    }

    if (!arbitrationFeePaid) {
      alert("කරුණාකර තීරක ගාස්තුව ගෙවා ඇති බව තහවුරු කරන්න");
      return;
    }

    // Validate required data from borrower
    if (!borrower?.id) {
      alert("ණයකරුගේ තොරතුරු අඩුවී ඇත");
      return;
    }

    if (!submissionId) {
      alert("ඉදිරිපත් කිරීමේ අංකය අඩුවී ඇත");
      return;
    }

    if (!districtId) {
      alert("දිස්ත්‍රික්කේ අංකය අඩුවී ඇත");
      return;
    }

    console.log("📋 Submitting with data:", {
      submissionId,
      borrowerId: borrower.id,
      selectedOfficer,
      arbitrationFeePaid,
      districtId,
      loanType: borrower.loanType,
    });

    setLoading(true);
    setError("");

    try {
      // Pass all required data to backend
      await api.markFeePaidAndAssignOfficer(
        submissionId,
        borrower.id,
        selectedOfficer,
        arbitrationFeePaid
      );

      const message =
        "✅ සාර්ථකයි!\n\n• තීරක ගාස්තුව සලකුණු කරන ලදී\n• තීරක අංකය ස්වයංක්‍රීයව ජනරේට කරන ලදී\n• නිලධාරියා පවරා ඇත";

      alert(message);
      setSelectedOfficer("");
      setArbitrationFeePaid(false);
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      alert("දෝෂය: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop show"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        onClick={onClose}
      ></div>
      <div
        className="modal show d-block"
        style={{ zIndex: 1055 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: "12px" }}>
            <div
              className="modal-header text-white"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <h5 className="modal-title fw-bold">
                <CheckCircle size={20} className="me-2" />
                නිලධාරියා පැවරීම
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-4">
              {/* Borrower Info */}
              <div className="mb-3 p-3 bg-light rounded">
                <div className="fw-bold text-primary mb-1">
                  {borrower?.borrowerName}
                </div>
                <small className="text-muted d-block">
                  ණය අංකය: {borrower?.loanNumber}
                </small>
              </div>

              {/* Arbitration Fee Checkbox - NOW REQUIRED */}
              <div
                className="mb-3 p-3 border rounded"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderColor: "#fbbf24",
                  borderWidth: "2px",
                }}
              >
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="arbitrationFeeCheck"
                    checked={arbitrationFeePaid}
                    onChange={(e) => setArbitrationFeePaid(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="arbitrationFeeCheck"
                    style={{ cursor: "pointer" }}
                  >
                    <DollarSign size={16} className="me-2 text-success" />
                    තීරක ගාස්තුව ගෙවා ඇත <span className="text-danger">*</span>
                  </label>
                </div>
                <small className="text-muted d-block mt-2">
                  තීරකකරණය සදහා ඉදිරිපත් කිරීමට මෙම ගාස්තුව ගෙවීම අත්‍යවශ්‍ය වේ.
                </small>
              </div>

              {/* Officer Selection */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  තීරක නිලධාරියා තෝරන්න <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  style={{ borderRadius: "8px" }}
                  disabled={loading}
                >
                  <option value="">-- නිලධාරියෙකු තෝරන්න --</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name}
                    </option>
                  ))}
                </select>
                {officers.length === 0 && (
                  <small className="text-warning d-block mt-1">
                    <AlertCircle size={12} className="me-1" />
                    මෙම දිස්ත්‍රික්කයේ නිලධාරීන් නොමැත
                  </small>
                )}
              </div>

              {/* Info Alert */}
              <div className="alert alert-success d-flex align-items-start mb-0">
                <CheckCircle size={18} className="me-2 flex-shrink-0 mt-1" />
                <div>
                  <small className="d-block mb-1">
                    <strong>මෙම ක්‍රියාව සිදු කරන විට:</strong>
                  </small>
                  <small>
                    ✓ තීරක ගාස්තුව ගෙවූ බව සලකුණු කරනු ලබයි
                    <br />
                    ✓ තීරක අංකය ස්වයංක්‍රීයව ජනරේට කරනු ලබයි
                    <br />✓ තෝරාගත් නිලධාරියා වෙත පවරනු ලබයි
                  </small>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-danger d-flex align-items-start mt-3 mb-0">
                  <AlertCircle size={18} className="me-2 flex-shrink-0 mt-1" />
                  <small>{error}</small>
                </div>
              )}
            </div>

            <div className="modal-footer bg-light border-top">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                අවලංගු කරන්න
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !selectedOfficer ||
                  !arbitrationFeePaid ||
                  officers.length === 0
                }
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    ක්‍රියාත්මක කරමින්...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="me-2" />
                    තහවුරු කරන්න
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarkFeePaidModal;
