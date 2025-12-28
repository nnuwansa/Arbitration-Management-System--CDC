import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";

const PendingApprovalsPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  const loadPendingSubmissions = async () => {
    try {
      const data = await api.getPendingApprovalsBySociety(user.societyId);
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "මෙම ඉදිරිපත් කිරීම අනුමත කරන්නද? එය දිස්ත්‍රික් කාර්යාලයට යවනු ලැබේ."
      )
    )
      return;

    setActionLoading(true);
    try {
      await api.approveSubmission(id);
      alert("සාර්ථකව අනුමත කරන ලදී!");
      loadPendingSubmissions();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("ප්‍රතික්ෂේප කිරීමට හේතුව ඇතුළත් කරන්න:");
    if (!reason) return;

    setActionLoading(true);
    try {
      await api.rejectSubmission(id, reason);
      alert("ඉදිරිපත් කිරීම ප්‍රතික්ෂේප කරන ලදී");
      loadPendingSubmissions();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
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
      <h2 className="fw-bold mb-3">අනුමැතිය බලාපොරොත්තු වන ඉදිරිපත් කිරීම්</h2>
      <div
        className="alert alert-info d-flex align-items-center mb-4"
        style={{ borderRadius: "10px" }}
      >
        <Clock size={18} className="me-2" />
        සමිතිය විසින් එවන ලද ඉදිරිපත් කිරීම් සමාලෝචනය කර අනුමත කරන්න.
      </div>

      {submissions.length === 0 ? (
        <div
          className="alert alert-warning d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <Clock size={18} className="me-2" />
          අනුමැතියට බලාපොරොත්තු වන ඉදිරිපත් කිරීම් නොමැත
        </div>
      ) : (
        <div className="row">
          {submissions.map((s) => (
            <div key={s.id} className="col-12 mb-3">
              <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: "15px" }}
              >
                <div
                  className="card-header"
                  style={{
                    background:
                      "linear-gradient(135deg, #b08dce 0%, #a14eeb 100%)",
                    borderRadius: "15px 15px 0 0",
                  }}
                >
                  <h5 className="mb-0 text-white fw-semibold d-flex align-items-center">
                    <Clock size={20} className="me-2" />
                    ඉදිරිපත් කළ දිනය:{" "}
                    {new Date(s.submittedDate).toLocaleDateString("si-LK")}
                  </h5>
                  <small className="text-white">
                    ඉදිරිපත් කළ අය: {s.submittedBy}
                  </small>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ background: "#f8f9fa" }}>
                        <tr>
                          <th>ලැබුණු දිනය</th>
                          <th>නම</th>
                          <th>ණය අංකය</th>
                          <th>මුදල</th>
                          <th>පොළිය</th>
                          <th>විස්තර</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.borrowers.map((b, idx) => (
                          <tr key={idx}>
                            <td>
                              {/* ⭐ Show received date with proper formatting */}
                              {s.submittedDate
                                ? new Date(s.submittedDate).toLocaleString(
                                    "si-LK",
                                    {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    }
                                  )
                                : "-"}
                            </td>
                            <td>
                              <strong>{b.borrowerName}</strong>
                            </td>
                            <td>{b.loanNumber}</td>
                            <td>
                              රු.{" "}
                              {parseFloat(b.loanAmount).toLocaleString("si-LK")}
                            </td>
                            <td>
                              රු.{" "}
                              {parseFloat(b.interest).toLocaleString("si-LK")}
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  setSelectedBorrower(b);
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

                  <div className="card-footer bg-white p-3">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success"
                        onClick={() => handleApprove(s.id)}
                        disabled={actionLoading}
                        style={{ borderRadius: "10px" }}
                      >
                        <CheckCircle size={18} className="me-1" />
                        අනුමත කර දිස්ත්‍රික්කයට යවන්න
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleReject(s.id)}
                        disabled={actionLoading}
                        style={{ borderRadius: "10px" }}
                      >
                        <XCircle size={18} className="me-1" />
                        ප්‍රතික්ෂේප කරන්න
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

export default PendingApprovalsPage;
