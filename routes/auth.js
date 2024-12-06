const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).send("Error during login");
    }

    if (results.length > 0) {
      const user = results[0];
      console.log("User found:", user);

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("Password comparison error:", err);
          return res.status(500).send("Error during login");
        }

        if (isMatch) {
          req.session.user = {
            id: user.id,
            name: user.username,
            email: user.email,
            bio: user.bio,
          };
          console.log("Session set:", req.session.user);
          res.redirect("/dashboard");
        } else {
          res.render("login", { error: "Invalid email or password" });
        }
      });
    } else {
      res.render("login", { error: "Invalid email or password" });
    }
  });
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        return res.send("Email is already registered.");
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword],
          (err) => {
            if (err) throw err;
            res.redirect("/");
          }
        );
      }
    }
  );
});

module.exports = router;
