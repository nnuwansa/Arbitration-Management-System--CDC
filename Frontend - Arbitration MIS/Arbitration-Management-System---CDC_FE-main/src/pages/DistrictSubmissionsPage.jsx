import React, { useState, useEffect } from "react";
import {
  Download,
  DollarSign,
  TrendingDown,
  X,
  Percent,
  CheckCircle,
  Building,
  FileText,
  Eye,
  AlertCircle,
  FileCheck,
  Search,
  MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import BorrowerDetailsModal from "../components/BorrowerDetailsModal";
import DeficiencyCheckModal from "../components/DeficiencyCheckModal";
import MarkFeePaidModal from "../components/MarkFeePaidModal";
import DecisionModal from "../components/DecisionModal";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
} from "docx";

import { Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";

import { saveAs } from "file-saver";

const DistrictSubmissionsPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [allSubmissionsData, setAllSubmissionsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedDecisionBorrower, setSelectedDecisionBorrower] =
    useState(null);
  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false);
  const [showMarkFeeModal, setShowMarkFeeModal] = useState(false);

  // ⭐ NEW: Decision View Modal
  const [showDecisionViewModal, setShowDecisionViewModal] = useState(false);
  const [selectedDecisionView, setSelectedDecisionView] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [filterDeficiencyStatus, setFilterDeficiencyStatus] = useState("all");

  const isProvincialAdmin = user?.roles?.includes("PROVINCIAL_ADMIN");

  useEffect(() => {
    if (isProvincialAdmin) {
      loadAllDistrictsData();
    } else {
      loadSubmissions();
    }
  }, []);

  useEffect(() => {
    if (isProvincialAdmin) {
      applyFilters();
    }
  }, [
    searchTerm,
    filterDistrict,
    filterStatus,
    filterPaymentStatus,
    filterDeficiencyStatus,
    allSubmissionsData,
  ]);

  const loadAllDistrictsData = async () => {
    setLoading(true);
    try {
      const districtsData = await api.getDistricts();
      setDistricts(districtsData);

      const allBorrowers = [];

      for (const district of districtsData) {
        try {
          const districtSubmissions =
            await api.getApprovedSubmissionsByDistrict(district.id);

          districtSubmissions.forEach((submission) => {
            submission.borrowers.forEach((borrower) => {
              allBorrowers.push({
                ...borrower,
                submissionId: submission.id,
                societyName: submission.societyName,
                districtName: district.name,
                districtId: district.id,
                approvedDate: submission.approvedDate,
                submittedDate: submission.submittedDate,
              });
            });
          });
        } catch (err) {
          console.error(`Error loading ${district.name}:`, err);
        }
      }

      allBorrowers.sort((a, b) => {
        const dateA = new Date(a.approvedDate || a.submittedDate || 0);
        const dateB = new Date(b.approvedDate || b.submittedDate || 0);
        return dateB - dateA;
      });

      setAllSubmissionsData(allBorrowers);
    } catch (err) {
      console.error("Error loading all districts:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allSubmissionsData];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (borrower) =>
          borrower.borrowerName?.toLowerCase().includes(search) ||
          borrower.arbitrationNumber?.toLowerCase().includes(search) ||
          borrower.loanNumber?.toLowerCase().includes(search) ||
          borrower.societyName?.toLowerCase().includes(search) ||
          borrower.districtName?.toLowerCase().includes(search)
      );
    }

    if (filterDistrict !== "all") {
      filtered = filtered.filter((b) => b.districtId === filterDistrict);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((b) => {
        switch (filterStatus) {
          case "pending":
            return !b.arbitrationFeePaid && !b.documentDeficienciesChecked;
          case "deficiency-checked":
            return b.documentDeficienciesChecked && !b.arbitrationFeePaid;
          case "assigned":
            return b.assignedOfficerId && b.status !== "decision-given";
          case "decision":
            return b.status === "decision-given";
          case "not-assigned":
            return !b.assignedOfficerId;
          default:
            return true;
        }
      });
    }

    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter((b) => {
        if (filterPaymentStatus === "paid") return b.arbitrationFeePaid;
        if (filterPaymentStatus === "unpaid") return !b.arbitrationFeePaid;
        return true;
      });
    }

    if (filterDeficiencyStatus !== "all") {
      filtered = filtered.filter((b) => {
        if (filterDeficiencyStatus === "checked")
          return b.documentDeficienciesChecked;
        if (filterDeficiencyStatus === "not-checked")
          return !b.documentDeficienciesChecked;
        if (filterDeficiencyStatus === "found")
          return b.documentDeficiencies && b.documentDeficiencies !== "NONE";
        return true;
      });
    }

    setFilteredData(filtered);
  };

  const loadSubmissions = async () => {
    try {
      const data = await api.getApprovedSubmissionsByDistrict(user.district);
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.approvedDate || a.submittedDate || 0);
        const dateB = new Date(b.approvedDate || b.submittedDate || 0);
        return dateB - dateA;
      });
      setSubmissions(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAssignmentLetter = async (borrower, submissionId) => {
    try {
      // Fetch full submission data to get society name
      const fullSubmission = await api.getSubmissionById(submissionId);

      // Calculate total amount
      const totalAmount =
        parseFloat(borrower.loanAmount) + parseFloat(borrower.interest);

      // Get society name from fullSubmission (like your original code)
      const societyName = fullSubmission.societyName || "සමිතිය";
      const districtName =
        fullSubmission.districtName || borrower.districtName || "දිස්ත්‍රික්කය";

      // Format today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateStr = `${year}.${month}.${day}`;

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: "Iskoola Pota", size: 24 },
            },
          },
        },
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
              },
            },
            children: [
              // Top border
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 0, after: 100 },
                border: {
                  bottom: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 24,
                  },
                },
                children: [],
              }),

              // Arbitration number - right aligned
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 200, after: 200 },
                children: [
                  new TextRun({
                    text: `තීරක අංකය: ${
                      borrower.arbitrationNumber ||
                      "..........................."
                    }`,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                ],
              }),

              // Title - centered and underlined
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 },
                children: [
                  new TextRun({
                    text: "ආරවුලක් නිරවුල් කිරීමට භාර කිරීම ( ණය මුදල් )",
                    font: "Iskoola Pota",
                    size: 24,
                    bold: true,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                ],
              }),

              // Main body paragraph
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 100, after: 100, line: 360 },
                children: [
                  new TextRun({
                    text: `1953 අංක 04 දරණ සමුපකාර සමිති (සංශෝධන) පනතෙහි සංශෝධිත මධ්‍යම පළාත් සභාවේ 1000 අංක 10 දරණ සමුපකාර සමිති ආඥා පනතේ 58 වන වගන්තිය සහ (අ) වෙනි ප්‍රඥප්තියේ 51 වගන්ති හා 53 (1) (ඇ) වගන්ති යටතේ රෙජිස්ට්‍රාර්වරයා වෙත පැවරී ඇති බලයන්ත අනුව `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: `අංක ${"............................. හා ................................"}`,
                    font: "Iskoola Pota",
                    size: 22,
                    // underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: ` දරණ ගැසට් පත්‍රයේ සඳහන් කරන ලද නිවේදනයෙන් මා වෙත පවරන ලද බලය අනුව මධ්‍යම පළාතේ සමුපකාර සංවර්ධන සහකාර කොමසාරිස් / නියෝජ්‍ය කොමසාරිස් ............................ වන මම, පැමිණිලිකරු වශයෙන් ලියාපදිංචි සමුපකාර සමිතියක් වන `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: societyName,
                    font: "Iskoola Pota",
                    size: 22,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: ` හා විත්තිකරුවන් වශයෙන් එකී සමිතියේ සාමාජිකයින් වන ණයකාර (සම්පුර්ණ නම ) `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: borrower.borrowerName,
                    font: "Iskoola Pota",
                    size: 22,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: ` ගෙන් සහ ඇපකාර `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: borrower.guarantor1Name,
                    font: "Iskoola Pota",
                    size: 22,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: ` සහ `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: borrower.guarantor2Name,
                    font: "Iskoola Pota",
                    size: 22,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: ` අතර ණය මුදල වශයෙන්  .................................................................`,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: `(රු. ${parseFloat(
                      borrower.loanAmount
                    ).toLocaleString("si-LK")})`,
                    font: "Iskoola Pota",
                    size: 22,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: `කුත් ප්‍රදානය දෙන  දින දක්වා අවුරුදු පතා සියයට  `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: `${borrower.interestRate}%`,
                    font: "Iskoola Pota",
                    size: 22,
                    underline: { type: UnderlineType.SINGLE },
                  }),
                  new TextRun({
                    text: ` බැගින් පොලියත්, නඩු වියදමත් ප්‍රදානය දුන් දින සිට මුළු මුදල ගෙවා නිම වන තුරු අවුරුදු පතා මුල් මුදලට සියයට ....................... `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: ` බැගින් වැඩි දුරටත් පොළියත්, පැමිණිලිකාර සමිතියට අයවිය යුතුද යනුවෙන් පැන නැග  තිබෙන ආරවුල මීට අමුණා ඇති ලියවිල්ලෙන් මා වෙත ඉදිරිපත් ලදින්. එම ආරවුල නිරවුල් කොට තීන්දුවක් දීම සදහා ආරවුල් බේරුම්කරු (තීරක තැන ) වශයෙන් `,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                  new TextRun({
                    text: borrower.assignedOfficerName || "තීරක නිලධාරි",
                    font: "Iskoola Pota",
                    size: 22,
                    underline: { type: UnderlineType.DOTTED },
                  }),
                  new TextRun({
                    text: ` මහතා / මිය / මෙනවිය මෙයින් පත් කරමි.`,
                    font: "Iskoola Pota",
                    size: 22,
                  }),
                ],
              }),

              // Department (left) and Signature (right) in same lines using invisible table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  // Row 1: Department name (left) | Signature dots (right)
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { before: 300 },
                            children: [
                              new TextRun({
                                text: "මධ්‍යම පළාත් සමුපකාර සංවර්ධන දෙපාර්තමේන්තුව",
                                font: "Iskoola Pota",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 300 },
                            children: [
                              new TextRun({
                                text: "...................................................",
                                font: "Iskoola Pota",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),

                  // Row 2: Assistant Commissioner (left) | Commissioner title (right)
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.LEFT,
                            children: [
                              new TextRun({
                                text: "සමුපකාර සංවර්ධන සහකාර කොමසාරිස්,",
                                font: "Iskoola Pota",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: "සමුපකාර සංවර්ධන සහකාර කොමසාරිස් /",
                                font: "Iskoola Pota",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),

                  // Row 3: District name (left) | Deputy Commissioner (right)
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.LEFT,
                            children: [
                              new TextRun({
                                text: districtName,
                                font: "Iskoola Pota",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: "නියෝජ්‍ය කොමසාරිස්",
                                font: "Iskoola Pota",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),

                  // Row 4: Date (left) | Empty (right)
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { before: 200 },
                            children: [
                              new TextRun({
                                text: `දිනය: ${dateStr}`,
                                font: "Iskoola Pota",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                        children: [
                          new Paragraph({
                            children: [],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Notes section
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 300, after: 100, line: 360 },
                children: [
                  new TextRun({
                    text: " * ආරවුලේ එක් පාර්ශවයක් ඇපකරුවෙකු නොවන (අ) වගන්තිය කපා හරින්න. මෙහි සම්පූර්ණ නම් සඳහන් කරන්න.",
                    font: "Iskoola Pota",
                    size: 20,
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 50, after: 100, line: 360 },
                children: [
                  new TextRun({
                    text: "* මෙහි පැමිණිලිකරුගේ හෝ විත්තිකරුගේ තත්වය දක්වන්න.එනම් ලියාපදිංචි කරන ලද සමිතියක් හෝ හිටපු සාමාජිකයෙකු හෝ හිටපු/ මියගිය /සාමාජිකයෙකු  වෙනුවෙන් ඉල්ලන්නෙකු හෝ හිටපු කාරක සභාව නිලධාරියෙකු සේවකයෙකු හෝ මියගිය නිලධාරියෙකු / සේවකයෙකු  නීත්‍යනුකූල නියෝජිතයෙකු / උරුමක්කාරයෙකු / බලා වයස්කාරයෙකු  උරුමක්කරයෙකුගේ  භාරකාරයෙකු  හෝ / යන වගද ) යම් පාර්ශවයක් ඈවරකරුවෙකු වන විට ලියාපදිංචි වන විට ලියාපදිංචි කළ සමිතියක............................................................................ ඈවරකරුවෙකු යනුවෙන්ද සදහන් කළ යුතුය..",
                    font: "Iskoola Pota",
                    size: 18,
                  }),
                ],
              }),

              // Bottom border
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 200, after: 0 },
                border: {
                  top: {
                    color: "000000",
                    space: 1,
                    value: "single",
                    size: 24,
                  },
                },
                children: [],
              }),
            ],
          },
        ],
      });

      // Generate blob and trigger download
      const blob = await Packer.toBlob(doc);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeArbitrationNumber = (
        borrower.arbitrationNumber || "document"
      ).replace(/\//g, "_");
      link.download = `තීරක නිලධාරි_පත් කිරීම_${safeArbitrationNumber}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("තීරක නිලධාරි_පත් කිරීමේ ලිපිය බාගත කරන ලදී");
    } catch (error) {
      console.error("Error generating assignment letter:", error);
      alert("ලිපිය නිර්මාණය කිරීමේදී දෝෂයක් ඇතිවිය: " + error.message);
    }
  };

  const getStatusBadge = (borrower) => {
    if (!borrower.documentDeficienciesChecked) {
      return <span className="badge bg-secondary">ලිපිගොනු පරීක්ෂා නොකළ</span>;
    }
    if (
      borrower.documentDeficiencies &&
      borrower.documentDeficiencies !== "NONE"
    ) {
      return <span className="badge bg-danger">අඩුපාඩු තිබේ</span>;
    }
    if (!borrower.arbitrationFeePaid) {
      return (
        <span className="badge bg-warning text-dark">ගාස්තුව ගෙවා නැත</span>
      );
    }
    if (!borrower.assignedOfficerId) {
      return <span className="badge bg-info">නිලධාරි වෙත පවරා නැත</span>;
    }
    if (borrower.status === "decision-given") {
      return <span className="badge bg-success">තීන්දුව ලබා දී ඇත</span>;
    }
    return <span className="badge bg-primary">පවරා ඇත</span>;
  };

  // Decision View Modal Component
  const DecisionViewModal = ({ show, onClose, borrower }) => {
    if (!show || !borrower || !borrower.arbitrationDecision) return null;

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
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <div
                className="modal-header text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold">
                  <FileText size={20} className="me-2" />
                  තීරක තීන්දුව - {borrower.borrowerName}
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
                      <small className="text-muted d-block">
                        තීරක නිලධාරි:
                      </small>
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
                        <div className="fw-bold text-danger">
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
                              {originalLoanAmount.toLocaleString("si-LK", {
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
                      තීන්දුව / සටහන්
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">ගාණනය කරමින්...</p>
      </div>
    );
  }

  // Provincial Admin View
  if (isProvincialAdmin) {
    return (
      <div>
        <div className="mb-4">
          <h2 className="fw-bold">
            සියලුම දිස්ත්‍රික්කවල තීරකකරණය සදහා ඉදිරිපත් කිරීම්
          </h2>
          <p className="text-muted">
            මධ්‍ය පළාතේ සියලුම දිස්ත්‍රික්ක වල ඉදිරිපත් කිරීම්
          </p>
        </div>

        {/* Search and Filters */}
        <div
          className="card mb-4 border-0 shadow-sm"
          style={{ borderRadius: "15px" }}
        >
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
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
                    placeholder="නම, තීරක අංකය හෝ ණය අංකය..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: "0 10px 10px 0" }}
                  />
                </div>
              </div>
              <div className="col-md-3">
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
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="all">සියලු තත්වයන්</option>
                  <option value="pending">පරීක්ෂා ඉතිරිව ඇත</option>
                  <option value="deficiency-checked">පරීක්ෂා සම්පූර්ණ</option>
                  <option value="assigned">තීරක නිලධාරීන්ට පවරා ඇත</option>
                  <option value="decision">තීරණ ලබා දී ඇත</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterDeficiencyStatus}
                  onChange={(e) => setFilterDeficiencyStatus(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="all">සියලු ලිපිගොනු තත්වයන්</option>
                  <option value="checked">පරීක්ෂා සම්පූර්ණ</option>
                  <option value="not-checked">පරීක්ෂා නොකළ</option>
                  <option value="found">අඩුපාඩු තිබේ</option>
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
            <AlertCircle size={18} className="me-2" />
            සෙවුම් ප්‍රතිඵල හමු නොවීය
          </div>
        ) : (
          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div
              className="card-header text-white"
              style={{
                background: "linear-gradient(135deg, #8f9ddc 0%, #ad88d2 100%)",
                borderRadius: "15px 15px 0 0",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">
                  ඉදිරිපත් කළ ණයකරුවන් ({filteredData.length})
                </h6>
              </div>
            </div>
            <div className="card-body p-0">
              <div
                className="table-responsive"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <table className="table table-hover mb-0">
                  <thead
                    style={{
                      background: "#f8f9fa",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <tr>
                      <th className="fw-semibold">දිස්ත්‍රික්කය</th>
                      <th className="fw-semibold">ලැබුණු දිනය</th>
                      <th className="fw-semibold">සංගමය</th>
                      <th className="fw-semibold">ණය අංකය</th>
                      <th className="fw-semibold">නම</th>
                      <th className="fw-semibold">ණය මුදල</th>
                      <th className="fw-semibold">පොලිය</th>
                      <th className="fw-semibold">තත්වය</th>

                      <th className="fw-semibold">තීන්දුව</th>
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
                        <td className="fw-semibold text-muted small">
                          {borrower.approvedDate
                            ? new Date(borrower.approvedDate).toLocaleString(
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
                        <td className="text-muted small">
                          {borrower.societyName}
                        </td>
                        <td className="fw-semibold">{borrower.loanNumber}</td>
                        <td>
                          <strong>{borrower.borrowerName}</strong>
                        </td>
                        <td className="text-success fw-bold">
                          රු.{" "}
                          {parseFloat(borrower.loanAmount).toLocaleString(
                            "si-LK"
                          )}
                        </td>
                        <td className="text-warning fw-bold">
                          රු.{" "}
                          {parseFloat(borrower.interest).toLocaleString(
                            "si-LK"
                          )}
                        </td>
                        <td>{getStatusBadge(borrower)}</td>

                        {/*  Decision Column - Clickable */}
                        <td className="text-center">
                          {borrower.arbitrationDecision ? (
                            <button
                              onClick={() => {
                                setSelectedDecisionView(borrower);
                                setShowDecisionViewModal(true);
                              }}
                              className="btn btn-sm btn-success"
                              title="තීන්දුව බලන්න"
                              style={{ cursor: "pointer" }}
                            >
                              <FileText size={12} className="me-1" />
                              බලන්න
                            </button>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>

                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              onClick={() => {
                                setSelectedBorrower(borrower);
                                setShowDetailsModal(true);
                              }}
                              className="btn btn-outline-info"
                              title="විස්තර"
                            >
                              <Eye size={14} />
                            </button>
                            {/* Provincial admins can only view details - no other actions */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <BorrowerDetailsModal
          show={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          borrower={selectedBorrower}
        />

        <DeficiencyCheckModal
          show={showDeficiencyModal}
          onClose={() => setShowDeficiencyModal(false)}
          borrower={selectedBorrower}
          submissionId={selectedBorrower?.submissionId}
          onSuccess={() => {
            loadAllDistrictsData();
            setShowDeficiencyModal(false);
          }}
        />

        <MarkFeePaidModal
          show={showMarkFeeModal}
          onClose={() => setShowMarkFeeModal(false)}
          borrower={selectedBorrower}
          submissionId={selectedBorrower?.submissionId}
          districtId={selectedBorrower?.districtId}
          onSuccess={() => {
            loadAllDistrictsData();
            setShowMarkFeeModal(false);
          }}
        />

        <DecisionModal
          show={showDecisionModal}
          onClose={() => setShowDecisionModal(false)}
          borrower={selectedDecisionBorrower}
          submissionId={selectedDecisionBorrower?.submissionId}
          onSuccess={() => {
            loadAllDistrictsData();
            setShowDecisionModal(false);
          }}
        />

        {/*  NEW: Decision View Modal */}
        <DecisionViewModal
          show={showDecisionViewModal}
          onClose={() => {
            setShowDecisionViewModal(false);
            setSelectedDecisionView(null);
          }}
          borrower={selectedDecisionView}
        />
      </div>
    );
  }

  // District Admin View
  return (
    <div>
      <h2 className="fw-bold mb-3">තීරකකරණය සදහා ඉදිරිපත් කිරීම්</h2>
      <div
        className="alert alert-success d-flex align-items-center mb-4"
        style={{ borderRadius: "10px" }}
      >
        <CheckCircle size={18} className="me-2" />
        මෙම ඉදිරිපත් කිරීම් සමිති විසින් අනුමත කර ඇත
      </div>

      {submissions.length === 0 ? (
        <div
          className="alert alert-info d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          සමිතිවලින් තවමත් අනුමත කළ ඉදිරිපත් කිරීම් නොමැත
        </div>
      ) : (
        submissions.map((submission) => (
          <div
            key={submission.id}
            className="card mb-4 shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <div
              className="card-header text-white"
              style={{
                background: "linear-gradient(135deg, #9f6dd1 0%, #a7b2e4 100%)",
                borderRadius: "15px 15px 0 0",
              }}
            >
              <h5 className="mb-0 fw-semibold d-flex align-items-center">
                <Building size={18} className="me-2" />
                {submission.societyName || "Society"}
              </h5>
              <small>
                ඉදිරිපත් කළ දිනය:{" "}
                {new Date(
                  submission.approvedDate || submission.submittedDate
                ).toLocaleDateString("si-LK")}
              </small>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-1">
                  <thead style={{ background: "#f8f9fa" }}>
                    <tr>
                      <th className="fw-semibold">ලැබුණු දිනය</th>
                      <th className="fw-semibold">ණය අංකය</th>
                      <th className="fw-semibold">නම</th>
                      <th className="fw-semibold">ණය මුදල</th>
                      <th className="fw-semibold">පොලිය</th>
                      <th className="fw-semibold">තත්වය</th>
                      <th className="fw-semibold">තීරක අංකය</th>
                      <th className="fw-semibold">තීරක නිලධාරියා</th>
                      <th className="fw-semibold">ලිපිය</th>
                      <th className="fw-semibold">තීන්දුව</th>
                      <th className="fw-semibold">ක්‍රියා</th>
                      <th className="fw-semibold">විස්තර</th>
                    </tr>
                  </thead>

                  <tbody>
                    {submission.borrowers.map((borrower) => (
                      <tr key={borrower.id}>
                        <td className="fw-semibold text-muted small">
                          {submission.approvedDate
                            ? new Date(submission.approvedDate).toLocaleString(
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

                        <td className="fw-semibold">{borrower.loanNumber}</td>
                        <td>
                          <strong>{borrower.borrowerName}</strong>
                        </td>
                        <td className="text-success fw-bold">
                          රු.{" "}
                          {parseFloat(borrower.loanAmount).toLocaleString(
                            "si-LK"
                          )}
                        </td>
                        <td className="text-warning fw-bold">
                          රු.{" "}
                          {parseFloat(borrower.interest).toLocaleString(
                            "si-LK"
                          )}
                        </td>
                        <td>{getStatusBadge(borrower)}</td>
                        <td className="fw-bold text-primary small">
                          {borrower.arbitrationNumber || "-"}
                        </td>
                        <td className="small">
                          {borrower.assignedOfficerName || "-"}
                        </td>

                        {/*  Assignment Letter Column */}
                        <td className="text-center">
                          {borrower.assignedOfficerId &&
                          borrower.arbitrationNumber ? (
                            <button
                              onClick={() =>
                                generateAssignmentLetter(
                                  { ...borrower, submissionId: submission.id },
                                  submission.id
                                )
                              }
                              className="btn btn-sm btn-outline-primary"
                              title="තීරක නිලධාරි_පත් කිරීමේ ලිපිය බාගත කරන්න"
                              style={{ borderRadius: "6px" }}
                            >
                              <Download size={14} className="me-1" />
                              ලිපිය
                            </button>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>

                        {/*  Decision Column - Clickable */}
                        <td className="text-center">
                          {borrower.arbitrationDecision ? (
                            <button
                              onClick={() => {
                                setSelectedDecisionView({
                                  ...borrower,
                                  submissionId: submission.id,
                                });
                                setShowDecisionViewModal(true);
                              }}
                              className="btn btn-sm btn-success"
                              title="තීන්දුව බලන්න"
                              style={{ cursor: "pointer", borderRadius: "6px" }}
                            >
                              <FileText size={12} className="me-1" />
                              තීන්දුව
                            </button>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>

                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            {/* STEP 1: Document Check Button */}
                            {!borrower.documentDeficienciesChecked && (
                              <button
                                onClick={() => {
                                  setSelectedBorrower({
                                    ...borrower,
                                    submissionId: submission.id,
                                  });
                                  setShowDeficiencyModal(true);
                                }}
                                className="btn btn-outline-warning"
                                title="ලිපිගොනු පරීක්ෂා"
                              >
                                <FileCheck size={14} />
                              </button>
                            )}

                            {/* STEP 2: Assign Officer Button */}
                            {borrower.documentDeficienciesChecked &&
                              borrower.documentDeficiencies === "NONE" &&
                              !borrower.assignedOfficerId && (
                                <button
                                  onClick={() => {
                                    setSelectedBorrower({
                                      ...borrower,
                                      submissionId: submission.id,
                                    });
                                    setShowMarkFeeModal(true);
                                  }}
                                  className="btn btn-outline-success"
                                  title="නිලධාරියා පැවරීම"
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}

                            {borrower.assignedOfficerId && (
                              <button
                                onClick={() => {
                                  if (
                                    !borrower.arbitrationDecision &&
                                    borrower.status !== "decision-given"
                                  ) {
                                    setSelectedDecisionBorrower({
                                      ...borrower,
                                      submissionId: submission.id,
                                    });
                                    setShowDecisionModal(true);
                                  }
                                }}
                                className={`btn btn-outline-primary ${
                                  borrower.arbitrationDecision ||
                                  borrower.status === "decision-given"
                                    ? "disabled opacity-50"
                                    : ""
                                }`}
                                title={
                                  borrower.arbitrationDecision ||
                                  borrower.status === "decision-given"
                                    ? "තීන්දුව දැනටමත් එකතු කර ඇත"
                                    : "තීන්දුව එකතු කරන්න"
                                }
                                disabled={
                                  borrower.arbitrationDecision ||
                                  borrower.status === "decision-given"
                                }
                              >
                                <FileText size={14} />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="text-center">
                          <button
                            onClick={() => {
                              setSelectedBorrower({
                                ...borrower,
                                submissionId: submission.id,
                              });
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
          </div>
        ))
      )}

      {/* Modals */}
      <BorrowerDetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        borrower={selectedBorrower}
      />

      <DeficiencyCheckModal
        show={showDeficiencyModal}
        onClose={() => setShowDeficiencyModal(false)}
        borrower={selectedBorrower}
        submissionId={selectedBorrower?.submissionId}
        onSuccess={() => {
          loadSubmissions();
          setShowDeficiencyModal(false);
        }}
      />

      <MarkFeePaidModal
        show={showMarkFeeModal}
        onClose={() => setShowMarkFeeModal(false)}
        borrower={selectedBorrower}
        submissionId={selectedBorrower?.submissionId}
        districtId={user.district}
        onSuccess={() => {
          loadSubmissions();
          setShowMarkFeeModal(false);
        }}
      />

      <DecisionModal
        show={showDecisionModal}
        onClose={() => setShowDecisionModal(false)}
        borrower={selectedDecisionBorrower}
        submissionId={selectedDecisionBorrower?.submissionId}
        onSuccess={() => {
          loadSubmissions();
          setShowDecisionModal(false);
        }}
      />

      {/* ⭐ NEW: Decision View Modal */}
      <DecisionViewModal
        show={showDecisionViewModal}
        onClose={() => {
          setShowDecisionViewModal(false);
          setSelectedDecisionView(null);
        }}
        borrower={selectedDecisionView}
      />
    </div>
  );
};

export default DistrictSubmissionsPage;
