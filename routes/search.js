const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  res.render("search", {
    user: req.session.user,
    query: "",
  });
});

router.get("/results", (req, res) => {
  const { query } = req.query;
  console.log("Search query:", query);

  if (query) {
    const sqlQuery = "SELECT * FROM reviews WHERE title LIKE ?";
    const searchParam = `%${query}%`;

    console.log("SQL Query:", sqlQuery);
    console.log("Search param:", searchParam);

    db.query(sqlQuery, [searchParam], (err, results) => {
      if (err) {
        console.error("Search error:", err);
        return res.status(500).render("searchResults", {
          user: req.session.user,
          query,
          results: [],
          error: "An error occurred while searching",
        });
      }

      console.log("Search results:", results);

      res.render("searchResults", {
        user: req.session.user,
        query,
        results: results,
      });
    });
  } else {
    res.redirect("/search");
  }
});

module.exports = router;
