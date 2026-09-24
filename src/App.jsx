import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Building2,
  Wallet,
  BarChart3,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Menu,
  LogOut,
  UserRound,
  CheckCircle2,
  Clock3,
  UserX,
  Eye,
  ChevronDown,
} from "lucide-react";

const initialEmployees = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+91 9876543210",
    department: "IT",
    position: "Software Developer",
    joiningDate: "2024-01-15",
    status: "Active",
    salary: "65000",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+91 9876543211",
    department: "HR",
    position: "HR Manager",
    joiningDate: "2023-08-10",
    status: "Active",
    salary: "58000",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+91 9876543212",
    department: "Finance",
    position: "Accountant",
    joiningDate: "2024-03-20",
    status: "Active",
    salary: "52000",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+91 9876543213",
    department: "Marketing",
    position: "Marketing Executive",
    joiningDate: "2024-06-05",
    status: "On Leave",
    salary: "48000",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+91 9876543214",
    department: "IT",
    position: "UI/UX Designer",
    joiningDate: "2022-11-18",
    status: "Active",
    salary: "55000",
  },
];

const emptyEmployee = {
  name: "",
  email: "",
  phone: "",
  department: "IT",
  position: "",
  joiningDate: "",
  status: "Active",
  salary: "",
};

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "leave", label: "Leave Management", icon: CalendarDays },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "payroll", label: "Payroll", icon: Wallet },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

function App() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("employees");

    if (saved) {
      return JSON.parse(saved);
    }

    return initialEmployees;
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState(emptyEmployee);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  const departments = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
  ];

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const leaveEmployees = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const departmentsCount = new Set(
    employees.map((employee) => employee.department)
  ).size;

  const openAddEmployee = () => {
    setEditingEmployee(null);
    setFormData(emptyEmployee);
    setShowEmployeeModal(true);
  };

  const openEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      joiningDate: employee.joiningDate,
      status: employee.status,
      salary: employee.salary,
    });

    setShowEmployeeModal(true);
  };

  const openDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEmployeeSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.department ||
      !formData.position
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingEmployee) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...employee,
                ...formData,
              }
            : employee
        )
      );
    } else {
      const newEmployee = {
        id: Date.now(),
        ...formData,
      };

      setEmployees((previous) => [newEmployee, ...previous]);
    }

    setShowEmployeeModal(false);
    setEditingEmployee(null);
    setFormData(emptyEmployee);
  };

  const deleteEmployee = (id) => {
    const employee = employees.find((item) => item.id === id);

    if (!employee) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) return;

    setEmployees((previous) =>
      previous.filter((employee) => employee.id !== id)
    );
  };

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="company-logo">
            <Users size={25} />
          </div>

          <div>
            <h2>HRMS</h2>
            <span>Employee Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="menu-title">MAIN MENU</p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button">
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1>{getPageTitle(activePage)}</h1>
              <p>Manage your workforce efficiently</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="admin-profile">
              <div className="admin-avatar">
                <UserRound size={19} />
              </div>

              <div className="admin-info">
                <strong>Admin User</strong>
                <span>Administrator</span>
              </div>

              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <section className="page-content">
          {activePage === "dashboard" && (
            <Dashboard
              totalEmployees={totalEmployees}
              activeEmployees={activeEmployees}
              leaveEmployees={leaveEmployees}
              departmentsCount={departmentsCount}
              employees={employees}
              navigate={navigate}
              openDetails={openDetails}
            />
          )}

          {activePage === "employees" && (
            <EmployeesPage
              employees={filteredEmployees}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              departments={departments}
              openAddEmployee={openAddEmployee}
              openEditEmployee={openEditEmployee}
              openDetails={openDetails}
              deleteEmployee={deleteEmployee}
            />
          )}

          {activePage === "attendance" && (
            <AttendancePage employees={employees} />
          )}

          {activePage === "leave" && <LeavePage employees={employees} />}

          {activePage === "departments" && (
            <DepartmentsPage employees={employees} />
          )}

          {activePage === "payroll" && <PayrollPage employees={employees} />}

          {activePage === "reports" && <ReportsPage employees={employees} />}
        </section>
      </main>

      {showEmployeeModal && (
        <EmployeeModal
          formData={formData}
          editingEmployee={editingEmployee}
          onChange={handleInputChange}
          onSubmit={handleEmployeeSubmit}
          onClose={() => setShowEmployeeModal(false)}
          departments={departments}
        />
      )}

      {showDetailsModal && selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

function getPageTitle(page) {
  const titles = {
    dashboard: "Dashboard",
    employees: "Employees",
    attendance: "Attendance",
    leave: "Leave Management",
    departments: "Departments",
    payroll: "Payroll",
    reports: "Reports",
  };

  return titles[page] || "Dashboard";
}

function Dashboard({
  totalEmployees,
  activeEmployees,
  leaveEmployees,
  departmentsCount,
  employees,
  navigate,
  openDetails,
}) {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <div>
          <h2>Welcome back, Admin 👋</h2>
          <p>Here's what's happening with your organization today.</p>
        </div>

        <button className="primary-button" onClick={() => navigate("employees")}>
          <Users size={18} />
          Manage Employees
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users />}
          description="All employees"
        />

        <StatCard
          title="Present Today"
          value={activeEmployees}
          icon={<CheckCircle2 />}
          description="Active employees"
        />

        <StatCard
          title="On Leave"
          value={leaveEmployees}
          icon={<UserX />}
          description="Currently away"
        />

        <StatCard
          title="Departments"
          value={departmentsCount}
          icon={<Building2 />}
          description="Active departments"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Employees</h3>
              <p>Recently added employees</p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("employees")}
            >
              View All
            </button>
          </div>

          <div className="employee-list">
            {employees.slice(0, 5).map((employee) => (
              <div className="employee-row" key={employee.id}>
                <div className="employee-avatar">
                  {getInitials(employee.name)}
                </div>

                <div className="employee-row-info">
                  <strong>{employee.name}</strong>
                  <span>{employee.position}</span>
                </div>

                <div className="employee-row-department">
                  {employee.department}
                </div>

                <StatusBadge status={employee.status} />

                <button
                  className="icon-button"
                  onClick={() => openDetails(employee)}
                  title="View employee"
                >
                  <Eye size={17} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Quick Actions</h3>
              <p>Frequently used actions</p>
            </div>
          </div>

          <div className="quick-actions">
            <button onClick={() => navigate("employees")}>
              <Users size={20} />
              <span>
                <strong>Employees</strong>
                <small>Manage employee records</small>
              </span>
            </button>

            <button onClick={() => navigate("attendance")}>
              <CalendarCheck size={20} />
              <span>
                <strong>Attendance</strong>
                <small>Track employee attendance</small>
              </span>
            </button>

            <button onClick={() => navigate("leave")}>
              <CalendarDays size={20} />
              <span>
                <strong>Leave Requests</strong>
                <small>Manage leave applications</small>
              </span>
            </button>

            <button onClick={() => navigate("payroll")}>
              <Wallet size={20} />
              <span>
                <strong>Payroll</strong>
                <small>View salary information</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">{icon}</div>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-title">{title}</div>

      <div className="stat-description">{description}</div>
    </div>
  );
}

function EmployeesPage({
  employees,
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  departments,
  openAddEmployee,
  openEditEmployee,
  openDetails,
  deleteEmployee,
}) {
  return (
    <div className="employees-page">
      <div className="page-actions">
        <div>
          <h2>Employee Directory</h2>
          <p>View and manage all employees.</p>
        </div>

        <button className="primary-button" onClick={openAddEmployee}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="filters-panel">
        <div className="search-box">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
        >
          <option value="All">All Departments</option>

          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="table-employee">
                        <div className="employee-avatar">
                          {getInitials(employee.name)}
                        </div>

                        <div>
                          <strong>{employee.name}</strong>
                          <span>{employee.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{employee.department}</td>

                    <td>{employee.position}</td>

                    <td>{formatDate(employee.joiningDate)}</td>

                    <td>
                      <StatusBadge status={employee.status} />
                    </td>

                    <td>₹{Number(employee.salary || 0).toLocaleString()}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="small-icon-button"
                          title="View"
                          onClick={() => openDetails(employee)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="small-icon-button"
                          title="Edit"
                          onClick={() => openEditEmployee(employee)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="small-icon-button danger"
                          title="Delete"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AttendancePage({ employees }) {
  const [attendance, setAttendance] = useState({});

  const today = new Date().toISOString().split("T")[0];

  const toggleAttendance = (id) => {
    setAttendance((previous) => ({
      ...previous,
      [id]: previous[id] === "Present" ? "Absent" : "Present",
    }));
  };

  return (
    <div className="simple-page">
      <div className="page-actions">
        <div>
          <h2>Today's Attendance</h2>
          <p>{formatDate(today)}</p>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Attendance</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => {
                const currentStatus = attendance[employee.id] || "Not Marked";

                return (
                  <tr key={employee.id}>
                    <td>
                      <div className="table-employee">
                        <div className="employee-avatar">
                          {getInitials(employee.name)}
                        </div>

                        <div>
                          <strong>{employee.name}</strong>
                          <span>{employee.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{employee.department}</td>
                    <td>{employee.position}</td>

                    <td>
                      {currentStatus === "Present" ? (
                        <span className="status-badge active">
                          <CheckCircle2 size={14} />
                          Present
                        </span>
                      ) : currentStatus === "Absent" ? (
                        <span className="status-badge inactive">
                          <UserX size={14} />
                          Absent
                        </span>
                      ) : (
                        <span className="status-badge pending">
                          <Clock3 size={14} />
                          Not Marked
                        </span>
                      )}
                    </td>

                    <td>
                      <button
                        className="secondary-button"
                        onClick={() => toggleAttendance(employee.id)}
                      >
                        Mark Attendance
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeavePage({ employees }) {
  const [requests, setRequests] = useState([
    {
      id: 1,
      employee: "Emily Davis",
      type: "Annual Leave",
      from: "2026-09-25",
      to: "2026-09-27",
      days: 3,
      status: "Pending",
    },
    {
      id: 2,
      employee: "John Smith",
      type: "Sick Leave",
      from: "2026-09-20",
      to: "2026-09-20",
      days: 1,
      status: "Approved",
    },
  ]);

  const updateRequest = (id, status) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

  return (
    <div className="simple-page">
      <div className="page-actions">
        <div>
          <h2>Leave Requests</h2>
          <p>Review and manage employee leave requests.</p>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.employee}</td>
                  <td>{request.type}</td>
                  <td>{formatDate(request.from)}</td>
                  <td>{formatDate(request.to)}</td>
                  <td>{request.days}</td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>
                    {request.status === "Pending" ? (
                      <div className="action-buttons">
                        <button
                          className="approve-button"
                          onClick={() =>
                            updateRequest(request.id, "Approved")
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="reject-button"
                          onClick={() =>
                            updateRequest(request.id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="muted-text">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-table">
                    No leave requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DepartmentsPage({ employees }) {
  const departmentNames = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
  ];

  return (
    <div className="simple-page">
      <div className="page-actions">
        <div>
          <h2>Departments</h2>
          <p>Overview of your organization departments.</p>
        </div>
      </div>

      <div className="department-grid">
        {departmentNames.map((department) => {
          const count = employees.filter(
            (employee) => employee.department === department
          ).length;

          return (
            <div className="department-card" key={department}>
              <div className="department-icon">
                <Building2 size={23} />
              </div>

              <div>
                <h3>{department}</h3>
                <p>
                  {count} {count === 1 ? "employee" : "employees"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PayrollPage({ employees }) {
  const totalSalary = employees.reduce(
    (total, employee) => total + Number(employee.salary || 0),
    0
  );

  const averageSalary =
    employees.length > 0 ? totalSalary / employees.length : 0;

  return (
    <div className="simple-page">
      <div className="page-actions">
        <div>
          <h2>Payroll</h2>
          <p>Employee salary overview.</p>
        </div>
      </div>

      <div className="stats-grid payroll-stats">
        <StatCard
          title="Monthly Payroll"
          value={`₹${totalSalary.toLocaleString()}`}
          icon={<Wallet />}
          description="Total salary"
        />

        <StatCard
          title="Average Salary"
          value={`₹${Math.round(averageSalary).toLocaleString()}`}
          icon={<BarChart3 />}
          description="Average employee salary"
        />

        <StatCard
          title="Employees"
          value={employees.length}
          icon={<Users />}
          description="Payroll employees"
        />
      </div>

      <div className="table-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Monthly Salary</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.position}</td>
                  <td>
                    ₹{Number(employee.salary || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportsPage({ employees }) {
  const active = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const leave = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const inactive = employees.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  return (
    <div className="simple-page">
      <div className="page-actions">
        <div>
          <h2>Reports</h2>
          <p>Employee statistics and organization overview.</p>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-card">
          <div className="report-number">{employees.length}</div>
          <h3>Total Employees</h3>
          <p>Employees in the system</p>
        </div>

        <div className="report-card">
          <div className="report-number">{active}</div>
          <h3>Active Employees</h3>
          <p>Currently active</p>
        </div>

        <div className="report-card">
          <div className="report-number">{leave}</div>
          <h3>Employees on Leave</h3>
          <p>Currently on leave</p>
        </div>

        <div className="report-card">
          <div className="report-number">{inactive}</div>
          <h3>Inactive Employees</h3>
          <p>Inactive records</p>
        </div>
      </div>
    </div>
  );
}

function EmployeeModal({
  formData,
  editingEmployee,
  onChange,
  onSubmit,
  onClose,
  departments,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{editingEmployee ? "Edit Employee" : "Add Employee"}</h2>
            <p>
              {editingEmployee
                ? "Update employee information."
                : "Enter employee information below."}
            </p>
          </div>

          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Full Name <span>*</span>
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>
                Email <span>*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                name="phone"
                value={formData.phone}
                onChange={onChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>
                Department <span>*</span>
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={onChange}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Position <span>*</span>
              </label>

              <input
                name="position"
                value={formData.position}
                onChange={onChange}
                placeholder="e.g. Software Developer"
              />
            </div>

            <div className="form-group">
              <label>Joining Date</label>

              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={onChange}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Monthly Salary</label>

              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={onChange}
                placeholder="Enter salary"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              {editingEmployee ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeDetailsModal({ employee, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal details-modal">
        <div className="modal-header">
          <div>
            <h2>Employee Details</h2>
            <p>Employee profile information.</p>
          </div>

          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-header">
          <div className="large-avatar">{getInitials(employee.name)}</div>

          <div>
            <h2>{employee.name}</h2>
            <p>{employee.position}</p>
            <StatusBadge status={employee.status} />
          </div>
        </div>

        <div className="details-grid">
          <DetailItem label="Email" value={employee.email} />
          <DetailItem label="Phone" value={employee.phone || "Not provided"} />
          <DetailItem label="Department" value={employee.department} />
          <DetailItem label="Position" value={employee.position} />
          <DetailItem
            label="Joining Date"
            value={formatDate(employee.joiningDate)}
          />
          <DetailItem
            label="Monthly Salary"
            value={`₹${Number(employee.salary || 0).toLocaleString()}`}
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  let className = "pending";

  if (status === "Active" || status === "Approved" || status === "Present") {
    className = "active";
  }

  if (
    status === "Inactive" ||
    status === "Rejected" ||
    status === "Absent"
  ) {
    className = "inactive";
  }

  return <span className={`status-badge ${className}`}>{status}</span>;
}

function getInitials(name) {
  if (!name) return "NA";

  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(date) {
  if (!date) return "Not provided";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default App;