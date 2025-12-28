import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ManageUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statistics, setStatistics] = useState(null);

  const isProvincialAdmin = user?.roles?.includes("PROVINCIAL_ADMIN");
  const isDistrictAdmin = user?.roles?.includes("DISTRICT_ADMIN");

  // ADD DEBUGGING
  useEffect(() => {
    console.log("Current user:", user);
    console.log("User roles:", user?.roles);
    console.log("Is Provincial Admin:", isProvincialAdmin);
    console.log("Is District Admin:", isDistrictAdmin);
    console.log("User district:", user?.district);
    console.log("Token exists:", !!sessionStorage.getItem("token"));
  }, [user]);

  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Check if user has required roles
      if (!isProvincialAdmin && !isDistrictAdmin) {
        setError(
          "You don't have permission to view users. Required role: DISTRICT_ADMIN or PROVINCIAL_ADMIN"
        );
        setLoading(false);
        return;
      }

      let data;
      if (isProvincialAdmin) {
        console.log("Loading all users (Provincial Admin)");
        data = await api.getAllUsers();
      } else if (isDistrictAdmin && user?.district) {
        console.log("Loading users for district:", user.district);
        data = await api.getUsersByDistrict(user.district);
      } else {
        setError("District information missing");
        setLoading(false);
        return;
      }

      console.log("Loaded users:", data);
      setUsers(data || []);
      setError("");
    } catch (err) {
      console.error("Load users error:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const districtId = isDistrictAdmin ? user.district : null;
      console.log("Loading statistics for district:", districtId);
      const stats = await api.getUserStatistics(districtId);
      console.log("Loaded statistics:", stats);
      setStatistics(stats);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.society?.toLowerCase().includes(search)
      );
    }

    if (filterRole !== "ALL") {
      filtered = filtered.filter((u) => u.roles.some((r) => r === filterRole));
    }

    if (filterStatus === "ACTIVE") {
      filtered = filtered.filter((u) => u.enabled);
    } else if (filterStatus === "DEACTIVE") {
      filtered = filtered.filter((u) => !u.enabled);
    }

    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (userId) => {
    if (window.confirm("Are you sure you want to change this user's status?")) {
      try {
        await api.toggleUserStatus(userId);
        setSuccess("User status updated successfully");
        loadUsers();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.message || "Failed to update user status");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await api.deleteUser(userId);
        setSuccess("User deleted successfully");
        loadUsers();
        loadStatistics();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.message || "Failed to delete user");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const getRoleBadge = (roles) => {
    const roleColors = {
      SOCIETY_ADMIN: "primary",
      SOCIETY_APPROVAL: "info",
      OFFICER: "success",
      DISTRICT_ADMIN: "warning",
      PROVINCIAL_ADMIN: "danger",
    };

    return roles.map((role) => (
      <span
        key={role}
        className={`badge bg-${roleColors[role] || "secondary"} me-1`}
      >
        {role.replace("_", " ")}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  // ADD PERMISSION CHECK UI
  if (!isProvincialAdmin && !isDistrictAdmin) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger mt-5">
          <AlertCircle size={24} className="me-2" />
          <h4>Access Denied</h4>
          <p>You don't have permission to access user management.</p>
          <p>
            Required role: <strong>DISTRICT_ADMIN</strong> or{" "}
            <strong>PROVINCIAL_ADMIN</strong>
          </p>
          <p>
            Your current roles:{" "}
            <strong>{user?.roles?.join(", ") || "None"}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold">
            <Users className="me-2" />
            පරිශීලක කළමනාකරණය (User Management)
          </h2>
          <small className="text-muted">
            Logged in as: {user?.name} ({user?.roles?.join(", ")})
          </small>
        </div>
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

      {/* Statistics Cards */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div
              className="card  text-white"
              style={{
                background: "linear-gradient(135deg, #8391ce 0%, #af8ecf 100%)",
              }}
            >
              <div className="card-body">
                <h6>Total Users</h6>
                <h3>{statistics.totalUsers}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="card  text-white"
              style={{
                background: "linear-gradient(135deg, #7b5cca 0%, #a3e8d5 100%)",
              }}
            >
              <div className="card-body">
                <h6>Enabled</h6>
                <h3>{statistics.enabledUsers}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="card  text-white"
              style={{
                background: "linear-gradient(135deg, #7584c8 0%, #7eb9d6 100%)",
              }}
            >
              <div className="card-body">
                <h6>Disabled</h6>
                <h3>{statistics.disabledUsers}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="card  text-white"
              style={{
                background: "linear-gradient(135deg, #6ccca9 0%, #af8ecf 100%)",
              }}
            >
              <div className="card-body">
                <h6>Society Users</h6>
                <h3>
                  {statistics.societyAdmins + statistics.societyApprovals}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, or society..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="SOCIETY_ADMIN">Society Admin</option>
                <option value="SOCIETY_APPROVAL">Society Approval</option>
                <option value="OFFICER">Officer</option>
                <option value="DISTRICT_ADMIN">District Admin</option>
                <option value="PROVINCIAL_ADMIN">Provincial Admin</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active </option>
                <option value="DEACTIVE">Deactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Society/District</th>
                  <th>Status</th>
                  {/* Hide Actions column if user is Provincial Admin */}
                  {!isProvincialAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isProvincialAdmin ? "5" : "6"}
                      className="text-center text-muted py-4"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.email}</td>
                      <td>{getRoleBadge(u.roles)}</td>
                      <td>
                        {u.society && (
                          <div
                            className="text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            <small className="text-muted">Society:</small>{" "}
                            {u.society}
                          </div>
                        )}
                        {u.district && (
                          <div>
                            <small className="text-muted">District:</small>{" "}
                            {u.district}
                          </div>
                        )}
                      </td>
                      <td>
                        {u.enabled ? (
                          <span className="badge bg-success">
                            <CheckCircle size={14} className="me-1" />
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            <XCircle size={14} className="me-1" />
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Hide action buttons if user is Provincial Admin */}
                      {!isProvincialAdmin && (
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-info"
                              onClick={() => handleToggleStatus(u.id)}
                              title={u.enabled ? "Disable User" : "Enable User"}
                            >
                              {u.enabled ? (
                                <ToggleRight size={14} />
                              ) : (
                                <ToggleLeft size={14} />
                              )}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;
