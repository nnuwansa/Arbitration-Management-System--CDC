import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const DashboardLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [districtName, setDistrictName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const isSocietyUser =
    user?.roles?.includes("SOCIETY_ADMIN") ||
    user?.roles?.includes("SOCIETY_APPROVAL");

  useEffect(() => {
    loadUserDisplayData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadUserDisplayData = async () => {
    try {
      if (user?.district) {
        const districts = await api.getDistricts();
        const userDistrict = districts.find((d) => d.id === user.district);
        if (userDistrict) {
          setDistrictName(userDistrict.name);
        } else {
          setDistrictName(user.district);
        }
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      if (user?.district) setDistrictName(user.district);
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Top Navigation Bar */}
      <nav
        className="navbar navbar-dark shadow-sm"
        style={{
          background: "linear-gradient(75deg, #7647a5 0%, #363c4f 100%)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          minHeight: "60px",
        }}
      >
        <div className="container-fluid px-2 px-md-3">
          <div className="d-flex align-items-center justify-content-between w-100">
            {/* Left Section: Menu + Title */}
            <div className="d-flex align-items-center flex-grow-1 me-2">
              {/* Menu Button */}
              <button
                className="btn btn-link text-white p-1 me-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ minWidth: "40px", textDecoration: "none" }}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Brand Title */}
              <div
                className="navbar-brand mb-0 fw-bold"
                style={{
                  fontSize: "clamp(0.75rem, 2vw, 1.25rem)",
                  lineHeight: "1.2",
                }}
              >
                <div className="d-none d-xl-inline">
                  Arbitration Management System - Central Province Cooperative
                  Department
                </div>
                <div className="d-none d-lg-inline d-xl-none">
                  AMS - Central Province Cooperative Dept
                </div>
                <div className="d-none d-md-inline d-lg-none">
                  AMS - CP Cooperative Dept
                </div>
                <div className="d-inline d-md-none">AMS - CPC</div>
              </div>
            </div>

            {/* Right Section: User Info */}
            {/* Desktop View */}
            <div
              className="text-white text-end d-none d-lg-flex flex-column"
              style={{ minWidth: "180px", maxWidth: "250px" }}
            >
              <div style={{ fontSize: "0.90rem", fontWeight: "600" }}>
                {user?.roles?.map((role) => role.replace("_", " ")).join(", ")}
              </div>
              <small
                className="opacity-75"
                style={{ fontSize: "0.8rem", wordBreak: "break-all" }}
              >
                {user?.email}
              </small>
              <small className="opacity-85" style={{ fontSize: "0.75rem" }}>
                {isSocietyUser ? (
                  <>
                    {user?.society || "N/A"} - {districtName || "N/A"}
                  </>
                ) : (
                  <>
                    {districtName ||
                      user?.district?.toUpperCase() ||
                      "Provincial"}
                  </>
                )}
              </small>
            </div>

            {/* Tablet View */}
            <div
              className="text-white d-none d-md-flex d-lg-none flex-column align-items-end"
              style={{ fontSize: "0.7rem" }}
            >
              <div className="fw-bold">{user?.roles?.[0]?.split("_")[0]}</div>
              <small className="opacity-75">
                {districtName?.substring(0, 12) || "N/A"}
              </small>
            </div>

            {/* Mobile View */}
            <div className="d-flex d-md-none">
              <div
                className="text-white text-center px-2 py-1"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  minWidth: "50px",
                }}
              >
                <div className="fw-bold" style={{ lineHeight: "1.2" }}>
                  {user?.roles?.[0]?.split("_")[0] || "USER"}
                </div>
                <small className="opacity-85" style={{ fontSize: "0.6rem" }}>
                  {districtName?.substring(0, 8) || "N/A"}
                </small>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div
        className="d-flex"
        style={{ marginTop: "60px", minHeight: "calc(100vh - 60px)" }}
      >
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && isMobile && (
          <div
            className="position-fixed"
            style={{
              top: "60px",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "d-block" : "d-none"}`}
          style={{
            width: "250px",
            flexShrink: 0,
            position: isMobile ? "fixed" : "sticky",
            top: isMobile ? "60px" : "60px",
            left: 0,
            height: isMobile ? "calc(100vh - 60px)" : "calc(100vh - 60px)",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <div
          className="flex-grow-1"
          style={{
            backgroundColor: "#decaf3",
            minHeight: "calc(100vh - 60px)",
            padding: "1rem",
            paddingLeft: !isMobile && sidebarOpen ? "1rem" : "1rem",
            paddingRight: "1rem",
          }}
        >
          <div style={{ maxWidth: "100%", overflowX: "auto" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

