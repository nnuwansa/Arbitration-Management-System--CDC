import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
  Trash2,
  Eye,
  Edit,
  Scale,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ManageCourtsPage = () => {
  const { user } = useAuth();
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    districtId: user?.district || "",
    address: "",
    contactNumber: "",
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
    filterCourts();
  }, [selectedDistrict, courts]);

  const loadData = async () => {
    try {
      const districtsData = await api.getDistricts();
      setDistricts(districtsData);

      if (isProvincialAdmin) {
        const allCourts = await api.getAllCourts();
        setCourts(allCourts);
      } else if (user.district) {
        const courtsData = await api.getCourtsByDistrict(user.district);
        setCourts(courtsData);
      }
    } catch (err) {
      console.error(err);
      setError("උසාවි පූරණය කිරීමට අසමත් විය");
    } finally {
      setLoading(false);
    }
  };

  const filterCourts = () => {
    if (!selectedDistrict) {
      setFilteredCourts(courts);
    } else {
      setFilteredCourts(
        courts.filter((c) => c.districtId === selectedDistrict)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourt) {
        await api.updateCourt(editingCourt.id, formData);
        setSuccess("උසාවිය සාර්ථකව යාවත්කාලීන කරන ලදී!");
      } else {
        await api.createCourt(formData);
        setSuccess("උසාවිය සාර්ථකව සාදන ලදී!");
      }
      setShowModal(false);
      setEditingCourt(null);
      setFormData({
        name: "",
        districtId: user?.district || "",
        address: "",
        contactNumber: "",
      });
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "උසාවිය සෑදීමට/යාවත්කාලීන කිරීමට අසමත් විය");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEdit = (court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      districtId: court.districtId,
      address: court.address || "",
      contactNumber: court.contactNumber || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (courtId, courtName) => {
    if (
      window.confirm(
        `ඔබට "${courtName}" මකා දැමීමට අවශ්‍ය බව විශ්වාසද?\n\nමෙම ක්‍රියාව අහෝසි කළ නොහැක.`
      )
    ) {
      try {
        await api.deleteCourt(courtId);
        setSuccess("උසාවිය සාර්ථකව මකා දමන ලදී");
        loadData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.message || "උසාවිය මකා දැමීමට අසමත් විය");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleViewDetails = (court) => {
    setSelectedCourt(court);
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <Scale size={28} className="me-2 text-primary" />
            {isProvincialAdmin
              ? "පළාත් මට්ටමේ සියලුම උසාවි"
              : "උසාවි කළමනාකරණය"}
          </h2>
          <p className="text-muted mb-0">උසාවි තොරතුරු</p>
        </div>
        {isDistrictAdmin && (
          <button
            className="btn text-white btn-lg d-flex align-items-center"
            onClick={() => {
              setEditingCourt(null);
              setFormData({
                name: "",
                districtId: user?.district || "",
                address: "",
                contactNumber: "",
              });
              setShowModal(true);
            }}
            style={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <Plus size={18} className="me-2" />
            නව උසාවියක් එකතු කරන්න
          </button>
        )}
      </div>

      {/* Error and Success Messages */}
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

      {/* Provincial Admin Filter */}
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
                    <small className="text-muted">මුළු උසාවි ගණන</small>
                    <h4 className="mb-0 fw-bold">{courts.length}</h4>
                  </div>
                  <div>
                    <small className="text-muted">
                      දිස්ත්‍රික්කයේ උසාවි ගණන
                    </small>
                    <h4 className="mb-0 fw-bold text-primary">
                      {filteredCourts.length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courts Table */}
      {filteredCourts.length === 0 ? (
        <div
          className="alert alert-warning d-flex align-items-center"
          style={{ borderRadius: "10px" }}
        >
          <AlertCircle size={18} className="me-2" />
          {selectedDistrict
            ? "තෝරාගත් දිස්ත්‍රික්කයේ උසාවි නොමැත"
            : "තවම උසාවි එකතු කර නොමැත"}
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
                  <th className="fw-semibold">උසාවි නම</th>
                  {isProvincialAdmin && (
                    <th className="fw-semibold">දිස්ත්‍රික්කය</th>
                  )}
                  <th className="fw-semibold">ලිපිනය</th>
                  <th className="fw-semibold">දුරකථන අංකය</th>
                  <th className="fw-semibold">ක්‍රියා</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourts.map((court) => (
                  <tr key={court.id}>
                    <td>
                      <strong className="d-flex align-items-center">
                        <Scale size={16} className="me-2 text-primary" />
                        {court.name}
                      </strong>
                    </td>
                    {isProvincialAdmin && (
                      <td>{court.districtName || court.districtId}</td>
                    )}
                    <td>{court.address || "-"}</td>
                    <td>{court.contactNumber || "-"}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => handleViewDetails(court)}
                          title="විස්තර බලන්න"
                        >
                          <Eye size={14} />
                        </button>
                        {isDistrictAdmin && (
                          <>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(court)}
                              title="සංස්කරණය කරන්න"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(court.id, court.name)}
                              title="මකා දමන්න"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
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

      {/* Create/Edit Modal */}
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
                    <Scale size={20} className="me-2" />
                    {editingCourt
                      ? "උසාවිය සංස්කරණය කරන්න"
                      : "නව උසාවියක් එකතු කරන්න"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">උසාවි නම *</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="උසාවියේ සම්පූර්ණ නම ඇතුළත් කරන්න"
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
                        setFormData({ ...formData, districtId: e.target.value })
                      }
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
                  <div className="mb-3">
                    <label className="form-label fw-semibold">ලිපිනය</label>
                    <textarea
                      className="form-control form-control-lg"
                      rows="3"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="උසාවියේ ලිපිනය ඇතුළත් කරන්න"
                      style={{ borderRadius: "10px" }}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      දුරකථන අංකය
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={formData.contactNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactNumber: e.target.value,
                        })
                      }
                      placeholder="දුරකථන අංකය ඇතුළත් කරන්න"
                      style={{ borderRadius: "10px" }}
                    />
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
                    type="button"
                    className="btn btn-primary btn-lg px-4"
                    onClick={handleSubmit}
                    style={{
                      borderRadius: "10px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    <CheckCircle size={16} className="me-2" />
                    {editingCourt ? "යාවත්කාලීන කරන්න" : "උසාවිය සාදන්න"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCourt && (
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
                  <h5 className="modal-title fw-bold d-flex align-items-center">
                    <Scale size={20} className="me-2" />
                    උසාවි විස්තර
                  </h5>
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
                      <p className="mb-0">{selectedCourt.name}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>දිස්ත්‍රික්කය:</strong>
                      <p className="mb-0">
                        {selectedCourt.districtName || selectedCourt.districtId}
                      </p>
                    </div>
                    <div className="col-12 mb-3">
                      <strong>ලිපිනය:</strong>
                      <p className="mb-0">{selectedCourt.address || "-"}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>දුරකථන අංකය:</strong>
                      <p className="mb-0">
                        {selectedCourt.contactNumber || "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                    style={{ borderRadius: "10px" }}
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

export default ManageCourtsPage;
