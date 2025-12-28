import React from "react";
import {
  X,
  User,
  MapPin,
  CreditCard,
  DollarSign,
  Percent,
  Calendar,
  FileText,
  Building,
  Gavel,
  Scale,
  TrendingDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const BorrowerDetailsModal = ({ show, onClose, borrower }) => {
  if (!show || !borrower) return null;

  // Calculate Total
  const calculateTotal = () => {
    const outstanding = parseFloat(borrower.outstandingLoanAmount) || 0;
    const interest = parseFloat(borrower.interest) || 0;
    const fees = parseFloat(borrower.stationeryFees) || 0;
    return outstanding + interest + fees;
  };

  // Calculate decision reductions
  const originalLoanAmount = parseFloat(borrower.loanAmount || 0);
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
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          <div
            className="modal-content shadow-lg border"
            style={{ borderRadius: "12px", maxHeight: "90vh" }}
          >
            <div
              className="modal-header text-white"
              style={{
                borderRadius: "12px 12px 0 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <h5 className="modal-title fw-bold">
                <FileText size={20} className="me-2" />
                ණයගැතියාගේ සම්පූර්ණ විස්තර
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div
              className="modal-body p-4"
              style={{ maxHeight: "calc(90vh - 120px)", overflowY: "auto" }}
            >
              <div className="row g-4">
                {/* Borrower Information */}
                <div className="col-md-6">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0 fw-bold">
                        <User size={18} className="me-2" />
                        ණයගැතියාගේ තොරතුරු
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-2">
                        <strong>නම:</strong> {borrower.borrowerName}
                      </p>
                      <p className="mb-2">
                        <strong>NIC අංකය:</strong> {borrower.borrowerNIC || "-"}
                      </p>
                      <p className="mb-2">
                        <strong>ලිපිනය:</strong> {borrower.borrowerAddress}
                      </p>
                      <p className="mb-2">
                        <strong>සාමාජික අංකය:</strong> {borrower.membershipNo}
                      </p>
                      <p className="mb-2">
                        <strong>ණය අංකය:</strong> {borrower.loanNumber}
                      </p>
                      <p className="mb-0">
                        <strong>ණය ලබාගත් දිනය:</strong>{" "}
                        {borrower.registrationDate || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div className="col-md-6">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="card-header bg-success text-white">
                      <h6 className="mb-0 fw-bold">
                        <DollarSign size={18} className="me-2" />
                        ණය විස්තර
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-2">
                        <strong>ණය ස්වභාවය:</strong> {borrower.loanType || "-"}
                      </p>
                      <p className="mb-2">
                        <strong>ණය මුදල:</strong> රු.{" "}
                        {parseFloat(borrower.loanAmount).toLocaleString(
                          "si-LK"
                        )}
                      </p>
                      <p className="mb-2">
                        <strong>හිඟ ණය ශේෂය</strong> රු.{" "}
                        {parseFloat(
                          borrower.outstandingLoanAmount || 0
                        ).toLocaleString("si-LK")}
                      </p>
                      <p className="mb-2">
                        <strong>හිඟ ණය පොළිය:</strong> රු.{" "}
                        {parseFloat(borrower.interest).toLocaleString("si-LK")}
                      </p>
                      <p className="mb-2">
                        <strong>පොලී අනුපාතය:</strong> {borrower.interestRate}%
                      </p>
                      <p className="mb-0">
                        <strong>ලිපිද්‍රව්‍ය හා නඩු ගාස්තු:</strong> රු.{" "}
                        {parseFloat(
                          borrower.stationeryFees || 0
                        ).toLocaleString("si-LK")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Amount Card */}
                <div className="col-md-12">
                  <div
                    className="card border-0 shadow-sm"
                    style={{
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, #c5aef3 0%, #ebc4fc 100%)",
                    }}
                  >
                    <div className="card-body">
                      <h6 className="card-title fw-bold d-flex align-items-center text-white mb-3">
                        <CreditCard size={18} className="me-2" />
                        මුළු වටිනාකම
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-3">
                          <small className="text-white-80 d-block mb-1">
                            හිඟ ණය ශේෂය:
                          </small>
                          <div className="fw-bold text-white fs-5">
                            රු.{" "}
                            {parseFloat(
                              borrower.outstandingLoanAmount || 0
                            ).toLocaleString("si-LK")}
                          </div>
                        </div>
                        <div className="col-md-3">
                          <small className="text-white-80 d-block mb-1">
                            හිඟ ණය පොළිය:
                          </small>
                          <div className="fw-bold text-white fs-5">
                            රු.{" "}
                            {parseFloat(borrower.interest || 0).toLocaleString(
                              "si-LK"
                            )}
                          </div>
                        </div>
                        <div className="col-md-3">
                          <small className="text-white-80 d-block mb-1">
                            ලිපිද්‍රව්‍ය හා නඩු ගාස්තු:
                          </small>
                          <div className="fw-bold text-white fs-5">
                            රු.{" "}
                            {parseFloat(
                              borrower.stationeryFees || 0
                            ).toLocaleString("si-LK")}
                          </div>
                        </div>
                        <div className="col-md-3">
                          <small className="text-white-80 d-block mb-1">
                            මුළු වටිනාකම:
                          </small>
                          <div className="fw-bold text-white fs-5">
                            රු. {calculateTotal().toLocaleString("si-LK")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guarantor 1 */}
                <div className="col-md-6">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="card-header bg-warning text-dark">
                      <h6 className="mb-0 fw-bold">
                        <User size={18} className="me-2" />
                        පළමු ඇපකරු
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-2">
                        <strong>නම:</strong> {borrower.guarantor1Name}
                      </p>
                      <p className="mb-2">
                        <strong>NIC අංකය:</strong>{" "}
                        {borrower.guarantor1NIC || "-"}
                      </p>
                      <p className="mb-2">
                        <strong>ලිපිනය:</strong>{" "}
                        {borrower.guarantor1Address || "-"}
                      </p>
                      <p className="mb-0">
                        <strong>සාමාජික අංකය:</strong>{" "}
                        {borrower.guarantor1MembershipNo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guarantor 2 */}
                <div className="col-md-6">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="card-header bg-warning text-dark">
                      <h6 className="mb-0 fw-bold">
                        <User size={18} className="me-2" />
                        දෙවන ඇපකරු
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-2">
                        <strong>නම:</strong> {borrower.guarantor2Name}
                      </p>
                      <p className="mb-2">
                        <strong>NIC අංකය:</strong>{" "}
                        {borrower.guarantor2NIC || "-"}
                      </p>
                      <p className="mb-2">
                        <strong>ලිපිනය:</strong>{" "}
                        {borrower.guarantor2Address || "-"}
                      </p>
                      <p className="mb-0">
                        <strong>සාමාජික අංකය:</strong>{" "}
                        {borrower.guarantor2MembershipNo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arbitration Details */}
                {borrower.arbitrationNumber && (
                  <div className="col-12">
                    <div
                      className="card border-0 shadow-sm"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0 fw-bold">
                          <CreditCard size={18} className="me-2" />
                          තීරක තොරතුරු
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-3">
                            <small className="text-muted d-block mb-1">
                              තීරක අංකය:
                            </small>
                            <div className="fw-bold text-danger fs-5">
                              {borrower.arbitrationNumber}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <small className="text-muted d-block mb-1">
                              තීරක නිලධාරියා:
                            </small>
                            <div className="fw-semibold">
                              {borrower.assignedOfficerName || "-"}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <small className="text-muted d-block mb-1">
                              පවරා ඇති දිනය:
                            </small>
                            <div className="fw-semibold">
                              {borrower.assignedDate
                                ? new Date(
                                    borrower.assignedDate
                                  ).toLocaleDateString("si-LK")
                                : "-"}
                            </div>
                          </div>
                          <div className="col-md-3">
                            <small className="text-muted d-block mb-1">
                              තීරක ගාස්තු:
                            </small>
                            <div>
                              {borrower.arbitrationFeePaid ? (
                                <span className="badge bg-success">
                                  <CheckCircle size={12} className="me-1" />
                                  ගෙවා ඇත
                                </span>
                              ) : (
                                <span className="badge bg-danger">
                                  <AlertCircle size={12} className="me-1" />
                                  ගෙවා නැත
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ⭐ ENHANCED: Decision Details with Financial Breakdown */}
                {borrower.arbitrationDecision && (
                  <div className="col-12">
                    <div
                      className="card border-0 shadow-lg"
                      style={{ borderRadius: "8px" }}
                    >
                      <div
                        className="card-header text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        <h6 className="mb-0 fw-bold">
                          <FileText size={18} className="me-2" />
                          තීරක තීරණය - සම්පූර්ණ විස්තර
                        </h6>
                      </div>
                      <div className="card-body">
                        {/* Decision Dates */}
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <div className="card border-primary">
                              <div className="card-body p-3">
                                <small className="text-muted d-block mb-1">
                                  <Calendar size={14} className="me-1" />
                                  තීරණ දුන් දිනය
                                </small>
                                <div className="fw-bold text-primary fs-5">
                                  {borrower.decisionDate
                                    ? new Date(
                                        borrower.decisionDate
                                      ).toLocaleDateString("si-LK", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
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
                                <div className="fw-bold text-danger fs-5">
                                  {borrower.appealDueDate
                                    ? new Date(
                                        borrower.appealDueDate
                                      ).toLocaleDateString("si-LK", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial Comparison Table */}
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3 text-dark">
                            <DollarSign size={16} className="me-2" />
                            මූල්‍ය සංසන්දනය
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-bordered mb-0">
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
                                    {originalLoanAmount.toLocaleString(
                                      "si-LK",
                                      { minimumFractionDigits: 2 }
                                    )}
                                  </td>
                                  <td className="text-end fw-bold text-success">
                                    රු.{" "}
                                    {proposedLoanBalance.toLocaleString(
                                      "si-LK",
                                      { minimumFractionDigits: 2 }
                                    )}
                                  </td>
                                  <td className="text-end">
                                    {loanReduction > 0 ? (
                                      <span className="badge bg-success fs-6">
                                        <TrendingDown
                                          size={12}
                                          className="me-1"
                                        />
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
                                    {proposedLoanInterest.toLocaleString(
                                      "si-LK",
                                      { minimumFractionDigits: 2 }
                                    )}
                                  </td>
                                  <td className="text-end">
                                    {interestReduction > 0 ? (
                                      <span className="badge bg-success fs-6">
                                        <TrendingDown
                                          size={12}
                                          className="me-1"
                                        />
                                        රු.{" "}
                                        {interestReduction.toLocaleString(
                                          "si-LK",
                                          { minimumFractionDigits: 2 }
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </td>
                                </tr>
                                {borrower.caseFees &&
                                  parseFloat(borrower.caseFees) > 0 && (
                                    <tr>
                                      <td className="fw-semibold">
                                        නඩු ගාස්තු
                                      </td>
                                      <td className="text-end">-</td>
                                      <td className="text-end fw-bold text-info">
                                        රු.{" "}
                                        {parseFloat(
                                          borrower.caseFees
                                        ).toLocaleString("si-LK", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </td>
                                      <td className="text-end">-</td>
                                    </tr>
                                  )}
                                <tr
                                  style={{
                                    backgroundColor: "#f0f9ff",
                                    borderTop: "3px solid #ddd",
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
                                    {loanReduction + interestReduction > 0 && (
                                      <span className="badge bg-success fs-6">
                                        <TrendingDown
                                          size={14}
                                          className="me-1"
                                        />
                                        රු.{" "}
                                        {(
                                          loanReduction + interestReduction
                                        ).toLocaleString("si-LK", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Forward Interest */}
                        {(borrower.forwardInterest ||
                          borrower.forwardInterestRate) && (
                          <div
                            className="alert alert-success mb-3"
                            style={{ borderRadius: "8px" }}
                          >
                            <h6 className="fw-bold mb-2">
                              <Percent size={16} className="me-2" />
                              ඉදිරියට පොළිය
                            </h6>
                            <div className="row">
                              {borrower.forwardInterest && (
                                <div className="col-md-6">
                                  <small className="d-block">
                                    ඉදිරියට පොළිය:
                                  </small>
                                  <strong className="fs-5">
                                    රු.{" "}
                                    {parseFloat(
                                      borrower.forwardInterest
                                    ).toLocaleString("si-LK", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </strong>
                                </div>
                              )}
                              {borrower.forwardInterestRate && (
                                <div className="col-md-6">
                                  <small className="d-block">
                                    ඉදිරියට පොළී අනුපාතය:
                                  </small>
                                  <strong className="fs-5">
                                    {borrower.forwardInterestRate}%
                                  </strong>
                                </div>
                              )}
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
                            <h6 className="fw-bold mb-2">
                              <TrendingDown size={16} className="me-2" />
                              ප්‍රදානයේදී කපහැරීම්
                            </h6>
                            <div className="row">
                              {borrower.deductionsFromLoanAmount && (
                                <div className="col-md-6">
                                  <small className="d-block">ණය මුදලෙන්:</small>
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
                                  <small className="d-block">පොලියෙන්:</small>
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
                        <div className="mt-3">
                          <h6 className="fw-bold mb-2 text-dark">
                            <FileText size={16} className="me-2" />
                            තීරණය / සටහන්
                          </h6>
                          <div
                            className="p-3 bg-light border rounded"
                            style={{
                              whiteSpace: "pre-wrap",
                              maxHeight: "250px",
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
                  </div>
                )}

                {/* Legal Case Details */}
                {(borrower.assignedLegalOfficerId ||
                  borrower.status === "legal-case" ||
                  borrower.status === "payment-pending") && (
                  <div className="col-12">
                    <div
                      className="card border-0 shadow-sm"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0 fw-bold">
                          <Scale size={18} className="me-2" />
                          නීතිමය නඩු විස්තර
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1">
                              <User size={14} className="me-1" />
                              නීති නිලධාරියා:
                            </small>
                            <div className="fw-semibold">
                              {borrower.assignedLegalOfficerName ? (
                                <span className="badge bg-info fs-6">
                                  {borrower.assignedLegalOfficerName}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1">
                              <Building size={14} className="me-1" />
                              උසාවිය:
                            </small>
                            <div className="fw-semibold">
                              {borrower.assignedCourtName ? (
                                <span className="badge bg-secondary fs-6">
                                  {borrower.assignedCourtName}
                                </span>
                              ) : (
                                <span className="text-muted">- පවරා නැත -</span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1">
                              <Calendar size={14} className="me-1" />
                              නීති නිලධාරියාට පවරා ඇති දිනය:
                            </small>
                            <div className="fw-semibold">
                              {borrower.legalAssignmentDate
                                ? new Date(
                                    borrower.legalAssignmentDate
                                  ).toLocaleDateString("si-LK")
                                : "-"}
                            </div>
                          </div>

                          {borrower.status === "payment-pending" && (
                            <div className="col-12">
                              <div
                                className="alert alert-warning mb-0"
                                style={{ borderRadius: "6px" }}
                              >
                                <strong>⚠️ ගෙවීම් තත්වය:</strong> තීරණයෙන් පසු
                                ගෙවීම් සිදු නොකර ඇත
                                {borrower.approvedForDistrictDate && (
                                  <div className="mt-2">
                                    <small>
                                      දිස්ත්‍රික් කාර්යාලයට යැවූ දිනය:{" "}
                                      {new Date(
                                        borrower.approvedForDistrictDate
                                      ).toLocaleDateString("si-LK")}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Court Judgment Details */}
                {borrower.judgmentResult && (
                  <div className="col-12">
                    <div
                      className="card border-warning border-2"
                      style={{
                        borderRadius: "6px",
                        backgroundColor: "#fff8e1",
                      }}
                    >
                      <div className="card-body">
                        <h6 className="card-title fw-bold border-bottom border-warning pb-2 mb-3 d-flex align-items-center text-dark">
                          <Gavel size={18} className="me-2" />
                          නඩු තීන්දු විස්තර
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1">
                              <Calendar size={14} className="me-1" />
                              නඩු දිනය:
                            </small>
                            <div className="fw-semibold text-dark">
                              {borrower.judgmentDate
                                ? new Date(
                                    borrower.judgmentDate
                                  ).toLocaleDateString("si-LK")
                                : "-"}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1">
                              <FileText size={14} className="me-1" />
                              නඩු අංකය:
                            </small>
                            <div className="fw-bold text-primary fs-6">
                              {borrower.judgmentNumber || "-"}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1">
                              තත්වය:
                            </small>
                            <div>
                              <span className="badge bg-success fs-6">
                                නඩු තීන්දුව ලබා දී ඇත
                              </span>
                            </div>
                          </div>
                          <div className="col-12 mt-3">
                            <small className="text-muted d-block mb-2">
                              <Gavel size={14} className="me-1" />
                              නඩු තීන්දුව:
                            </small>
                            <div className="fw-normal text-dark p-3 bg-white border rounded">
                              {borrower.judgmentResult}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ borderRadius: "6px" }}
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

export default BorrowerDetailsModal;

