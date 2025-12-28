import React, { useState, useEffect } from "react";
import {
  Building,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
  Trash2,
  Eye,
  Mail,
  UserCheck,
  UserX,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ManageSocietiesPage = () => {
  const { user } = useAuth();
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    districtId: user.district || "",
    registrationNo: "",
    registeredAddress: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isProvincialAdmin = user?.roles?.includes("PROVINCIAL_ADMIN");
  const isDistrictAdmin = user?.roles?.includes("DISTRICT_ADMIN");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSocieties();
  }, [selectedDistrict, searchQuery, societies]);

  const loadData = async () => {
    try {
      const districtsData = await api.getDistricts();
      setDistricts(districtsData);

      if (isProvincialAdmin) {
        const allSocieties = await api.getSocieties();
        setSocieties(allSocieties);
      } else if (user.district) {
        const societiesData = await api.getSocietiesByDistrict(user.district);
        setSocieties(societiesData);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load societies");
    } finally {
      setLoading(false);
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

  const filterSocieties = () => {
    let filtered = societies;

    // Filter by district
    if (selectedDistrict) {
      filtered = filtered.filter((s) => s.districtId === selectedDistrict);
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => {
        const nameLower = s.name.toLowerCase();
        const transliterated = transliterateSinhalaToEnglish(s.name);
        const regNo = (s.registrationNo || "").toLowerCase();
        return (
          nameLower.includes(searchLower) ||
          transliterated.includes(searchLower) ||
          transliterated
            .split(" ")
            .some((word) => word.startsWith(searchLower)) ||
          regNo.includes(searchLower)
        );
      });
    }

    setFilteredSocieties(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if society already exists
    const existingSociety = societies.find(
      (s) =>
        s.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        s.districtId === formData.districtId
    );

    if (existingSociety) {
      setError(
        "මෙම නමින් සමිතියක් දැනටමත් පවතී! (This society already exists!)"
      );
      setTimeout(() => setError(""), 5000);
      return;
    }

    try {
      await api.createSociety(formData);
      setSuccess("සමිතිය සාර්ථකව සාදන ලදී!");
      setShowModal(false);
      setFormData({
        name: "",
        districtId: user.district || "",
        registrationNo: "",
        registeredAddress: "",
      });
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create society");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (societyId, societyName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${societyName}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await api.deleteSociety(societyId);
        setSuccess("Society deleted successfully");
        loadData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.message || "Failed to delete society");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleViewDetails = (society) => {
    setSelectedSociety(society);
    setShowDetailsModal(true);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            {isProvincialAdmin
              ? "පළාත් මට්ටමේ සියලුම සමිති  "
              : "සමිති කළමනාකරණය"}
          </h2>
          <p className="text-muted mb-0">සමිති තොරතුරු </p>
        </div>
        {isDistrictAdmin && (
          <button
            className="btn text-white btn-lg d-flex align-items-center"
            onClick={() => setShowModal(true)}
            style={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <Plus size={18} className="me-2" />
            නව සමිතියක් එකතු කරන්න
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <AlertCircle size={18} className="me-2" />
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <CheckCircle size={18} className="me-2" />
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {isProvincialAdmin && (
        <div
          className="card border-0 shadow-sm mb-4"
          style={{ borderRadius: "15px" }}
        >
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <Filter size={18} className="me-2" />
                  දිස්ත්‍රික්කය
                </label>
                <select
                  className="form-select form-select-lg"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  style={{ borderRadius: "10px" }}
                >
                  <option value="">සියලුම දිස්ත්‍රික්ක</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8 mt-3 mt-md-0">
                <div className="d-flex align-items-center">
                  <div className="me-4">
                    <small className="text-muted">මුළු සමිති ගණන</small>
                    <h4 className="mb-0 fw-bold">{societies.length}</h4>
                  </div>
                  <div>
                    <small className="text-muted">
                      දිස්ත්‍රික්කයේ සමිති ගණන
                    </small>
                    <h4 className="mb-0 fw-bold text-primary">
                      {filteredSocieties.length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      {/* <div
        className="card border-0 shadow-sm mb-4"
        style={{ borderRadius: "15px" }}
      >
        <div className="card-body p-2">
          <label className="form-label fw-semibold d-flex align-items-center mb-1">
            <Search size={18} className="me-2" />
            සමිතිය සොයන්න (Search Society)
          </label>
          {searchQuery && (
            <small className="text-muted mt-1 d-block">
              ප්‍රතිඵල {filteredSocieties.length} ක් හමු විය
            </small>
          )}
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="සමිති නම හෝ ලියාපදිංචි අංකය ඇතුළත් කරන්න (Enter society name or registration number)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: "10px" }}
          />
        </div>
      </div> */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{ borderRadius: "15px" }}
      >
        <div className="card-body p-2">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label fw-semibold d-flex align-items-center mb-0">
              <Search size={18} className="me-2" />
              සමිතිය සොයන්න (Search Society)
            </label>

            {searchQuery && (
              <small className="text-muted">
                ප්‍රතිඵල {filteredSocieties.length} ක් හමු විය
              </small>
            )}

            <input
              type="text"
              className="form-control form-control-sm ms-2"
              placeholder="සමිති නම හෝ ලියාපදිංචි අංකය ඇතුළත් කරන්න (Enter society name or registration number)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: "10px", maxWidth: "550px", flex: "1" }}
            />
          </div>
        </div>
      </div>

      {filteredSocieties.length === 0 ? (
        <div
          className="alert alert-warning d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          {searchQuery
            ? "සෙවීමට ගැලපෙන සමිති හමු නොවීය"
            : selectedDistrict
            ? "තෝරාගත් දිස්ත්‍රික්කයේ සමිති නොමැත"
            : "තවම සමිති එකතු කර නොමැත"}
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
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "14px",
                }}
                className="text-white"
              >
                <tr>
                  <th className="fw-semibold">Created At</th>
                  <th className="fw-semibold">Society Name</th>
                  {isProvincialAdmin && (
                    <th className="fw-semibold">District</th>
                  )}
                  <th className="fw-semibold">Registration No</th>
                  <th className="fw-semibold">Admin Email</th>
                  <th className="fw-semibold">Approval Email</th>
                  <th className="fw-semibold">Admin Status</th>
                  <th className="fw-semibold">Approval Status</th>
                  <th className="fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSocieties.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString("si-LK", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "-"}
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    {isProvincialAdmin && (
                      <td>{s.districtName || s.districtId}</td>
                    )}
                    <td>{s.registrationNo || "-"}</td>
                    <td>
                      {s.adminEmail ? (
                        <div className="d-flex align-items-center">
                          <Mail size={14} className="me-1 text-primary" />
                          <small>{s.adminEmail}</small>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {s.approvalEmail ? (
                        <div className="d-flex align-items-center">
                          <Mail size={14} className="me-1 text-info" />
                          <small>{s.approvalEmail}</small>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {s.adminAccountCreated ? (
                        <span className="badge bg-success">
                          <UserCheck size={12} className="me-1" />
                          Created
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          <UserX size={12} className="me-1" />
                          Not Created
                        </span>
                      )}
                    </td>
                    <td>
                      {s.approvalAccountCreated ? (
                        <span className="badge bg-success">
                          <UserCheck size={12} className="me-1" />
                          Created
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          <UserX size={12} className="me-1" />
                          Not Created
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => handleViewDetails(s)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {isDistrictAdmin && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(s.id, s.name)}
                            title="Delete Society"
                            disabled={s.userAccountCreated}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Society Modal */}
      {showModal && isDistrictAdmin && (
        <>
          <div
            className="modal-backdrop show"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
            onClick={() => setShowModal(false)}
          ></div>
          <div
            className="modal show d-block"
            style={{ zIndex: 1055 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "20px" }}
              >
                <div
                  className="modal-header text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "20px 20px 0 0",
                  }}
                >
                  <h5 className="modal-title fw-bold d-flex align-items-center">
                    <Building size={20} className="me-2" />
                    නව සමිතියක් එකතු කරන්න
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        සමිති නම *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        දිස්ත්‍රික්කය *
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={formData.districtId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            districtId: e.target.value,
                          })
                        }
                        required
                        disabled={true}
                        style={{ borderRadius: "10px" }}
                      >
                        <option value="">දිස්ත්‍රික්කය තෝරන්න</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">
                        ඔබගේ දිස්ත්‍රික්කය ස්වයංක්‍රීයව තෝරා ඇත
                      </small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        ලියාපදිංචි අංකය
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.registrationNo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registrationNo: e.target.value,
                          })
                        }
                        style={{ borderRadius: "10px" }}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        ලියාපදිංචි ලිපිනය
                      </label>
                      <textarea
                        className="form-control form-control-lg"
                        rows="3"
                        value={formData.registeredAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registeredAddress: e.target.value,
                          })
                        }
                        style={{ borderRadius: "10px" }}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0 p-4">
                    <button
                      type="button"
                      className="btn btn-secondary btn-lg px-4"
                      onClick={() => setShowModal(false)}
                      style={{ borderRadius: "10px" }}
                    >
                      <X size={16} className="me-2" />
                      අවලංගු කරන්න
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-4"
                      style={{
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                      }}
                    >
                      <CheckCircle size={16} className="me-2" />
                      සමිතිය සාදන්න
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSociety && (
        <>
          <div
            className="modal-backdrop show"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
            onClick={() => setShowDetailsModal(false)}
          ></div>
          <div
            className="modal show d-block"
            style={{ zIndex: 1055 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "20px" }}
              >
                <div
                  className="modal-header text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "20px 20px 0 0",
                  }}
                >
                  <h5 className="modal-title fw-bold">Society Details</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong>සමිති නම:</strong>
                      <p>{selectedSociety.name}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>ලියාපදිංචි අංකය:</strong>
                      <p>{selectedSociety.registrationNo || "-"}</p>
                    </div>
                    <div className="col-12 mb-3">
                      <strong>ලිපිනය:</strong>
                      <p>{selectedSociety.registeredAddress || "-"}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Admin Account:</strong>
                      <p>
                        {selectedSociety.adminAccountCreated ? (
                          <span className="badge bg-success">Created</span>
                        ) : (
                          <span className="badge bg-secondary">
                            Not Created
                          </span>
                        )}
                      </p>
                      {selectedSociety.adminEmail && (
                        <small className="text-muted">
                          {selectedSociety.adminEmail}
                        </small>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Approval Account:</strong>
                      <p>
                        {selectedSociety.approvalAccountCreated ? (
                          <span className="badge bg-success">Created</span>
                        ) : (
                          <span className="badge bg-secondary">
                            Not Created
                          </span>
                        )}
                      </p>
                      {selectedSociety.approvalEmail && (
                        <small className="text-muted">
                          {selectedSociety.approvalEmail}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageSocietiesPage;
