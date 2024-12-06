const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/add", (req, res) => {
  const { title, author, review, rating } = req.body;
  const userId = req.session.user.id;

  const query =
    "INSERT INTO reviews (title, author, content, rating, user_id) VALUES (?, ?, ?, ?, ?)";

  db.query(query, [title, author, review, rating, userId], (err, result) => {
    if (err) {
      console.error("Error adding review:", err);
      return res.status(500).send("Error adding review");
    }
    res.redirect("/crud");
  });
});

router.post("/delete/:id", (req, res) => {
  const reviewId = req.params.id;
  const userId = req.session.user.id;

  const query = "DELETE FROM reviews WHERE id = ? AND user_id = ?";

  db.query(query, [reviewId, userId], (err, result) => {
    if (err) {
      console.error("Error deleting review:", err);
      return res.status(500).send("Error deleting review");
    }
    res.redirect("/crud");
  });
});

router.get("/edit/:id", (req, res) => {
  const reviewId = req.params.id;
  const userId = req.session.user.id;

  const query = "SELECT * FROM reviews WHERE id = ? AND user_id = ?";

  db.query(query, [reviewId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching review:", err);
      return res.status(500).send("Error fetching review");
    }

    if (results.length === 0) {
      return res.status(404).send("Review not found");
    }

    res.render("edit-review", {
      user: req.session.user,
      review: results[0],
    });
  });
});

router.post("/edit/:id", (req, res) => {
  const reviewId = req.params.id;
  const userId = req.session.user.id;
  const { title, author, review, rating } = req.body;

  const query =
    "UPDATE reviews SET title = ?, author = ?, content = ?, rating = ? WHERE id = ? AND user_id = ?";

  db.query(
    query,
    [title, author, review, rating, reviewId, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating review:", err);
        return res.status(500).send("Error updating review");
      }
      res.redirect("/crud");
    }
  );
});

module.exports = router;
