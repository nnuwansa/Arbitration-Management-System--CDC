import React from "react";
import {
  X,
  FileText,
  Calendar,
  DollarSign,
  TrendingDown,
  Percent,
} from "lucide-react";

const DecisionViewModal = ({ show, onClose, borrower }) => {
  if (!show || !borrower || !borrower.arbitrationDecision) return null;

  const originalLoanAmount = parseFloat(borrower.loanAmount || 0);
  const outstandingLoanAmount = parseFloat(borrower.outstandingLoanAmount || 0);
  const originalInterest = parseFloat(borrower.interest || 0);
  const proposedLoanBalance = parseFloat(borrower.proposedLoanBalance || 0);
  const proposedLoanInterest = parseFloat(borrower.proposedLoanInterest || 0);

  const loanReduction = originalLoanAmount - proposedLoanBalance;
  const interestReduction = originalInterest - proposedLoanInterest;

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
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" style={{ borderRadius: "12px" }}>
            <div
              className="modal-header text-white"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <h5 className="modal-title fw-bold">
                <FileText size={20} className="me-2" />
                තීරක තීරණය - {borrower.borrowerName}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-4">
              {/* Borrower Basic Info */}
              <div
                className="alert alert-info mb-3"
                style={{ borderRadius: "8px" }}
              >
                <div className="row g-2">
                  <div className="col-md-6">
                    <small className="text-muted d-block">නම:</small>
                    <strong>{borrower.borrowerName}</strong>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">ණය අංකය:</small>
                    <strong>{borrower.loanNumber}</strong>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">තීරක අංකය:</small>
                    <strong className="text-danger">
                      {borrower.arbitrationNumber}
                    </strong>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">තීරක නිලධාරි:</small>
                    <strong>{borrower.assignedOfficerName || "-"}</strong>
                  </div>
                </div>
              </div>

              {/* Decision Dates */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="card border-primary">
                    <div className="card-body p-3">
                      <small className="text-muted d-block mb-1">
                        <Calendar size={14} className="me-1" />
                        තීරණ දුන් දිනය
                      </small>
                      <div className="fw-bold text-primary">
                        {borrower.decisionDate
                          ? new Date(borrower.decisionDate).toLocaleDateString(
                              "si-LK",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-danger">
                    <div className="card-body p-3">
                      <small className="text-muted d-block mb-1">
                        <Calendar size={14} className="me-1" />
                        අභියාචනය කල යුතු දිනය
                      </small>
                      <div className="fw-bold text-danger">
                        {borrower.appealDueDate
                          ? new Date(borrower.appealDueDate).toLocaleDateString(
                              "si-LK",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Original vs Proposed Amounts */}
              <div
                className="card mb-3 border-0 shadow-sm"
                style={{ borderRadius: "8px" }}
              >
                <div
                  className="card-header bg-gradient text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  }}
                >
                  <h6 className="mb-0 fw-bold">
                    <DollarSign size={16} className="me-2" />
                    මූල්‍ය සාරාංශය
                  </h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-borderless mb-0">
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th>විස්තර</th>
                          <th className="text-end">මුල් මුදල</th>
                          <th className="text-end">ප්‍රදානිත මුදල</th>
                          <th className="text-end">අඩු කිරීම</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="fw-semibold">ණය ශේෂය</td>
                          <td className="text-end fw-bold text-primary">
                            රු.{" "}
                            {outstandingLoanAmount.toLocaleString("si-LK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-end fw-bold text-success">
                            රු.{" "}
                            {proposedLoanBalance.toLocaleString("si-LK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-end">
                            {loanReduction > 0 ? (
                              <span className="badge bg-success">
                                <TrendingDown size={12} className="me-1" />
                                රු.{" "}
                                {loanReduction.toLocaleString("si-LK", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">පොළිය</td>
                          <td className="text-end fw-bold text-warning">
                            රු.{" "}
                            {originalInterest.toLocaleString("si-LK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-end fw-bold text-success">
                            රු.{" "}
                            {proposedLoanInterest.toLocaleString("si-LK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-end">
                            {interestReduction > 0 ? (
                              <span className="badge bg-success">
                                <TrendingDown size={12} className="me-1" />
                                රු.{" "}
                                {interestReduction.toLocaleString("si-LK", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                        {borrower.caseFees &&
                          parseFloat(borrower.caseFees) > 0 && (
                            <tr>
                              <td className="fw-semibold">නඩු ගාස්තු</td>
                              <td className="text-end">-</td>
                              <td className="text-end fw-bold text-info">
                                රු.{" "}
                                {parseFloat(borrower.caseFees).toLocaleString(
                                  "si-LK",
                                  { minimumFractionDigits: 2 }
                                )}
                              </td>
                              <td className="text-end">-</td>
                            </tr>
                          )}
                        <tr
                          style={{
                            backgroundColor: "#f0f9ff",
                            borderTop: "2px solid #ddd",
                          }}
                        >
                          <td className="fw-bold">මුළු මුදල</td>
                          <td className="text-end fw-bold text-danger fs-5">
                            රු.{" "}
                            {(
                              originalLoanAmount + originalInterest
                            ).toLocaleString("si-LK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-end fw-bold text-success fs-5">
                            රු.{" "}
                            {parseFloat(
                              borrower.proposedTotalAmount || 0
                            ).toLocaleString("si-LK", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-end">
                            {loanReduction + interestReduction > 0 ? (
                              <span className="badge bg-success fs-6">
                                <TrendingDown size={14} className="me-1" />
                                රු.{" "}
                                {(
                                  loanReduction + interestReduction
                                ).toLocaleString("si-LK", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Forward Interest */}
              {(borrower.forwardInterest || borrower.forwardInterestRate) && (
                <div
                  className="card mb-3 border-0 shadow-sm"
                  style={{ borderRadius: "8px" }}
                >
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0 fw-bold">
                      <Percent size={16} className="me-2" />
                      ඉදිරියට පොළිය
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {borrower.forwardInterest && (
                        <div className="col-md-6">
                          <small className="text-muted d-block mb-1">
                            ඉදිරියට පොළිය:
                          </small>
                          <div className="fw-bold fs-5 text-success">
                            රු.{" "}
                            {parseFloat(
                              borrower.forwardInterest
                            ).toLocaleString("si-LK", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      )}
                      {borrower.forwardInterestRate && (
                        <div className="col-md-6">
                          <small className="text-muted d-block mb-1">
                            ඉදිරියට පොළී අනුපාතය:
                          </small>
                          <div className="fw-bold fs-5 text-success">
                            {borrower.forwardInterestRate}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Deductions */}
              {(borrower.deductionsFromLoanAmount ||
                borrower.deductionsFromInterestAmount) && (
                <div
                  className="alert alert-warning mb-3"
                  style={{ borderRadius: "8px" }}
                >
                  <h6 className="fw-bold mb-3">
                    <TrendingDown size={16} className="me-2" />
                    ප්‍රදානයේදී කපහැරීම්
                  </h6>
                  <div className="row">
                    {borrower.deductionsFromLoanAmount && (
                      <div className="col-md-6">
                        <small className="d-block mb-1">ණය මුදලෙන්:</small>
                        <strong className="fs-5">
                          රු.{" "}
                          {parseFloat(
                            borrower.deductionsFromLoanAmount
                          ).toLocaleString("si-LK", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                    )}
                    {borrower.deductionsFromInterestAmount && (
                      <div className="col-md-6">
                        <small className="d-block mb-1">පොලියෙන්:</small>
                        <strong className="fs-5">
                          රු.{" "}
                          {parseFloat(
                            borrower.deductionsFromInterestAmount
                          ).toLocaleString("si-LK", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Decision Text */}
              <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: "8px" }}
              >
                <div className="card-header bg-secondary text-white">
                  <h6 className="mb-0 fw-bold">
                    <FileText size={16} className="me-2" />
                    තීරණය / සටහන්
                  </h6>
                </div>
                <div className="card-body">
                  <div
                    className="p-3 bg-light rounded"
                    style={{
                      whiteSpace: "pre-wrap",
                      maxHeight: "300px",
                      overflowY: "auto",
                      fontSize: "14px",
                      lineHeight: "1.8",
                    }}
                  >
                    {borrower.arbitrationDecision}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                <X size={16} className="me-2" />
                වසන්න
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DecisionViewModal;
