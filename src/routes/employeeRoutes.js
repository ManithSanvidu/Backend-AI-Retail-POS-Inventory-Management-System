const express = require("express");
const router = express.Router();

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