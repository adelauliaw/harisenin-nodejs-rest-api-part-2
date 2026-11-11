
require("dotenv").config(); // secret key simpan disini

const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(express.json());

// ==================================
// 1. DATABASE CONNECTION
// ==================================

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false
  }
);

// ==================================
// 2. STUDENT MODEL
// ==================================

const Student = sequelize.define("Student", {
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  major: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// ==================================
// 3. CREATE STUDENT
// ==================================

app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      message: "Student created successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// ==================================
// 4. GET ALL STUDENTS
// ==================================

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.findAll();

    res.json({
      message: "Students retrieved successfully",
      data: students
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ==================================
// 5. GET STUDENT BY ID
// ==================================

app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({ data: student });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ==================================
// 6. UPDATE STUDENT
// ==================================

app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    await student.update(req.body);

    res.json({
      message: "Student updated successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// ==================================
// 7. DELETE STUDENT
// ==================================

app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    await student.destroy();

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// ==================================
// 8. START SERVER
// ==================================

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync();
    console.log("Database tables synchronized!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Unable to start server:", error);
  }
}

startServer();