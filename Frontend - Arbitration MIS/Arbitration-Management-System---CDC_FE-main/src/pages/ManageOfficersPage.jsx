import React, { useState, useEffect } from "react";
import {
  Users,
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ManageOfficersPage = () => {
  const { user } = useAuth();
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    districtId: user.district || "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isProvincialAdmin = user?.roles?.includes("PROVINCIAL_ADMIN");
  const isDistrictAdmin = user?.roles?.includes("DISTRICT_ADMIN");

  useEffect(() => {
    loadOfficers();
    loadDistricts();
  }, []);

  useEffect(() => {
    filterOfficers();
  }, [selectedDistrict, officers]);

  const loadDistricts = async () => {
    try {
      const data = await api.getDistricts();
      setDistricts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOfficers = async () => {
    try {
      if (isProvincialAdmin) {
        const districtsData = await api.getDistricts();
        const allOfficers = [];
        for (const district of districtsData) {
          const districtOfficers = await api.getOfficersByDistrict(district.id);
          allOfficers.push(
            ...districtOfficers.map((o) => ({
              ...o,
              districtName: district.name,
            }))
          );
        }
        setOfficers(allOfficers);
      } else {
        const data = await api.getOfficersByDistrict(user.district);
        setOfficers(data);
      }
    } catch (err) {
      console.error(err);
      setError("තීරක නිලධාරීන් පූරණය කිරීමට අසමත් විය");
    } finally {
      setLoading(false);
    }
  };

  const filterOfficers = () => {
    if (!selectedDistrict) {
      setFilteredOfficers(officers);
    } else {
      setFilteredOfficers(
        officers.filter((o) => o.districtId === selectedDistrict)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createOfficer(formData);
      setSuccess("තීරක නිලධාරී සාර්ථකව සාදන ලදී!");
      setShowModal(false);
      setFormData({ name: "", districtId: user.district || "" });
      loadOfficers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "තීරක නිලධාරී සෑදීමට අසමත් විය");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (officerId, officerName) => {
    if (
      window.confirm(
        `ඔබට "${officerName}" මකා දැමීමට අවශ්‍ය බව විශ්වාසද?\n\nමෙම ක්‍රියාව අහෝසි කළ නොහැක.`
      )
    ) {
      try {
        await api.deleteOfficer(officerId);
        setSuccess("තීරක නිලධාරී සාර්ථකව මකා දමන ලදී");
        loadOfficers();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.message || "තීරක නිලධාරී මකා දැමීමට අසමත් විය");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleViewDetails = (officer) => {
    setSelectedOfficer(officer);
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
              ? "පළාත් මට්ටමේ සියලුම තීරක නිලධාරීන්"
              : "තීරක නිලධාරීන් කළමනාකරණය"}
          </h2>
          <p className="text-muted mb-0">තීරක නිලධාරීන්ගේ තොරතුරු </p>
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
            නව තීරක නිලධාරියෙකු එකතු කරන්න
          </button>
        )}
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          style={{ borderRadius: "10px" }}
        >
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
        <div
          className="alert alert-success alert-dismissible fade show"
          style={{ borderRadius: "10px" }}
        >
          <CheckCircle size={18} className="me-2" />
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {isProvincialAdmin && !isDistrictAdmin && (
        <div
          className="alert alert-info d-flex align-items-center mb-4"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          පළාත් පරිපාලකයන්ට තීරක නිලධාරීන් එකතු කළ නොහැක. දිස්ත්‍රික්
          පරිපාලකයන්ට පමණක් තීරක නිලධාරීන් එකතු කළ හැක.
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
                    <small className="text-muted">මුළු නිලධාරීන් ගණන</small>
                    <h4 className="mb-0 fw-bold">{officers.length}</h4>
                  </div>
                  <div>
                    <small className="text-muted">
                      දිස්ත්‍රික්කයේ නිලධාරීන් ගණන
                    </small>
                    <h4 className="mb-0 fw-bold text-primary">
                      {filteredOfficers.length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredOfficers.length === 0 ? (
        <div
          className="alert alert-warning d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          {selectedDistrict
            ? "තෝරාගත් දිස්ත්‍රික්කයේ තීරක නිලධාරීන් නොමැත"
            : "තවම තීරක නිලධාරීන් එකතු කර නොමැත"}
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
                }}
                className="text-white"
              >
                <tr>
                  <th className="fw-semibold">Created At</th>
                  <th className="fw-semibold">තීරක නිලධාරියාගේ නම</th>
                  {isProvincialAdmin && (
                    <th className="fw-semibold">දිස්ත්‍රික්කය</th>
                  )}
                  <th className="fw-semibold">විද්‍යුත් තැපෑල</th>
                  <th className="fw-semibold">පරිශීලක ගිණුම</th>
                  <th className="fw-semibold">පැවරුම් තත්වය</th>
                  <th className="fw-semibold">ක්‍රියා</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((o) => (
                  <tr key={o.id}>
                    <td>
                      {/* ⭐ Show received date with proper formatting */}
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("si-LK", {
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
                      <strong>{o.name}</strong>
                    </td>
                    {isProvincialAdmin && (
                      <td>{o.districtName || o.districtId}</td>
                    )}
                    <td>
                      {o.userEmail ? (
                        <div className="d-flex align-items-center">
                          <Mail size={14} className="me-1 text-primary" />
                          <small>{o.userEmail}</small>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {o.userAccountCreated ? (
                        <span className="badge bg-success">
                          <UserCheck size={12} className="me-1" />
                          සාදන ලදී
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          <UserX size={12} className="me-1" />
                          නොසැදු
                        </span>
                      )}
                    </td>
                    <td>
                      {o.assignedToSocietyId ? (
                        <span className="badge bg-info">පවරා ඇත</span>
                      ) : (
                        <span className="badge bg-success">පවරා නැත</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => handleViewDetails(o)}
                          title="විස්තර බලන්න"
                        >
                          <Eye size={14} />
                        </button>
                        {isDistrictAdmin && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(o.id, o.name)}
                            title="මකා දමන්න"
                            disabled={
                              o.userAccountCreated || o.assignedToSocietyId
                            }
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

      {/* Create Officer Modal */}
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
                    <Users size={20} className="me-2" />
                    නව තීරක නිලධාරියෙකු එකතු කරන්න
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
                        තීරක නිලධාරියාගේ නම *
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
                        දිස්ත්‍රික්කය ස්වයංක්‍රීයව ඔබගේ දිස්ත්‍රික්කයට සකසා ඇත
                      </small>
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
                      තීරක නිලධාරියා සාදන්න
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOfficer && (
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
                  <h5 className="modal-title fw-bold">තීරක නිලධාරී විස්තර</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong>නම:</strong>
                      <p>{selectedOfficer.name}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>දිස්ත්‍රික්කය:</strong>
                      <p>
                        {selectedOfficer.districtName ||
                          selectedOfficer.districtId}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>විද්‍යුත් තැපෑල:</strong>
                      <p>{selectedOfficer.userEmail || "-"}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>පරිශීලක ගිණුම:</strong>
                      <p>
                        {selectedOfficer.userAccountCreated ? (
                          <span className="badge bg-success">සාදන ලදී</span>
                        ) : (
                          <span className="badge bg-secondary">නොසැදු</span>
                        )}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>පැවරුම් තත්වය:</strong>
                      <p>
                        {selectedOfficer.assignedToSocietyId ? (
                          <span className="badge bg-info">පවරා ඇත</span>
                        ) : (
                          <span className="badge bg-success">පවරා නැත</span>
                        )}
                      </p>
                    </div>
                    {selectedOfficer.assignedToSocietyId && (
                      <div className="col-md-6 mb-3">
                        <strong>පවරා ඇති සමිතිය:</strong>
                        <p>
                          {selectedOfficer.assignedToSocietyName ||
                            selectedOfficer.assignedToSocietyId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    වසන්න
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

export default ManageOfficersPage;
