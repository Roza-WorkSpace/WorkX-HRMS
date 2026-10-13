import { useState, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  X,
  User,
  GraduationCap,
  CreditCard,
  Users,
  Award,
  Briefcase,
  ShieldCheck,
  PlusCircle,
  Trash2,
  Building2,
  UserCheck,
  Camera,
  Plus,
} from "lucide-react";

export default function ProfilePage({ userProfile, setUserProfile, savedMsg, setProfileSavedMsg }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("information"); // 'information' | 'organisation'

  // Track open accordion sections
  const [openSections, setOpenSections] = useState({
    personalInfo: false,
    education: false,
    personalId: false,
    family: false,
    bank: false,
    nomination: false,
    certifications: false,
    experiences: false,
    myDetails: false,
    orgRelationship: false,
    myTeam: false,
  });

  const [editingSection, setEditingSection] = useState(null);

  // Profile Form Data
  const [formData, setFormData] = useState({
    avatar: userProfile?.avatar || "",
    // Header & Summary Data
    firstName: userProfile?.name ? userProfile.name.split(" ")[0] : "",
    lastName: userProfile?.name ? userProfile.name.split(" ").slice(1).join(" ") : "",
    role: userProfile?.role || "",
    location: userProfile?.location || "",
    startDate: userProfile?.joinedDate || "",
    reportingManager: "",
    officialEmail: userProfile?.email || "",
    linkedinUrl: "",
    aboutMe: "",

    // 1. Personal Information
    dob: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    bloodGroup: "",
    religion: "",
    motherTongue: "",
    caste: "",
    personalPhone: userProfile?.phone || "",
    personalEmail: "",

    // 2. Education Details
    degree: "",
    institution: "",
    fieldOfStudy: "",
    passingYear: "",
    gradePercentage: "",

    // 3. Personal ID
    aadhaarNo: "",
    panNo: "",
    passportNo: "",
    voterId: "",

    // 4. Family Details
    fatherName: "",
    motherName: "",
    spouseName: "",
    emergencyContactName: "",
    emergencyContactPhone: "",

    // 5. Bank Details
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    accountType: "",

    // 6. Nomination Details
    nomineeName: "",
    relationship: "",
    nomineeDob: "",
    allocationPercentage: "",

    // 7. Certifications
    certName: "",
    issuingOrg: "",
    issueDate: "",
    credentialId: "",

    // --- MY ORGANISATION FIELDS ---
    department: userProfile?.department || "",
    employeeId: "",
    employmentType: "",
    workLocation: "",
    jobGrade: "",
    businessUnit: "",

    // 3. My Team
    teamLeadName: "",
    teamLeadEmail: "",
    reportingManagerEmail: "",
  });

  const [experiences, setExperiences] = useState([
    {
      id: Date.now(),
      previousCompany: "",
      previousDesignation: "",
      totalExperienceYears: "",
      previousJoiningDate: "",
      previousRelievingDate: "",
    },
  ]);

  // Handle Profile Picture File Change
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: imageUrl }));

      // Sync with global state so header updates instantly
      if (setUserProfile) {
        setUserProfile((prev) => ({ ...prev, avatar: imageUrl }));
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (id, field, value) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const addExperienceCard = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: Date.now(),
        previousCompany: "",
        previousDesignation: "",
        totalExperienceYears: "",
        previousJoiningDate: "",
        previousRelievingDate: "",
      },
    ]);
  };

  const removeExperienceCard = (id) => {
    if (experiences.length === 1) {
      setExperiences([
        {
          id: Date.now(),
          previousCompany: "",
          previousDesignation: "",
          totalExperienceYears: "",
          previousJoiningDate: "",
          previousRelievingDate: "",
        },
      ]);
    } else {
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  const startEditing = (e, sectionKey) => {
    if (e) e.stopPropagation();
    setEditingSection(sectionKey);
    if (sectionKey !== "header") {
      setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
    }
  };

  const saveEditing = (e) => {
    if (e) e.stopPropagation();

    // Construct updated name and profile object
    const newFullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ");

    const updatedProfile = {
      ...userProfile,
      name: newFullName || userProfile?.name,
      role: formData.role,
      location: formData.location,
      joinedDate: formData.startDate,
      email: formData.officialEmail,
      phone: formData.personalPhone,
      department: formData.department,
      avatar: formData.avatar,
    };

    // Sync up to App.jsx global state
    if (setUserProfile) {
      setUserProfile(updatedProfile);
    }

    // Toggle off edit mode to return back to display header
    setEditingSection(null);

    // Trigger success alert toast
    if (setProfileSavedMsg) {
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    }
  };

  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingSection(null);
  };

  const isSectionFilled = (keys) => {
    return keys.some((key) => formData[key] && formData[key].trim() !== "");
  };

  const hasExperiencesFilled = experiences.some(
    (exp) =>
      exp.previousCompany.trim() !== "" ||
      exp.previousDesignation.trim() !== "" ||
      exp.totalExperienceYears.trim() !== ""
  );

  const renderAccordionHeader = (title, sectionKey, IconComponent, hasData) => {
    const isOpen = openSections[sectionKey];
    const isEditing = editingSection === sectionKey;

    return (
      <div
        onClick={() => toggleSection(sectionKey)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          backgroundColor: isOpen ? "#f8fafc" : "#ffffff",
          cursor: "pointer",
          userSelect: "none",
          borderBottom: isOpen ? "1px solid #e2e8f0" : "none",
          transition: "background-color 0.2s ease",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
          <div
            style={{
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: isOpen ? "#eff6ff" : "#f1f5f9",
              color: isOpen ? "#0066FF" : "#64748b",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <IconComponent size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </h3>
            {!hasData && !isEditing && (
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>No details added yet</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {isEditing ? (
            <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={saveEditing}
                className="accordion-save-btn"
                title="Save Changes"
              >
                <Check size={14} />
                <span className="action-btn-text">Save</span>
              </button>
              <button
                onClick={cancelEditing}
                className="accordion-cancel-btn"
                title="Cancel"
              >
                <X size={14} />
                <span className="action-btn-text">Cancel</span>
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => startEditing(e, sectionKey)}
              className="accordion-action-btn"
              style={{
                backgroundColor: hasData ? "#eff6ff" : "#f0fdf4",
                color: hasData ? "#0066FF" : "#16a34a",
              }}
              title={hasData ? "Edit Section" : "Fill Info"}
            >
              {hasData ? (
                <>
                  <Edit3 size={14} />
                  <span className="btn-text-full">Edit</span>
                </>
              ) : (
                <>
                  <PlusCircle size={14} className="btn-icon-full" />
                  <Plus size={16} className="btn-icon-mobile" />
                  <span className="btn-text-full">Fill Info</span>
                </>
              )}
            </button>
          )}

          {isOpen ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
        </div>
      </div>
    );
  };

  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ");
  const displayName = fullName.trim() !== "" ? fullName : "User Name";

  const firstInitial = formData.firstName ? formData.firstName[0] : "";
  const lastInitial = formData.lastName ? formData.lastName[0] : "";
  const initials = (firstInitial + lastInitial).toUpperCase() || "--";

  const isEditingHeader = editingSection === "header";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Injected Mobile Responsive Styles */}
      <style>{`
        .dark-header-card {
          background-color: #030712;
          color: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #1e293b;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .header-top-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .profile-tabs-container {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .accordion-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background-color: #16a34a;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .accordion-cancel-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background-color: #cbd5e1;
          color: #334155;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .accordion-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-icon-mobile {
          display: none;
        }

        @media (max-width: 640px) {
          .action-btn-text {
            display: none;
          }

          .accordion-save-btn, .accordion-cancel-btn {
            padding: 6px 8px;
            border-radius: 6px;
          }

          .btn-text-full {
            display: none;
          }

          .btn-icon-full {
            display: none;
          }

          .btn-icon-mobile {
            display: inline-block;
          }

          .accordion-action-btn {
            padding: 6px 8px;
          }
        }

        @media (max-width: 768px) {
          .dark-header-card {
            padding: 16px;
          }

          .header-main-content {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            gap: 16px !important;
          }

          .profile-info-section {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
          }

          .profile-details-column {
            width: 100% !important;
            margin-left: 0 !important;
            align-items: stretch !important;
          }

          .dark-details-grid {
            grid-template-columns: 1fr !important;
            text-align: left;
            width: 100%;
            box-sizing: border-box;
          }

          .profile-tabs-container {
            flex-direction: column !important;
            width: 100%;
            gap: 8px !important;
          }

          .profile-tabs-container button {
            width: 100%;
            text-align: center;
            padding: 12px 20px !important;
          }
        }
      `}</style>

      {savedMsg && (
        <div
          style={{
            color: "#166534",
            backgroundColor: "#dcfce7",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Profile details updated successfully!
        </div>
      )}

      {/* DARK HEADER CARD */}
      <div className="dark-header-card">
        <div className="header-top-title-row">
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1px",
              color: "#60a5fa",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            User Overview
          </span>

          {!isEditingHeader && (
            <button onClick={(e) => startEditing(e, "header")} style={headerEditBtnStyle}>
              <Edit3 size={14} /> Edit Header
            </button>
          )}
        </div>

        {isEditingHeader ? (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "16px" }}>
              <button onClick={saveEditing} style={headerSaveBtnStyle}>
                <Check size={14} /> Save Header
              </button>
              <button onClick={cancelEditing} style={headerCancelBtnStyle}>
                <X size={14} /> Cancel
              </button>
            </div>
            <div className="dark-header-form-grid">
              <div>
                <label style={darkLabelStyle}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                  placeholder="Enter First Name"
                />
              </div>
              <div>
                <label style={darkLabelStyle}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                  placeholder="Enter Last Name"
                />
              </div>
              <div>
                <label style={darkLabelStyle}>Designation / Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                  placeholder="e.g. UI/UX Designer"
                />
              </div>
              <div>
                <label style={darkLabelStyle}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                  placeholder="e.g. Bhubaneswar, India"
                />
              </div>
              <div>
                <label style={darkLabelStyle}>Started On</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                />
              </div>
              <div>
                <label style={darkLabelStyle}>Reporting Manager</label>
                <input
                  type="text"
                  name="reportingManager"
                  value={formData.reportingManager}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                  placeholder="Manager Name"
                />
              </div>
              <div>
                <label style={darkLabelStyle}>Official Email</label>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                  placeholder="official@company.com"
                />
              </div>
              <div>
                <label style={darkLabelStyle}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleFieldChange}
                  style={darkInputStyle}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={darkLabelStyle}>Short About Me Summary</label>
                <textarea
                  name="aboutMe"
                  rows={3}
                  value={formData.aboutMe}
                  onChange={handleFieldChange}
                  placeholder="Write a brief professional introduction..."
                  style={{
                    ...darkInputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* RESPONSIVE LAYOUT CONTAINER */
          <div
            className="header-main-content"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            {/* Left Side: Avatar & Name */}
            <div className="profile-info-section" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    backgroundColor: "#0066FF",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "700",
                    boxShadow: "0 4px 14px rgba(0, 102, 255, 0.4)",
                    overflow: "hidden",
                    backgroundImage: formData.avatar ? `url(${formData.avatar})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!formData.avatar && initials}
                </div>

                <button
                  type="button"
                  onClick={triggerFileInput}
                  title="Change Profile Picture"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: "#0066FF",
                    border: "2px solid #030712",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  <Camera size={13} />
                </button>
              </div>

              <div>
                <h2 style={{ margin: "0 0 4px 0", fontSize: "22px", color: "#ffffff", fontWeight: "700" }}>
                  {displayName}
                </h2>

                <p style={{ margin: "0 0 6px 0", color: formData.role ? "#94a3b8" : "#64748b", fontSize: "14px", fontWeight: "500" }}>
                  {formData.role || "Add Designation"}
                </p>

                <div>
                  {formData.linkedinUrl ? (
                    <a
                      href={formData.linkedinUrl.startsWith("http") ? formData.linkedinUrl : `https://${formData.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#60a5fa", textDecoration: "underline", fontSize: "13px", fontWeight: "500" }}
                    >
                      {formData.linkedinUrl}
                    </a>
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "13px", fontStyle: "italic" }}>
                      Add LinkedIn Profile
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Dark Details Grid Box */}
            <div className="profile-details-column" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", marginLeft: "auto" }}>
              <div
                className="dark-details-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px 24px",
                  padding: "16px 20px",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "12px",
                  border: "1px solid #1e293b",
                  minWidth: "280px",
                }}
              >
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "11px", marginBottom: "2px" }}>
                    Location
                  </span>
                  <strong style={{ color: formData.location ? "#f8fafc" : "#64748b", fontSize: "13px" }}>
                    {formData.location || "Not Provided"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "11px", marginBottom: "2px" }}>
                    Started On
                  </span>
                  <strong style={{ color: formData.startDate ? "#f8fafc" : "#64748b", fontSize: "13px" }}>
                    {formData.startDate || "Not Provided"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "11px", marginBottom: "2px" }}>
                    Reporting Manager
                  </span>
                  <strong style={{ color: formData.reportingManager ? "#f8fafc" : "#64748b", fontSize: "13px" }}>
                    {formData.reportingManager || "Not Provided"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "11px", marginBottom: "2px" }}>
                    Official Email
                  </span>
                  <strong style={{ color: formData.officialEmail ? "#f8fafc" : "#64748b", fontSize: "13px" }}>
                    {formData.officialEmail || "Not Provided"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isEditingHeader && (
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #1e293b",
            }}
          >
            <span style={{ color: "#64748b", fontSize: "11px", display: "block", marginBottom: "4px" }}>
              ABOUT ME
            </span>
            {formData.aboutMe && formData.aboutMe.trim() !== "" ? (
              <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13.5px", lineHeight: "1.5" }}>
                {formData.aboutMe}
              </p>
            ) : (
              <span style={{ color: "#475569", fontSize: "12px" }}>
                ---
              </span>
            )}
          </div>
        )}

        <div className="profile-tabs-container">
          <button
            onClick={() => setActiveTab("information")}
            style={{
              padding: "8px 20px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: activeTab === "information" ? "#0066FF" : "#1e293b",
              color: activeTab === "information" ? "#ffffff" : "#94a3b8",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            My Information
          </button>
          <button
            onClick={() => setActiveTab("organisation")}
            style={{
              padding: "8px 20px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: activeTab === "organisation" ? "#0066FF" : "#1e293b",
              color: activeTab === "organisation" ? "#ffffff" : "#94a3b8",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            My Organisation
          </button>
        </div>
      </div>

      {/* ACCORDIONS */}
      {activeTab === "information" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* 1. PERSONAL INFORMATION */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "1. Personal Information",
              "personalInfo",
              User,
              isSectionFilled(["dob", "gender", "maritalStatus", "nationality", "bloodGroup", "religion", "motherTongue", "caste", "personalPhone", "personalEmail"])
            )}
            {openSections.personalInfo && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Date Of Birth" name="dob" type="date" value={formData.dob} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} />
                  <FormField label="Gender" name="gender" value={formData.gender} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="e.g. Female / Male" />
                  <FormField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="e.g. Single / Married" />
                  <FormField label="Nationality" name="nationality" value={formData.nationality} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="e.g. Indian" />
                  <FormField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="e.g. O+" />
                  <FormField label="Religion" name="religion" value={formData.religion} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="e.g. Hindu" />
                  <FormField label="Mother Tongue" name="motherTongue" value={formData.motherTongue} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="e.g. Odia" />
                  <FormField label="Caste" name="caste" value={formData.caste} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="e.g. General" />
                  <FormField label="Personal Phone" name="personalPhone" value={formData.personalPhone} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="+91 XXXXXXXXXX" />
                  <FormField label="Personal Email" name="personalEmail" value={formData.personalEmail} isEditing={editingSection === "personalInfo"} onChange={handleFieldChange} placeholder="user@example.com" />
                </div>
              </div>
            )}
          </div>

          {/* 2. EDUCATION DETAILS */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "2. Education Details",
              "education",
              GraduationCap,
              isSectionFilled(["degree", "institution", "fieldOfStudy", "passingYear", "gradePercentage"])
            )}
            {openSections.education && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Degree / Qualification" name="degree" value={formData.degree} isEditing={editingSection === "education"} onChange={handleFieldChange} placeholder="e.g. B.Tech / B.Sc" />
                  <FormField label="Institute / University" name="institution" value={formData.institution} isEditing={editingSection === "education"} onChange={handleFieldChange} placeholder="e.g. University Name" />
                  <FormField label="Field Of Study" name="fieldOfStudy" value={formData.fieldOfStudy} isEditing={editingSection === "education"} onChange={handleFieldChange} placeholder="e.g. Computer Science" />
                  <FormField label="Passing Year" name="passingYear" value={formData.passingYear} isEditing={editingSection === "education"} onChange={handleFieldChange} placeholder="e.g. 2022" />
                  <FormField label="Grade / Percentage" name="gradePercentage" value={formData.gradePercentage} isEditing={editingSection === "education"} onChange={handleFieldChange} placeholder="e.g. 80%" />
                </div>
              </div>
            )}
          </div>

          {/* 3. PERSONAL ID */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "3. Personal ID",
              "personalId",
              ShieldCheck,
              isSectionFilled(["aadhaarNo", "panNo", "passportNo", "voterId"])
            )}
            {openSections.personalId && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Aadhaar Number" name="aadhaarNo" value={formData.aadhaarNo} isEditing={editingSection === "personalId"} onChange={handleFieldChange} placeholder="XXXX-XXXX-XXXX" />
                  <FormField label="PAN Number" name="panNo" value={formData.panNo} isEditing={editingSection === "personalId"} onChange={handleFieldChange} placeholder="ABCDE1234F" />
                  <FormField label="Passport Number" name="passportNo" value={formData.passportNo} isEditing={editingSection === "personalId"} onChange={handleFieldChange} placeholder="Passport No" />
                  <FormField label="Voter ID Card" name="voterId" value={formData.voterId} isEditing={editingSection === "personalId"} onChange={handleFieldChange} placeholder="Voter ID No" />
                </div>
              </div>
            )}
          </div>

          {/* 4. FAMILY DETAILS */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "4. Family Details",
              "family",
              Users,
              isSectionFilled(["fatherName", "motherName", "spouseName", "emergencyContactName", "emergencyContactPhone"])
            )}
            {openSections.family && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Father's Name" name="fatherName" value={formData.fatherName} isEditing={editingSection === "family"} onChange={handleFieldChange} placeholder="Father's Name" />
                  <FormField label="Mother's Name" name="motherName" value={formData.motherName} isEditing={editingSection === "family"} onChange={handleFieldChange} placeholder="Mother's Name" />
                  <FormField label="Spouse Name" name="spouseName" value={formData.spouseName} isEditing={editingSection === "family"} onChange={handleFieldChange} placeholder="Spouse Name" />
                  <FormField label="Emergency Contact Person" name="emergencyContactName" value={formData.emergencyContactName} isEditing={editingSection === "family"} onChange={handleFieldChange} placeholder="Contact Name" />
                  <FormField label="Emergency Contact Phone" name="emergencyContactPhone" value={formData.emergencyContactPhone} isEditing={editingSection === "family"} onChange={handleFieldChange} placeholder="+91 XXXXXXXXXX" />
                </div>
              </div>
            )}
          </div>

          {/* 5. BANK DETAILS */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "5. Bank Details",
              "bank",
              CreditCard,
              isSectionFilled(["bankName", "accountNumber", "ifscCode", "branchName", "accountType"])
            )}
            {openSections.bank && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Bank Name" name="bankName" value={formData.bankName} isEditing={editingSection === "bank"} onChange={handleFieldChange} placeholder="e.g. HDFC Bank" />
                  <FormField label="Account Number" name="accountNumber" value={formData.accountNumber} isEditing={editingSection === "bank"} onChange={handleFieldChange} placeholder="Account Number" />
                  <FormField label="IFSC Code" name="ifscCode" value={formData.ifscCode} isEditing={editingSection === "bank"} onChange={handleFieldChange} placeholder="IFSC Code" />
                  <FormField label="Branch Name" name="branchName" value={formData.branchName} isEditing={editingSection === "bank"} onChange={handleFieldChange} placeholder="Branch Location" />
                  <FormField label="Account Type" name="accountType" value={formData.accountType} isEditing={editingSection === "bank"} onChange={handleFieldChange} placeholder="Savings / Current" />
                </div>
              </div>
            )}
          </div>

          {/* 6. NOMINATION DETAILS */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "6. Nomination Details",
              "nomination",
              Users,
              isSectionFilled(["nomineeName", "relationship", "nomineeDob", "allocationPercentage"])
            )}
            {openSections.nomination && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Nominee Name" name="nomineeName" value={formData.nomineeName} isEditing={editingSection === "nomination"} onChange={handleFieldChange} placeholder="Nominee Full Name" />
                  <FormField label="Relationship" name="relationship" value={formData.relationship} isEditing={editingSection === "nomination"} onChange={handleFieldChange} placeholder="e.g. Spouse / Father / Mother" />
                  <FormField label="Nominee Date of Birth" name="nomineeDob" type="date" value={formData.nomineeDob} isEditing={editingSection === "nomination"} onChange={handleFieldChange} />
                  <FormField label="Allocation (%)" name="allocationPercentage" value={formData.allocationPercentage} isEditing={editingSection === "nomination"} onChange={handleFieldChange} placeholder="e.g. 100%" />
                </div>
              </div>
            )}
          </div>

          {/* 7. CERTIFICATIONS */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "7. Certifications",
              "certifications",
              Award,
              isSectionFilled(["certName", "issuingOrg", "issueDate", "credentialId"])
            )}
            {openSections.certifications && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Certification Name" name="certName" value={formData.certName} isEditing={editingSection === "certifications"} onChange={handleFieldChange} placeholder="e.g. AWS Certified Developer" />
                  <FormField label="Issuing Organization" name="issuingOrg" value={formData.issuingOrg} isEditing={editingSection === "certifications"} onChange={handleFieldChange} placeholder="e.g. Amazon Web Services" />
                  <FormField label="Issue Date" name="issueDate" type="date" value={formData.issueDate} isEditing={editingSection === "certifications"} onChange={handleFieldChange} />
                  <FormField label="Credential ID" name="credentialId" value={formData.credentialId} isEditing={editingSection === "certifications"} onChange={handleFieldChange} placeholder="Credential ID Number" />
                </div>
              </div>
            )}
          </div>

          {/* 8. EXPERIENCES */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "8. Experiences",
              "experiences",
              Briefcase,
              hasExperiencesFilled
            )}
            {openSections.experiences && (
              <div style={contentPaddingStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {experiences.map((exp, index) => {
                    const isEditing = editingSection === "experiences";
                    return (
                      <div
                        key={exp.id}
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: "10px",
                          padding: "16px",
                          border: "1px solid #e2e8f0",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                            paddingBottom: "8px",
                            borderBottom: "1px solid #cbd5e1",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#0066FF",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Experience #{index + 1}
                          </span>
                          {isEditing && (
                            <button
                              onClick={() => removeExperienceCard(exp.id)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                backgroundColor: "#fef2f2",
                                color: "#ef4444",
                                border: "1px solid #fecaca",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          )}
                        </div>

                        <div style={gridStyle}>
                          <FormField label="Previous Company" name="previousCompany" value={exp.previousCompany} isEditing={isEditing} onChange={(e) => handleExperienceChange(exp.id, "previousCompany", e.target.value)} placeholder="Company Name" />
                          <FormField label="Previous Designation" name="previousDesignation" value={exp.previousDesignation} isEditing={isEditing} onChange={(e) => handleExperienceChange(exp.id, "previousDesignation", e.target.value)} placeholder="Job Title" />
                          <FormField label="Total Experience" name="totalExperienceYears" value={exp.totalExperienceYears} isEditing={isEditing} onChange={(e) => handleExperienceChange(exp.id, "totalExperienceYears", e.target.value)} placeholder="e.g. 2 Years" />
                          <FormField label="Joining Date" name="previousJoiningDate" type="date" value={exp.previousJoiningDate} isEditing={isEditing} onChange={(e) => handleExperienceChange(exp.id, "previousJoiningDate", e.target.value)} />
                          <FormField label="Relieving Date" name="previousRelievingDate" type="date" value={exp.previousRelievingDate} isEditing={isEditing} onChange={(e) => handleExperienceChange(exp.id, "previousRelievingDate", e.target.value)} />
                        </div>
                      </div>
                    );
                  })}

                  {editingSection === "experiences" && (
                    <button
                      onClick={addExperienceCard}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "10px 16px",
                        backgroundColor: "#eff6ff",
                        color: "#0066FF",
                        border: "1px dashed #93c5fd",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <PlusCircle size={16} /> Add Another Experience
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* MY ORGANISATION TAB CONTENT */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* 1. MY DETAILS */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "1. My Details",
              "myDetails",
              User,
              isSectionFilled(["firstName", "lastName", "role", "location", "startDate", "officialEmail", "linkedinUrl", "aboutMe"])
            )}
            {openSections.myDetails && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="First Name" name="firstName" value={formData.firstName} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} placeholder="Enter First Name" />
                  <FormField label="Last Name" name="lastName" value={formData.lastName} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} placeholder="Enter Last Name" />
                  <FormField label="Designation / Role" name="role" value={formData.role} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} placeholder="e.g. UI/UX Designer" />
                  <FormField label="Location" name="location" value={formData.location} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} placeholder="e.g. Bhubaneswar, India" />
                  <FormField label="Started On" name="startDate" type="date" value={formData.startDate} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} />
                  <FormField label="Official Email" name="officialEmail" type="email" value={formData.officialEmail} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} placeholder="official@company.com" />
                  <FormField label="LinkedIn Profile URL" name="linkedinUrl" type="url" value={formData.linkedinUrl} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} placeholder="https://linkedin.com/in/username" />
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FormField label="About Me" name="aboutMe" value={formData.aboutMe} isEditing={editingSection === "myDetails"} onChange={handleFieldChange} placeholder="Brief introduction..." />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. ORGANIZATION RELATIONSHIP */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "2. Organization Relationship",
              "orgRelationship",
              Building2,
              isSectionFilled(["department", "employeeId", "employmentType", "workLocation", "jobGrade", "businessUnit"])
            )}
            {openSections.orgRelationship && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Department" name="department" value={formData.department} isEditing={editingSection === "orgRelationship"} onChange={handleFieldChange} placeholder="e.g. Product Design" />
                  <FormField label="Employee ID" name="employeeId" value={formData.employeeId} isEditing={editingSection === "orgRelationship"} onChange={handleFieldChange} placeholder="e.g. WX-2024-001" />
                  <FormField label="Employment Status / Type" name="employmentType" value={formData.employmentType} isEditing={editingSection === "orgRelationship"} onChange={handleFieldChange} placeholder="e.g. Full Time" />
                  <FormField label="Work Location" name="workLocation" value={formData.workLocation} isEditing={editingSection === "orgRelationship"} onChange={handleFieldChange} placeholder="e.g. Main HQ" />
                </div>
              </div>
            )}
          </div>

          {/* 3. MY TEAM */}
          <div style={accordionCardStyle}>
            {renderAccordionHeader(
              "3. My Team",
              "myTeam",
              UserCheck,
              isSectionFilled(["teamLeadName", "teamLeadEmail", "reportingManager", "reportingManagerEmail"])
            )}
            {openSections.myTeam && (
              <div style={contentPaddingStyle}>
                <div style={gridStyle}>
                  <FormField label="Team Lead Name" name="teamLeadName" value={formData.teamLeadName} isEditing={editingSection === "myTeam"} onChange={handleFieldChange} placeholder="Team Lead Name" />
                  <FormField label="Team Lead Email" name="teamLeadEmail" type="email" value={formData.teamLeadEmail} isEditing={editingSection === "myTeam"} onChange={handleFieldChange} placeholder="lead@company.com" />
                  <FormField label="Reporting Manager" name="reportingManager" value={formData.reportingManager} isEditing={editingSection === "myTeam"} onChange={handleFieldChange} placeholder="Manager Name" />
                  <FormField label="Reporting Manager Email" name="reportingManagerEmail" type="email" value={formData.reportingManagerEmail} isEditing={editingSection === "myTeam"} onChange={handleFieldChange} placeholder="manager@company.com" />
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// Reusable Form Field Component
function FormField({ label, name, value, isEditing, onChange, placeholder = "Enter value...", type = "text" }) {
  return (
    <div>
      <label style={{ color: "#64748b", display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "500" }}>
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={inputStyle}
        />
      ) : value && value.trim() !== "" ? (
        <strong style={{ color: "#1e293b", fontSize: "13.5px" }}>{value}</strong>
      ) : (
        <span
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            backgroundColor: "#ffffff",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
            display: "inline-block",
          }}
        >
          Not Provided
        </span>
      )}
    </div>
  );
}

// STYLES
const darkLabelStyle = {
  color: "#94a3b8",
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  fontWeight: "500",
};

const darkInputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #334155",
  backgroundColor: "#1e293b",
  color: "#f8fafc",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const headerEditBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  backgroundColor: "#1e293b",
  color: "#60a5fa",
  border: "1px solid #334155",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

const headerSaveBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  backgroundColor: "#16a34a",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

const headerCancelBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  backgroundColor: "#334155",
  color: "#f8fafc",
  border: "none",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

const accordionCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
};

const contentPaddingStyle = {
  padding: "20px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px 24px",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};