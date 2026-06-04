const express = require("express");
const router = express.Router();
<<<<<<< HEAD

// --- Employees API ---
router.get("/", (req, res) => {
  res.json({ employees: [] }); 
});

router.post("/", (req, res) => {
  res.json({ message: "Employee registered successfully" });
});

// --- Attendance API ---
router.get("/attendance", (req, res) => {
  res.json({ attendance: [] });
});

router.post("/attendance", (req, res) => {
  res.json({ message: "Attendance logged successfully" });
});

// --- Performance API ---
router.get("/performance", (req, res) => {
  res.json({ performance: [] });
});

router.post("/performance", (req, res) => {
  res.json({ message: "Performance metrics updated" });
});

// --- Schedules API ---
router.get("/schedules", (req, res) => {
  res.json({ schedules: [] });
});

router.post("/schedules", (req, res) => {
  res.json({ message: "Schedule updated successfully" });
});

// Single employee delete & update (id eka haraha)
router.put("/:id", (req, res) => res.json({ message: "Updated" }));
router.delete("/:id", (req, res) => res.json({ message: "Deleted" }));

module.exports = router;
=======
const {
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getSchedules,
    saveSchedule,
    getAttendance,
    logAttendance,
    getPerformanceMetrics,
    logPerformanceMetric
} = require("../controllers/employeeController");

// --- EMPLOYEE CRUD ENDPOINTS ---
router.get("/", getAllEmployees);
router.post("/", addEmployee);
router.get("/schedules", getSchedules);
router.post("/schedules", saveSchedule);
router.get("/attendance", getAttendance);
router.post("/attendance", logAttendance);
router.get("/performance", getPerformanceMetrics);
router.post("/performance", logPerformanceMetric);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
>>>>>>> 833517d8a63a21767cd925cee9fe630271f16c63
