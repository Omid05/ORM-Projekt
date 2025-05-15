const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// PostgreSQL connection (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Show login form
app.get("/", (req, res) => {
  res.render("login");
});

// Handle form submission
app.post("/register", async (req, res) => {
  const { användarnamn, lösenord } = req.body;

  if (!användarnamn || !lösenord) {
    return res.send("Fyll i alla fält.");
  }

  try {
    await pool.query(
      "INSERT INTO users (användarnamn, lösenord) VALUES ($1, $2)",
      [användarnamn, lösenord]
    );
    res.send("Användare sparad!");
  } catch (err) {
    console.error(err);
    res.send("Fel vid databasåtkomst.");
  }
});

app.listen(3000, () => {
  console.log("Servern körs på http://localhost:3000");
});
