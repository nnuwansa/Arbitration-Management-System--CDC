import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building, AlertCircle, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(formData);

      const { token, ...userData } = response;

      console.log("Login successful:", { token: token ? "✓" : "✗", userData });

      login(userData, token);
      console.log("🔑 Login called with userData:", userData);
      console.log("🔑 Society ID from login:", userData.societyId);

      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
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
      {/* Left Side - Branding  */}
      <div
        className="d-none d-xl-flex col-xl-6 flex-column justify-content-center align-items-center text-white p-5"
        style={{
          background: "linear-gradient(135deg, #3b4254 0%, #764ba2 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, maxWidth: "500px" }}>
          <div className="mb-4">
            <Building size={64} strokeWidth={1.5} />
          </div>

          <h1 className="display-4 fw-bold mb-3" style={{ fontSize: "3rem" }}>
            Arbitration Management System
          </h1>
          <h2 className="h3 mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>
            Central Province
          </h2>

          <p
            className="lead mb-5"
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            A platform for managing Central Province Cooperative debt recovery
            and arbitration.
          </p>

          <div className="d-flex flex-column gap-4 mt-5">
            <div className="d-flex align-items-start">
              <div
                className="me-3 mt-1"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building size={24} />
              </div>
              <div>
                <h5 className="mb-1">Case Management</h5>
                <p
                  className="mb-0"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.95rem",
                  }}
                >
                  Track and manage arbitration cases efficiently
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start">
              <div
                className="me-3 mt-1"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <h5 className="mb-1">Debt Recovery</h5>
                <p
                  className="mb-0"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.95rem",
                  }}
                >
                  Streamlined cooperative debt recovery processes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            top: "-100px",
            right: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            bottom: "-50px",
            left: "-50px",
          }}
        />
      </div>

      {/* Right Side - Login Form - */}
      <div
        className="col-12 col-xl-6 d-flex flex-column justify-content-center align-items-center p-3 p-xl-4"
        style={{
          background: "linear-gradient(45deg, #313748 0%, #7647a5 100%)",
          minHeight: "100vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: "450px", padding: "0 0.5rem" }}>
          {/* Mobile Logo -  */}
          <div className="d-block d-xl-none text-center mb-4">
            <Building size={48} style={{ color: "#9f7aea" }} />
            <h4
              className="mt-2"
              style={{
                color: "#ffffff",
                fontSize: "1.1rem",
                fontWeight: "600",
              }}
            >
              Arbitration Management System
            </h4>
          </div>

          {/* Login Card */}
          <div
            className="p-3 p-md-4 p-xl-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(102, 126, 234, 0.24) 0%, rgba(118, 75, 162, 0.223) 100%)",
              borderRadius: "24px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="text-center mb-3 mb-md-4">
              <h2
                className="fw-bold mb-2"
                style={{
                  color: "#ffffff",
                  fontSize: "1.75rem",
                }}
              >
                Welcome Back
              </h2>
              <p
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}
              >
                Access your account to continue
              </p>
            </div>

            {error && (
              <div
                className="alert d-flex align-items-center mb-3"
                role="alert"
                style={{
                  background: "rgba(220, 53, 69, 0.1)",
                  border: "1px solid rgba(220, 53, 69, 0.3)",
                  borderRadius: "12px",
                  color: "#ff6b6b",
                  padding: "10px 12px",
                }}
              >
                <AlertCircle size={18} className="me-2" />
                <span style={{ fontSize: "0.9rem" }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label
                  className="form-label fw-semibold mb-2"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.95rem",
                  }}
                >
                  Email Address
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
                      zIndex: 1,
                    }}
                  />
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    required
                    style={{
                      borderRadius: "12px",
                      paddingLeft: "48px",
                      paddingRight: "16px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label
                  className="form-label fw-semibold mb-2"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.95rem",
                  }}
                >
                  Password
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
                      zIndex: 1,
                    }}
                  />
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    required
                    style={{
                      borderRadius: "12px",
                      paddingLeft: "48px",
                      paddingRight: "16px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-lg w-100 fw-semibold mb-3 d-flex align-items-center justify-content-center"
                disabled={loading}
                style={{
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #253169 0%, #3d1962 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  fontSize: "1.05rem",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(102, 126, 234, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(102, 126, 234, 0.4)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={20} className="ms-2" />
                  </>
                )}
              </button>
            </form>

            <hr
              style={{
                border: "none",
                height: "1px",
                background: "rgba(255,255,255,0.1)",
                margin: "1.5rem 0",
              }}
            />

            <div className="text-center">
              <p
                className="mb-2"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}
              >
                Don't have an account?
              </p>
              <Link
                to="/signup"
                className="btn w-100"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "transparent",
                  color: "#9f7aea",
                  border: "2px solid #7c3aed",
                  padding: "10px 12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#7c3aed";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#9f7aea";
                }}
              >
                Register Now
              </Link>
            </div>
          </div>

          <p
            className="text-center mt-3"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}
          >
            © 2025 Central Province Cooperative. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
