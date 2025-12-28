import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Building,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Search,
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Phone,
} from "lucide-react";
import api from "../services/api";

const SignupPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("SOCIETY");
  const [districts, setDistricts] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [legalOfficers, setLegalOfficers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    district: "",
    societyId: "",
    role: "SOCIETY_ADMIN",
    officerId: "",
    legalOfficerId: "",
    designation: "",
    contactNo: "", // ⭐ ADD CONTACT NUMBER
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // States for searchable dropdowns
  const [societySearch, setSocietySearch] = useState("");
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [officerSearch, setOfficerSearch] = useState("");
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [legalOfficerSearch, setLegalOfficerSearch] = useState("");
  const [showLegalOfficerDropdown, setShowLegalOfficerDropdown] =
    useState(false);

  const societyDropdownRef = useRef(null);
  const officerDropdownRef = useRef(null);
  const legalOfficerDropdownRef = useRef(null);

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (formData.district && userType === "SOCIETY") {
      loadAvailableSocieties(formData.district);
    }
  }, [formData.district, userType]);

  useEffect(() => {
    if (
      formData.district &&
      userType === "OFFICER" &&
      formData.role === "OFFICER"
    ) {
      loadAvailableOfficers(formData.district);
    }
  }, [formData.district, formData.role, userType]);

  useEffect(() => {
    if (
      formData.district &&
      userType === "OFFICER" &&
      formData.role === "LEGAL_OFFICER"
    ) {
      loadAvailableLegalOfficers(formData.district);
    }
  }, [formData.district, formData.role, userType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        societyDropdownRef.current &&
        !societyDropdownRef.current.contains(event.target)
      ) {
        setShowSocietyDropdown(false);
      }
      if (
        officerDropdownRef.current &&
        !officerDropdownRef.current.contains(event.target)
      ) {
        setShowOfficerDropdown(false);
      }
      if (
        legalOfficerDropdownRef.current &&
        !legalOfficerDropdownRef.current.contains(event.target)
      ) {
        setShowLegalOfficerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDistricts = async () => {
    try {
      const data = await api.getDistricts();
      setDistricts(data);
    } catch (err) {
      setError("Failed to load districts");
    }
  };

  const loadAvailableSocieties = async (districtId) => {
    try {
      const data = await api.getAvailableSocietiesForRegistration(districtId);
      setSocieties(data || []);
    } catch (err) {
      console.error("Failed to load societies:", err);
      setSocieties([]);
    }
  };

  const loadAvailableOfficers = async (districtId) => {
    try {
      const data = await api.getAvailableOfficersForRegistration(districtId);
      setOfficers(data || []);
    } catch (err) {
      console.error("Failed to load officers:", err);
      setOfficers([]);
    }
  };

  const loadAvailableLegalOfficers = async (districtId) => {
    try {
      const data = await api.getAvailableLegalOfficersForRegistration(
        districtId
      );
      setLegalOfficers(data || []);
    } catch (err) {
      console.error("Failed to load legal officers:", err);
      setLegalOfficers([]);
    }
  };

  // Transliteration helper
  const transliterateSinhalaToEnglish = (text) => {
    const compounds = {
      මො: "mo",
      මෝ: "mo",
      මා: "ma",
      මැ: "ma",
      මෑ: "ma",
      මි: "mi",
      මී: "mi",
      මු: "mu",
      මූ: "mu",
      මේ: "me",
      මෙ: "me",
      නො: "no",
      නෝ: "no",
      නා: "na",
      නැ: "na",
      නෑ: "na",
      නි: "ni",
      නී: "ni",
      නු: "nu",
      නූ: "nu",
      නේ: "ne",
      නෙ: "ne",
      කො: "ko",
      කෝ: "ko",
      කා: "ka",
      කැ: "ka",
      කෑ: "ka",
      කි: "ki",
      කී: "ki",
      කු: "ku",
      කූ: "ku",
      කේ: "ke",
      කෙ: "ke",
      ගො: "go",
      ගෝ: "go",
      ගා: "ga",
      ගැ: "ga",
      ගෑ: "ga",
      ගි: "gi",
      ගී: "gi",
      ගු: "gu",
      ගූ: "gu",
      ගේ: "ge",
      ගෙ: "ge",
      ජො: "jo",
      ජෝ: "jo",
      ජා: "ja",
      ජැ: "ja",
      ජෑ: "ja",
      ජි: "ji",
      ජී: "ji",
      ජු: "ju",
      ජූ: "ju",
      ජේ: "je",
      ජෙ: "je",
      පො: "po",
      පෝ: "po",
      පා: "pa",
      පැ: "pa",
      පෑ: "pa",
      පි: "pi",
      පී: "pi",
      පු: "pu",
      පූ: "pu",
      පේ: "pe",
      පෙ: "pe",
      බො: "bo",
      බෝ: "bo",
      බා: "ba",
      බැ: "ba",
      බෑ: "ba",
      බි: "bi",
      බී: "bi",
      බු: "bu",
      බූ: "bu",
      බේ: "be",
      බෙ: "be",
      තො: "to",
      තෝ: "to",
      තා: "ta",
      තැ: "ta",
      තෑ: "ta",
      ති: "ti",
      තී: "ti",
      තු: "tu",
      තූ: "tu",
      තේ: "te",
      තෙ: "te",
      දො: "do",
      දෝ: "do",
      දා: "da",
      දැ: "da",
      දෑ: "da",
      දි: "di",
      දී: "di",
      දු: "du",
      දූ: "du",
      දේ: "de",
      දෙ: "de",
      සො: "so",
      සෝ: "so",
      සා: "sa",
      සැ: "sa",
      සෑ: "sa",
      සි: "si",
      සී: "si",
      සු: "su",
      සූ: "su",
      සේ: "se",
      සෙ: "se",
      වො: "wo",
      වෝ: "wo",
      වා: "wa",
      වැ: "wa",
      වෑ: "wa",
      වි: "wi",
      වී: "wi",
      වු: "wu",
      වූ: "wu",
      වේ: "we",
      වෙ: "we",
      රො: "ro",
      රෝ: "ro",
      රා: "ra",
      රැ: "ra",
      රෑ: "ra",
      රි: "ri",
      රී: "ri",
      රු: "ru",
      රූ: "ru",
      රේ: "re",
      රෙ: "re",
      ලො: "lo",
      ලෝ: "lo",
      ලා: "la",
      ලැ: "la",
      ලෑ: "la",
      ලි: "li",
      ලී: "li",
      ලු: "lu",
      ලූ: "lu",
      ලේ: "le",
      ලෙ: "le",
      යො: "yo",
      යෝ: "yo",
      යා: "ya",
      යැ: "ya",
      යෑ: "ya",
      යි: "yi",
      යී: "yi",
      යු: "yu",
      යූ: "yu",
      යේ: "ye",
      යෙ: "ye",
      හො: "ho",
      හෝ: "ho",
      හා: "ha",
      හැ: "ha",
      හෑ: "ha",
      හි: "hi",
      හී: "hi",
      හු: "hu",
      හූ: "hu",
      හේ: "he",
      හෙ: "he",
    };

    let result = text;
    for (const [sinhala, english] of Object.entries(compounds)) {
      result = result.split(sinhala).join(english);
    }

    const sinhalaToEnglish = {
      අ: "a",
      ආ: "a",
      ඇ: "a",
      ඈ: "a",
      ඉ: "i",
      ඊ: "i",
      උ: "u",
      ඌ: "u",
      එ: "e",
      ඒ: "e",
      ඔ: "o",
      ඕ: "o",
      ක: "ka",
      ඛ: "kha",
      ග: "ga",
      ඝ: "gha",
      ඞ: "nga",
      ච: "cha",
      ඡ: "chha",
      ජ: "ja",
      ඣ: "jha",
      ඤ: "nya",
      ට: "ta",
      ඨ: "tha",
      ඩ: "da",
      ඪ: "dha",
      ණ: "na",
      ත: "ta",
      ථ: "tha",
      ද: "da",
      ධ: "dha",
      න: "na",
      ප: "pa",
      ඵ: "pha",
      බ: "ba",
      භ: "bha",
      ම: "ma",
      ය: "ya",
      ර: "ra",
      ල: "la",
      ව: "wa",
      ශ: "sha",
      ෂ: "sha",
      ස: "sa",
      හ: "ha",
      ළ: "la",
      ෆ: "fa",
      "ං": "ng",
      "ඃ": "h",
      "්": "",
      "ා": "a",
      "ැ": "a",
      "ෑ": "a",
      "ි": "i",
      "ී": "i",
      "ු": "u",
      "ූ": "u",
      "ෙ": "e",
      "ේ": "e",
      "ෛ": "ai",
      "ො": "o",
      "ෝ": "o",
      "ෞ": "au",
    };

    let finalResult = "";
    for (let char of result) {
      finalResult += sinhalaToEnglish[char] || char;
    }
    return finalResult.toLowerCase();
  };

  const getFilteredSocieties = () => {
    if (!societySearch) return societies;
    const searchLower = societySearch.toLowerCase();
    return societies.filter((s) => {
      const nameLower = s.name.toLowerCase();
      const transliterated = transliterateSinhalaToEnglish(s.name);
      return (
        nameLower.includes(searchLower) ||
        transliterated.includes(searchLower) ||
        transliterated.split(" ").some((word) => word.startsWith(searchLower))
      );
    });
  };

  const getFilteredOfficers = () => {
    if (!officerSearch) return officers;
    const searchLower = officerSearch.toLowerCase();
    return officers.filter((o) => {
      const nameLower = o.name.toLowerCase();
      const transliterated = transliterateSinhalaToEnglish(o.name);
      return (
        nameLower.includes(searchLower) ||
        transliterated.includes(searchLower) ||
        transliterated.split(" ").some((word) => word.startsWith(searchLower))
      );
    });
  };

  const getFilteredLegalOfficers = () => {
    if (!legalOfficerSearch) return legalOfficers;
    const searchLower = legalOfficerSearch.toLowerCase();
    return legalOfficers.filter((o) => {
      const nameLower = o.name.toLowerCase();
      const transliterated = transliterateSinhalaToEnglish(o.name);
      return (
        nameLower.includes(searchLower) ||
        transliterated.includes(searchLower) ||
        transliterated.split(" ").some((word) => word.startsWith(searchLower))
      );
    });
  };

  const getSelectedSocietyName = () => {
    const selected = societies.find((s) => s.id === formData.societyId);
    return selected
      ? `${selected.name}${
          selected.registrationNo ? " - " + selected.registrationNo : ""
        }`
      : "";
  };

  const getSelectedOfficerName = () => {
    const selected = officers.find((o) => o.id === formData.officerId);
    return selected ? selected.name : "";
  };

  const getSelectedLegalOfficerName = () => {
    const selected = legalOfficers.find(
      (o) => o.id === formData.legalOfficerId
    );
    return selected ? selected.name : "";
  };

  const handleSocietySelect = (societyId) => {
    setFormData({ ...formData, societyId: societyId });
    setShowSocietyDropdown(false);
    setSocietySearch("");
    setError("");
  };

  const handleOfficerSelect = (officerId) => {
    setFormData({ ...formData, officerId: officerId });
    setShowOfficerDropdown(false);
    setOfficerSearch("");
    setError("");
  };

  const handleLegalOfficerSelect = (legalOfficerId) => {
    setFormData({ ...formData, legalOfficerId: legalOfficerId });
    setShowLegalOfficerDropdown(false);
    setLegalOfficerSearch("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (
      !(userType === "OFFICER" && formData.role === "PROVINCIAL_ADMIN") &&
      !formData.district
    ) {
      setError("Please select a district");
      return;
    }

    if (userType === "SOCIETY" && !formData.societyId) {
      setError("Please select a society");
      return;
    }

    // ⭐ VALIDATE CONTACT NUMBER
    if (!formData.contactNo || formData.contactNo.trim() === "") {
      setError("Please enter a contact number");
      return;
    }

    setLoading(true);

    try {
      let signupData = {
        email: formData.email,
        password: formData.password,
        userType: userType,
        contactNo: formData.contactNo, // ⭐ INCLUDE CONTACT NUMBER
      };

      if (!(userType === "OFFICER" && formData.role === "PROVINCIAL_ADMIN")) {
        signupData.district = formData.district;
      }

      if (userType === "SOCIETY") {
        signupData = {
          ...signupData,
          name: formData.name,
          societyId: formData.societyId,
          role: formData.role,
          designation: formData.designation || "Society Member",
        };
      } else if (userType === "OFFICER") {
        if (formData.role === "OFFICER") {
          signupData = {
            ...signupData,
            officerId: formData.officerId,
            designation: "Arbitration Officer",
          };
        } else if (formData.role === "LEGAL_OFFICER") {
          signupData = {
            ...signupData,
            legalOfficerId: formData.legalOfficerId,
            designation: "Legal Officer",
          };
        } else {
          signupData = {
            ...signupData,
            name: formData.name,
            designation:
              formData.role === "DISTRICT_ADMIN"
                ? "District Administrator"
                : "Provincial Administrator",
          };
        }
        signupData.role = formData.role;
      }

      await api.signup(signupData);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Left Side - Branding */}
      <div
        className="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-2"
        style={{
          background: "linear-gradient(135deg, #323743 0%, #764ba2 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, maxWidth: "450px" }}>
          <div className="mb-4">
            <Building size={56} strokeWidth={1.5} />
          </div>
          <h1 className="h2 fw-bold mb-3">Create Your Account</h1>
          <p
            className="mb-4"
            style={{ color: "rgba(255,255,255,0.85)", lineHeight: "1.6" }}
          >
            Join the Central Province Arbitration Management System to manage
            cases and debt recovery efficiently.
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            top: "-100px",
            right: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            bottom: "-50px",
            left: "-50px",
          }}
        />
      </div>

      {/* Right Side - Signup Form */}
      <div
        className="col-lg-7 d-flex flex-column justify-content-center p-4"
        style={{
          background: "linear-gradient(45deg, #404756 0%, #7647a5 100%)",
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "650px",
            margin: "0 auto",
            padding: "2rem 0",
          }}
        >
          {/* Mobile Logo */}
          <div className="d-lg-none text-center mb-4">
            <Building size={48} style={{ color: "#667eea" }} />
            <h4 className="text-white mt-3">Register Account</h4>
          </div>

          {/* Signup Card */}
          <div
            className="p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.24) 0%, rgba(118, 75, 162, 0.223) 100%)",
              borderRadius: "24px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="text-center mb-2">
              <h2
                className="fw-bold mb-2"
                style={{ color: "#ffffff", fontSize: "1.55rem" }}
              >
                Register New Account
              </h2>
              <p
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}
              >
                Fill in your details to get started
              </p>
            </div>

            {error && (
              <div
                className="alert d-flex align-items-center mb-2"
                role="alert"
                style={{
                  background: "rgba(220, 53, 69, 0.1)",
                  border: "1px solid rgba(220, 53, 69, 0.3)",
                  borderRadius: "12px",
                  color: "#ff6b6b",
                  padding: "12px",
                }}
              >
                <AlertCircle size={18} className="me-2" />
                <span style={{ fontSize: "0.9rem" }}>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="alert d-flex align-items-center mb-2"
                role="alert"
                style={{
                  background: "rgba(40, 167, 69, 0.1)",
                  border: "1px solid rgba(40, 167, 69, 0.3)",
                  borderRadius: "12px",
                  color: "#51cf66",
                  padding: "12px",
                }}
              >
                <CheckCircle size={18} className="me-2" />
                <span style={{ fontSize: "0.9rem" }}>{success}</span>
              </div>
            )}

            {/* User Type Toggle */}
            <div className="btn-group w-100 mb-2" role="group">
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor:
                    userType === "SOCIETY"
                      ? "#6b43d0"
                      : "rgba(255,255,255,0.05)",
                  color: "white",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  padding: "12px",
                  fontSize: "0.95rem",
                }}
                onClick={() => {
                  setUserType("SOCIETY");
                  setFormData({
                    ...formData,
                    role: "SOCIETY_ADMIN",
                    societyId: "",
                    officerId: "",
                    legalOfficerId: "",
                    designation: "",
                    contactNo: "", // ⭐ RESET CONTACT NUMBER
                  });
                  setSocietySearch("");
                  setOfficerSearch("");
                  setLegalOfficerSearch("");
                  setError("");
                }}
              >
                <Users size={18} className="me-2" />
                Society
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor:
                    userType === "OFFICER"
                      ? "#6b43d0"
                      : "rgba(255,255,255,0.05)",
                  color: "white",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  padding: "12px",
                  fontSize: "0.95rem",
                }}
                onClick={() => {
                  setUserType("OFFICER");
                  setFormData({
                    ...formData,
                    societyId: "",
                    role: "OFFICER",
                    officerId: "",
                    legalOfficerId: "",
                    name: "",
                    designation: "",
                    contactNo: "", // ⭐ RESET CONTACT NUMBER
                  });
                  setSocietySearch("");
                  setOfficerSearch("");
                  setLegalOfficerSearch("");
                  setError("");
                }}
              >
                <Building size={18} className="me-2" />
                Officer/Admin
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* District Selection - Only if not Provincial Admin */}
                {!(
                  userType === "OFFICER" && formData.role === "PROVINCIAL_ADMIN"
                ) && (
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{
                        color: "rgba(245, 240, 240, 0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      District (දිස්ත්‍රික්කය) *
                    </label>
                    <select
                      className="form-control"
                      value={formData.district}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          district: e.target.value,
                          societyId: "",
                          officerId: "",
                          legalOfficerId: "",
                        });
                        setSocietySearch("");
                        setOfficerSearch("");
                        setLegalOfficerSearch("");
                        setError("");
                      }}
                      required
                      style={{
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#9e9a9a",
                        padding: "10px",
                      }}
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Role Selection for Officers */}
                {/* {userType === "OFFICER" && (
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Role (භූමිකාව) *
                    </label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          role: e.target.value,
                          officerId: "",
                          legalOfficerId: "",
                          name: "",
                          district:
                            e.target.value === "PROVINCIAL_ADMIN"
                              ? ""
                              : formData.district,
                        });
                        setOfficerSearch("");
                        setLegalOfficerSearch("");
                        setError("");
                      }}
                      required
                      style={{
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#9e9a9a",
                        padding: "12px",
                      }}
                    >
                      <option value="">Select Your Role</option>
                      <option value="OFFICER">
                        Arbitration Officer - තීරක නිලධාරී
                      </option>
                      <option value="LEGAL_OFFICER">
                        Legal Officer - නීති නිලධාරී
                      </option>
                      <option value="DISTRICT_ADMIN">
                        District Administrator - දිස්ත්‍රික් පරිපාලක
                      </option>
                      <option value="PROVINCIAL_ADMIN">
                        Provincial Administrator - පළාත් පරිපාලක
                      </option>
                    </select>
                  </div>
                )} */}
                {userType === "OFFICER" && (
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Role (භූමිකාව) *
                    </label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          role: e.target.value,
                          officerId: "",
                          legalOfficerId: "",
                          name: "",
                          district:
                            e.target.value === "PROVINCIAL_ADMIN"
                              ? ""
                              : formData.district,
                        });
                        setOfficerSearch("");
                        setLegalOfficerSearch("");
                        setError("");
                      }}
                      required
                      style={{
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#9e9a9a",
                        padding: "10px",
                      }}
                    >
                      <option value="">Select Your Role</option>
                      <option value="OFFICER">
                        Arbitration Officer - තීරක නිලධාරී
                      </option>
                      <option value="LEGAL_OFFICER">
                        Legal Officer - නීති නිලධාරී
                      </option>
                      <option value="DISTRICT_ADMIN">
                        District Administrator - දිස්ත්‍රික් පරිපාලක
                      </option>
                      <option value="PROVINCIAL_ADMIN">
                        Provincial Administrator - පළාත් පරිපාලක
                      </option>
                    </select>
                  </div>
                )}

                {/* Officer Name Selection */}
                {userType === "OFFICER" && formData.role === "OFFICER" && (
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Select Your Name (ඔබේ නම තෝරන්න) *
                    </label>
                    <div className="position-relative" ref={officerDropdownRef}>
                      <div
                        className="form-control d-flex align-items-center justify-content-between"
                        style={{
                          cursor: "pointer",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#ffffff",
                          padding: "12px",
                        }}
                        onClick={() => {
                          if (formData.district) {
                            setShowOfficerDropdown(!showOfficerDropdown);
                          }
                        }}
                      >
                        <span
                          className={
                            !getSelectedOfficerName() ? "text-muted" : ""
                          }
                        >
                          {getSelectedOfficerName() ||
                            "-- Select Your Name from List --"}
                        </span>
                        <Search
                          size={16}
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        />
                      </div>

                      {showOfficerDropdown && (
                        <div
                          className="position-absolute w-100 bg-white border rounded shadow-lg"
                          style={{
                            zIndex: 1000,
                            maxHeight: "250px",
                            overflowY: "auto",
                            marginTop: "4px",
                          }}
                        >
                          <div className="p-2 border-bottom sticky-top bg-white">
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-light border-0">
                                <Search size={14} />
                              </span>
                              <input
                                type="text"
                                className="form-control border-0"
                                placeholder="Type to search..."
                                value={officerSearch}
                                onChange={(e) =>
                                  setOfficerSearch(e.target.value)
                                }
                                autoFocus
                              />
                              {officerSearch && (
                                <button
                                  className="btn btn-sm"
                                  onClick={() => setOfficerSearch("")}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            {getFilteredOfficers().length === 0 ? (
                              <div className="p-3 text-center text-muted">
                                <AlertCircle size={16} className="me-2" />
                                No officers available for registration
                              </div>
                            ) : (
                              getFilteredOfficers().map((officer) => (
                                <div
                                  key={officer.id}
                                  className="p-2 px-3"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleOfficerSelect(officer.id)
                                  }
                                  onMouseEnter={(e) =>
                                    (e.target.style.backgroundColor = "#f8f9fa")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.target.style.backgroundColor = "white")
                                  }
                                >
                                  {officer.name}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {!formData.district && (
                      <small
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Please select a district first
                      </small>
                    )}
                  </div>
                )}

                {/* Legal Officer Name Selection */}
                {userType === "OFFICER" &&
                  formData.role === "LEGAL_OFFICER" && (
                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Select Your Name (ඔබේ නම තෝරන්න) *
                      </label>
                      <div
                        className="position-relative"
                        ref={legalOfficerDropdownRef}
                      >
                        <div
                          className="form-control d-flex align-items-center justify-content-between"
                          style={{
                            cursor: "pointer",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#ffffff",
                            padding: "12px",
                          }}
                          onClick={() => {
                            if (formData.district) {
                              setShowLegalOfficerDropdown(
                                !showLegalOfficerDropdown
                              );
                            }
                          }}
                        >
                          <span
                            className={
                              !getSelectedLegalOfficerName() ? "text-muted" : ""
                            }
                          >
                            {getSelectedLegalOfficerName() ||
                              "-- Select Your Name from List --"}
                          </span>
                          <Search
                            size={16}
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          />
                        </div>

                        {showLegalOfficerDropdown && (
                          <div
                            className="position-absolute w-100 bg-white border rounded shadow-lg"
                            style={{
                              zIndex: 1000,
                              maxHeight: "250px",
                              overflowY: "auto",
                              marginTop: "4px",
                            }}
                          >
                            <div className="p-2 border-bottom sticky-top bg-white">
                              <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-0">
                                  <Search size={14} />
                                </span>
                                <input
                                  type="text"
                                  className="form-control border-0"
                                  placeholder="Type to search..."
                                  value={legalOfficerSearch}
                                  onChange={(e) =>
                                    setLegalOfficerSearch(e.target.value)
                                  }
                                  autoFocus
                                />
                                {legalOfficerSearch && (
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => setLegalOfficerSearch("")}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              {getFilteredLegalOfficers().length === 0 ? (
                                <div className="p-3 text-center text-muted">
                                  <AlertCircle size={16} className="me-2" />
                                  No legal officers available for registration
                                </div>
                              ) : (
                                getFilteredLegalOfficers().map(
                                  (legalOfficer) => (
                                    <div
                                      key={legalOfficer.id}
                                      className="p-2 px-3"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        handleLegalOfficerSelect(
                                          legalOfficer.id
                                        )
                                      }
                                      onMouseEnter={(e) =>
                                        (e.target.style.backgroundColor =
                                          "#f8f9fa")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.target.style.backgroundColor =
                                          "white")
                                      }
                                    >
                                      {legalOfficer.name}
                                    </div>
                                  )
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {!formData.district && (
                        <small
                          style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "0.8rem",
                          }}
                        >
                          Please select a district first
                        </small>
                      )}
                    </div>
                  )}

                {/* Full Name for Admin roles */}
                {userType === "OFFICER" &&
                  (formData.role === "DISTRICT_ADMIN" ||
                    formData.role === "PROVINCIAL_ADMIN") && (
                    <div className="col-md-6 mb-3">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Full Name (සම්පූර්ණ නම) *
                      </label>
                      <div style={{ position: "relative" }}>
                        <User
                          size={20}
                          style={{
                            position: "absolute",
                            left: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          style={{
                            borderRadius: "12px",
                            paddingLeft: "48px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#ffffff",
                            padding: "12px 12px 12px 48px",
                          }}
                        />
                      </div>
                    </div>
                  )}

                {/* Society Member Fields */}
                {userType === "SOCIETY" && (
                  <>
                    <div className="col-md-6 mb-1">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Full Name (සම්පූර්ණ නම) *
                      </label>
                      <div style={{ position: "relative" }}>
                        <User
                          size={20}
                          style={{
                            position: "absolute",
                            left: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          style={{
                            borderRadius: "12px",
                            paddingLeft: "48px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#ffffff",
                            padding: "10px 10px 10px 48px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Society Selection */}
                    <div className="col-md-6 mb-0">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Society (සමිතිය) *
                      </label>
                      <div
                        className="position-relative"
                        ref={societyDropdownRef}
                      >
                        <div
                          className="form-control d-flex align-items-center justify-content-between"
                          style={{
                            cursor: "pointer",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#ffffff",
                            padding: "8px",
                          }}
                          onClick={() => {
                            if (formData.district) {
                              setShowSocietyDropdown(!showSocietyDropdown);
                            }
                          }}
                        >
                          <span
                            className={
                              !getSelectedSocietyName() ? "text-muted" : ""
                            }
                          >
                            {getSelectedSocietyName() || "Select Society"}
                          </span>
                          <Search
                            size={16}
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          />
                        </div>

                        {showSocietyDropdown && (
                          <div
                            className="position-absolute w-100 bg-white border rounded shadow-lg"
                            style={{
                              zIndex: 1000,
                              maxHeight: "250px",
                              overflowY: "auto",
                              marginTop: "4px",
                            }}
                          >
                            <div className="p-2 border-bottom sticky-top bg-white">
                              <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-0">
                                  <Search size={14} />
                                </span>
                                <input
                                  type="text"
                                  className="form-control border-0"
                                  placeholder="Type to search..."
                                  value={societySearch}
                                  onChange={(e) =>
                                    setSocietySearch(e.target.value)
                                  }
                                  autoFocus
                                />
                                {societySearch && (
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => setSocietySearch("")}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              {getFilteredSocieties().length === 0 ? (
                                <div className="p-3 text-center text-muted">
                                  <AlertCircle size={16} className="me-2" />
                                  {formData.district
                                    ? "No societies available for registration"
                                    : "Please select a district first"}
                                </div>
                              ) : (
                                getFilteredSocieties().map((society) => (
                                  <div
                                    key={society.id}
                                    className="p-2 px-3"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleSocietySelect(society.id)
                                    }
                                    onMouseEnter={(e) =>
                                      (e.target.style.backgroundColor =
                                        "#f8f9fa")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.target.style.backgroundColor = "white")
                                    }
                                  >
                                    {society.name}
                                    {society.registrationNo && (
                                      <small className="text-muted ms-2">
                                        - {society.registrationNo}
                                      </small>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {!formData.district && (
                        <small
                          style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "0.8rem",
                          }}
                        >
                          Please select a district first
                        </small>
                      )}
                    </div>

                    <div className="col-md-6 mb-0">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Society Role *
                      </label>
                      <select
                        className="form-control"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        required
                        style={{
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#9e9a9a",
                          padding: "8px",
                        }}
                      >
                        <option value="SOCIETY_ADMIN">Society Admin</option>
                        <option value="SOCIETY_APPROVAL">
                          Society Approval
                        </option>
                      </select>
                      <small
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.8rem",
                        }}
                      ></small>
                    </div>

                    <div className="col-md-6 mb-1">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Email Address *
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail
                          size={20}
                          style={{
                            position: "absolute",
                            left: "16px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "rgba(239, 238, 238, 0.4)",
                          }}
                        />
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Add your Email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          style={{
                            borderRadius: "12px",
                            paddingLeft: "48px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#a7a5a5",
                            padding: "8px 8px 8px 48px",
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/*  CONTACT NUMBER FIELD - For both Society and Officers */}
                <div className="col-md-6 mb-2">
                  <label
                    className="form-label fw-semibold"
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Contact Number (දුරකථන අංකය) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone
                      size={20}
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    />
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Add your Contact No"
                      value={formData.contactNo}
                      onChange={(e) =>
                        setFormData({ ...formData, contactNo: e.target.value })
                      }
                      required
                      style={{
                        borderRadius: "12px",
                        paddingLeft: "48px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        padding:
                          userType === "SOCIETY"
                            ? "8px 8px 8px 48px"
                            : "12px 12px 12px 48px",
                      }}
                    />
                  </div>
                </div>

                {/* Email for Officers */}
                {userType === "OFFICER" && (
                  <div className="col-12 mb-3">
                    <label
                      className="form-label fw-semibold"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Email Address *
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail
                        size={20}
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      />
                      <input
                        type="email"
                        className="form-control"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        style={{
                          borderRadius: "12px",
                          paddingLeft: "48px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#ffffff",
                          padding: "12px 12px 12px 48px",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="col-md-6 mb-2">
                  <label
                    className="form-label fw-semibold"
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Password *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={20}
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      minLength={6}
                      required
                      style={{
                        borderRadius: "12px",
                        paddingLeft: "48px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        padding: "8px 8px 8px 48px",
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-2">
                  <label
                    className="form-label fw-semibold"
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Confirm Password *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={20}
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      minLength={6}
                      required
                      style={{
                        borderRadius: "12px",
                        paddingLeft: "48px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        padding: "8px 8px 8px 48px",
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-lg w-100 fw-semibold mt-1"
                disabled={loading}
                style={{
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #253169 0%, #3d1962 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  fontSize: "1.05rem",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Account
                    <ArrowRight
                      size={20}
                      className="ms-2"
                      style={{ display: "inline" }}
                    />
                  </>
                )}
              </button>
            </form>

            <hr
              style={{
                border: "none",
                height: "1px",
                background: "rgba(255,255,255,0.1)",
                margin: "1rem 0",
              }}
            />

            <div className="text-center">
              <Link
                to="/login"
                className="text-decoration-none d-inline-flex align-items-center"
                style={{ color: "#e8e5eb", fontSize: "0.95rem" }}
              >
                <ArrowLeft size={16} className="me-2 mt-0" />
                Already have an account? Login here
              </Link>
            </div>
          </div>

          <p
            className="text-center mt-0"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}
          >
            © 2024 Central Province Cooperative. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
