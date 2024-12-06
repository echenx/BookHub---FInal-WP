const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  const statsQuery = `
        SELECT 
            COUNT(*) as totalReviews,
            AVG(rating) as averageRating,
            COUNT(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) THEN 1 END) as booksThisYear
        FROM reviews 
        WHERE user_id = ?
    `;

  db.query(statsQuery, [req.session.user.id], (err, statsResults) => {
    if (err) {
      console.error("Error fetching user stats:", err);
      return res.status(500).send("Error loading profile");
    }

    const stats = {
      totalReviews: statsResults[0].totalReviews,
      averageRating: statsResults[0].averageRating
        ? statsResults[0].averageRating.toFixed(1)
        : "0.0",
      booksThisYear: statsResults[0].booksThisYear,
    };

    res.render("profile", {
      user: req.session.user,
      stats: stats,
    });
  });
});

router.post("/update", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  const { username, email, bio } = req.body;
  const query =
    "UPDATE users SET username = ?, email = ?, bio = ? WHERE id = ?";

  db.query(
    query,
    [username, email, bio, req.session.user.id],
    (err, result) => {
      if (err) {
        console.error("Error updating profile:", err);
        return res.status(500).send("Error updating profile");
      }

      req.session.user.username = username;
      req.session.user.email = email;
      req.session.user.bio = bio;

      res.redirect("/profile");
    }
  );
});

router.post("/change-password", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send("New passwords do not match");
  }

  db.query(
    "SELECT password FROM users WHERE id = ?",
    [req.session.user.id],
    async (err, results) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).send("Error changing password");
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).send("Current password is incorrect");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, req.session.user.id],
        (err, result) => {
          if (err) {
            console.error("Error updating password:", err);
            return res.status(500).send("Error changing password");
          }

          res.redirect("/profile");
        }
      );
    }
  );
});

module.exports = router;
