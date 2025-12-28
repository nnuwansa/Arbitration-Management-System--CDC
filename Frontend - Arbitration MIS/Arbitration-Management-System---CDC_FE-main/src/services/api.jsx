const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://arbitration-management-system-cdc-production.up.railway.app/api";

const api = {
  async request(endpoint, options = {}) {
    // Get token from sessionStorage instead of in-memory
    const token = sessionStorage.getItem("token");

    console.log(`🌐 API Request to ${endpoint}:`);
    console.log("- Token available:", token ? "✓" : "✗");

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(
        "- Authorization header added:",
        headers.Authorization.substring(0, 20) + "..."
      );
    } else {
      console.warn("⚠️ No token available for this request!");
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log(`📊 Response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `Request failed with status ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error("❌ API Error:", error);
      throw error;
    }
  },

  /**
   * Token Management Methods
   */
  setToken(token) {
    console.log("🔑 Setting token in sessionStorage");
    sessionStorage.setItem("token", token);
  },

  getToken() {
    return sessionStorage.getItem("token");
  },

  clearToken() {
    console.log("🗑️ Clearing token from sessionStorage");
    sessionStorage.removeItem("token");
  },

  // ==================== AUTH ENDPOINTS ====================

  login: (data) =>
    api.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signup: (data) =>
    api.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ==================== DISTRICT ENDPOINTS ====================

  getDistricts: () => api.request("/districts"),

  // ==================== SOCIETY ENDPOINTS ====================

  getSocieties: () => api.request("/societies"),

  getSocietiesByDistrict: (districtId) =>
    api.request(`/societies/district/${districtId}`),

  getSocietyById: (societyId) => api.request(`/societies/${societyId}`),

  createSociety: (data) =>
    api.request("/societies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteSociety: (societyId) =>
    api.request(`/societies/${societyId}`, {
      method: "DELETE",
    }),

  getAvailableSocietiesForRegistration: (districtId) =>
    api.request(`/societies/district/${districtId}/available-for-registration`),

  getSocietiesWithoutUserAccount: () =>
    api.request("/societies/without-account"),

  // ==================== OFFICER ENDPOINTS ====================

  getOfficersByDistrict: (districtId) =>
    api.request(`/officers/district/${districtId}`),

  getAvailableOfficersForRegistration: (districtId) =>
    api.request(`/officers/district/${districtId}/available-for-registration`),

  createOfficer: (data) =>
    api.request("/officers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteOfficer: (officerId) =>
    api.request(`/officers/${officerId}`, {
      method: "DELETE",
    }),

  // ==================== LEGAL OFFICER ENDPOINTS ====================

  getLegalOfficersByDistrict: (districtId) =>
    api.request(`/legal-officers/district/${districtId}`),

  getAvailableLegalOfficersForRegistration: (districtId) =>
    api.request(
      `/legal-officers/district/${districtId}/available-for-registration`
    ),

  createLegalOfficer: (data) =>
    api.request("/legal-officers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLegalOfficer: (officerId, officerData) =>
    api.request(`/legal-officers/${officerId}`, {
      method: "PUT",
      body: JSON.stringify(officerData),
    }),

  getLegalOfficerById: (officerId) =>
    api.request(`/legal-officers/${officerId}`),

  getLegalOfficersByCourtId: (courtId) =>
    api.request(`/legal-officers/court/${courtId}`),

  assignCourtToLegalOfficer: (officerId, courtId) =>
    api.request(`/legal-officers/${officerId}/assign-court/${courtId}`, {
      method: "POST",
    }),

  removeCourtFromLegalOfficer: (officerId, courtId) =>
    api.request(`/legal-officers/${officerId}/remove-court/${courtId}`, {
      method: "DELETE",
    }),

  deleteLegalOfficer: (legalOfficerId) =>
    api.request(`/legal-officers/${legalOfficerId}`, {
      method: "DELETE",
    }),

  // ==================== COURT ENDPOINTS ====================

  createCourt: (courtData) =>
    api.request("/courts", {
      method: "POST",
      body: JSON.stringify(courtData),
    }),

  updateCourt: (courtId, courtData) =>
    api.request(`/courts/${courtId}`, {
      method: "PUT",
      body: JSON.stringify(courtData),
    }),

  deleteCourt: (courtId) =>
    api.request(`/courts/${courtId}`, {
      method: "DELETE",
    }),

  getAllCourts: () => api.request("/courts"),

  getCourtsByDistrict: (districtId) =>
    api.request(`/courts/district/${districtId}`),

  getCourtById: (courtId) => api.request(`/courts/${courtId}`),

  // ==================== SUBMISSION ENDPOINTS ====================

  getOfficerAssignedBorrowers: () =>
    api.request("/submissions/officer/my-borrowers"),

  createSubmission: (data) =>
    api.request("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approveSubmission: (id) =>
    api.request(`/submissions/${id}/approve`, { method: "PUT" }),

  rejectSubmission: (id, reason) =>
    api.request(`/submissions/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  getSubmissionsBySociety: (societyId) =>
    api.request(`/submissions/society/${societyId}`),

  getPendingApprovalsBySociety: (societyId) =>
    api.request(`/submissions/society/${societyId}/pending`),

  getApprovedSubmissionsByDistrict: (districtId) =>
    api.request(`/submissions/district/${districtId}/approved`),

  getSubmissionById: (submissionId) =>
    api.request(`/submissions/${submissionId}`),

  updateMultipleArbitrationFees: (submissionId, borrowerIds) =>
    api.request(
      `/submissions/${submissionId}/borrowers/batch-arbitration-fee`,
      {
        method: "PUT",
        body: JSON.stringify(borrowerIds),
      }
    ),

  getSubmissionsByDistrict: (districtId) =>
    api.request(`/submissions/district/${districtId}`),

  updateArbitrationFee: (submissionId, borrowerId, isPaid) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/arbitration-fee`,
      {
        method: "PUT",
        body: JSON.stringify({ isPaid }),
      }
    ),

  addArbitrationDecision: (submissionId, borrowerId, data) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/decision`,
      { method: "PUT", body: JSON.stringify(data) }
    ),

  // ==================== ⭐ NEW: DOCUMENT DEFICIENCY & ENHANCED WORKFLOW ====================

  /**
   * ⭐ STEP 1: Check document deficiencies
   */
  checkDocumentDeficiencies: (submissionId, borrowerId, deficiencies) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/check-deficiencies`,
      {
        method: "PUT",
        body: JSON.stringify({ deficiencies }),
      }
    ),

  /**
   * ⭐ STEP 2: Mark fee paid + Assign officer + Generate arbitration number (combined)
   */
  // markFeePaidAndAssignOfficer: (submissionId, borrowerId, assignedOfficerId) =>
  //   api.request(
  //     `/submissions/${submissionId}/borrowers/${borrowerId}/mark-fee-and-assign`,
  //     {
  //       method: "PUT",
  //       body: JSON.stringify({ assignedOfficerId }),
  //     }
  //   ),

  // In api.js - Update this function:

  // markFeePaidAndAssignOfficer: (
  //   submissionId,
  //   borrowerId,
  //   assignedOfficerId,
  //   arbitrationFeePaid = true
  // ) =>
  //   api.request(
  //     `/submissions/${submissionId}/borrowers/${borrowerId}/mark-fee-and-assign`,
  //     {
  //       method: "PUT",
  //       body: JSON.stringify({
  //         assignedOfficerId,
  //         arbitrationFeePaid, // ✅ Now includes the fee status
  //       }),
  //     }
  //   ),
  // In api.js - Simplified to only pass officer ID
  markFeePaidAndAssignOfficer: (
    submissionId,
    borrowerId,
    assignedOfficerId,
    arbitrationFeePaid = true
  ) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/mark-fee-and-assign`,
      {
        method: "PUT",
        body: JSON.stringify({
          assignedOfficerId,
          arbitrationFeePaid,
        }),
      }
    ),
  /**
   * ⭐ STEP 3: Add detailed arbitration decision
   */
  addDetailedArbitrationDecision: (submissionId, borrowerId, decisionPayload) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/add-decision`,
      {
        method: "PUT",
        body: JSON.stringify(decisionPayload),
      }
    ),

  // ==================== PAYMENT STATUS AFTER DECISION ====================

  updatePaymentStatusAfterDecision: (submissionId, borrowerId, isPaid) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/payment-status`,
      {
        method: "PUT",
        body: JSON.stringify({ isPaid }),
      }
    ),

  getUnpaidBorrowersAfterDecision: (societyId) =>
    api.request(`/submissions/society/${societyId}/unpaid-after-decision`),

  getPaymentPendingCases: (districtId) =>
    api.request(`/submissions/district/${districtId}/payment-pending`),

  // ==================== LEGAL ACTION SUBMISSION ====================

  submitCasesToLegalAction: (cases) =>
    api.request("/submissions/submit-to-legal-action", {
      method: "POST",
      body: JSON.stringify(cases),
    }),

  // ==================== LEGAL OFFICER ASSIGNMENT ====================

  assignLegalOfficerToBorrower: (
    submissionId,
    borrowerId,
    legalOfficerId,
    courtId
  ) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/assign-legal-officer`,
      {
        method: "PUT",
        body: JSON.stringify({ legalOfficerId, courtId }),
      }
    ),

  batchAssignLegalOfficer: (assignments) =>
    api.request(`/submissions/batch-assign-legal-officer`, {
      method: "POST",
      body: JSON.stringify(assignments),
    }),

  // ==================== LEGAL OFFICER CASES ====================

  getLegalOfficerAssignedCases: () =>
    api.request(`/submissions/legal-officer/my-cases`),

  addJudgment: (submissionId, borrowerId, judgmentData) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/judgment`,
      {
        method: "PUT",
        body: JSON.stringify(judgmentData),
      }
    ),

  /**
   * Update judgment number for a specific borrower
   * @param {string} submissionId - Submission ID
   * @param {string} borrowerId - Borrower ID
   * @param {Object} data - { judgmentNumber: "value" }
   */
  updateJudgmentNumber: (submissionId, borrowerId, data) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/judgment-number`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  // ==================== USER MANAGEMENT ENDPOINTS ====================

  getAllUsers: () => api.request("/users"),

  getUsersByDistrict: (districtId) =>
    api.request(`/users/district/${districtId}`),

  getUserById: (userId) => api.request(`/users/${userId}`),

  updateUser: (userId, userData) =>
    api.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  changeUserPassword: (userId, newPassword) =>
    api.request(`/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    }),

  toggleUserStatus: (userId) =>
    api.request(`/users/${userId}/toggle-status`, {
      method: "PUT",
    }),

  deleteUser: (userId) =>
    api.request(`/users/${userId}`, {
      method: "DELETE",
    }),

  getUserStatistics: (districtId = null) => {
    const params = districtId ? `?districtId=${districtId}` : "";
    return api.request(`/users/statistics${params}`);
  },

  // ==================== UNPAID CASE APPROVAL WORKFLOW ====================

  submitUnpaidCasesToApproval: (cases) =>
    api.request(`/submissions/submit-unpaid-to-approval`, {
      method: "POST",
      body: JSON.stringify(cases),
    }),

  getUnpaidCasesPendingApproval: (societyId) =>
    api.request(`/submissions/society/${societyId}/unpaid-pending-approval`),

  approveUnpaidCasesAndSendToDistrict: (cases) =>
    api.request(`/submissions/approve-unpaid-and-send-to-district`, {
      method: "POST",
      body: JSON.stringify(cases),
    }),

  // ==================== COURT PAYMENT & LEGAL REMARKS ====================

  addCourtPayment: (submissionId, borrowerId, paymentData) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/court-payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    ),

  deleteCourtPayment: (submissionId, borrowerId, paymentId) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/court-payment/${paymentId}`,
      {
        method: "DELETE",
      }
    ),

  updateLegalRemarks: (submissionId, borrowerId, remarksData) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/remarks`,
      {
        method: "PUT",
        body: JSON.stringify(remarksData),
      }
    ),

  // ==================== COURT DECISIONS ENDPOINTS ====================

  getCasesWithCourtDecisions: (societyId) =>
    api.request(`/submissions/society/${societyId}/court-decisions`),

  getDistrictCourtDecisions: (districtId) =>
    api.request(`/submissions/district/${districtId}/court-decisions`),

  getProvincialCourtDecisions: () =>
    api.request(`/submissions/provincial/court-decisions`),

  // ==================== LEGAL OFFICER JUDGMENT & PAYMENT MANAGEMENT ====================

  /**
   * Get all cases assigned to the current legal officer
   */
  getLegalOfficerAssignedCases: () =>
    api.request("/submissions/legal-officer/my-cases"),

  /**
   * Add a judgment entry (hearing date and result)
   * @param {string} submissionId - Submission ID
   * @param {string} borrowerId - Borrower ID
   * @param {Object} judgmentData - { judgmentDate, judgmentNumber, judgmentResult }
   */
  addJudgmentEntry: (submissionId, borrowerId, judgmentData) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/add-judgment`,
      {
        method: "POST",
        body: JSON.stringify(judgmentData),
      }
    ),

  /**
   * Delete a specific judgment entry
   * @param {string} submissionId - Submission ID
   * @param {string} borrowerId - Borrower ID
   * @param {string} judgmentId - Judgment ID to delete
   */
  deleteJudgmentEntry: (submissionId, borrowerId, judgmentId) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/judgments/${judgmentId}`,
      {
        method: "DELETE",
      }
    ),

  /**
   * Add a court payment record
   * @param {string} submissionId - Submission ID
   * @param {string} borrowerId - Borrower ID
   * @param {Object} paymentData - { amount, paymentDate }
   */
  addCourtPayment: (submissionId, borrowerId, paymentData) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/court-payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    ),

  /**
   * Delete a court payment record
   * @param {string} submissionId - Submission ID
   * @param {string} borrowerId - Borrower ID
   * @param {string} paymentId - Payment ID to delete
   */
  deleteCourtPayment: (submissionId, borrowerId, paymentId) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/court-payment/${paymentId}`,
      {
        method: "DELETE",
      }
    ),

  /**
   * Update legal officer remarks for a case
   * @param {string} submissionId - Submission ID
   * @param {string} borrowerId - Borrower ID
   * @param {Object} remarksData - { remarks }
   */
  updateLegalRemarks: (submissionId, borrowerId, remarksData) =>
    api.request(
      `/submissions/${submissionId}/borrowers/${borrowerId}/remarks`,
      {
        method: "PUT",
        body: JSON.stringify(remarksData),
      }
    ),

  /**
   * Generate monthly payment report (CSV file)
   * Downloads as CSV file for the specified month
   * @param {number} year - Year (e.g., 2025)
   * @param {number} month - Month (1-12)
   * @returns {Promise<Blob>} - CSV file blob
   */
  generateMonthlyPaymentReport: (year, month) =>
    api
      .request(
        `/submissions/legal-officer/monthly-payment-report?year=${year}&month=${month}`
      )
      .then((response) => {
        // If response is a blob, return it directly
        if (response instanceof Blob) {
          return response;
        }
        // Otherwise, convert to blob
        return new Blob([JSON.stringify(response)], { type: "text/csv" });
      }),
};

export default api;
