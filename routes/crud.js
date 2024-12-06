const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/list", (req, res) => {
  db.query(
    "SELECT * FROM data WHERE user_id = ?",
    [req.session.user.id],
    (err, results) => {
      if (err) throw err;
      res.render("crud", { data: results });
    }
  );
});

router.post("/add", (req, res) => {
  const { title, description } = req.body;
  db.query(
    "INSERT INTO data SET ?",
    { user_id: req.session.user.id, title, description },
    (err) => {
      if (err) throw err;
      res.redirect("/crud/list");
    }
  );
});

router.post("/update", (req, res) => {
  const { id, title, description } = req.body;
  db.query(
    "UPDATE data SET ? WHERE id = ?",
    [{ title, description }, id],
    (err) => {
      if (err) throw err;
      res.redirect("/crud/list");
    }
  );
});

router.post("/delete", (req, res) => {
  db.query("DELETE FROM data WHERE id = ?", [req.body.id], (err) => {
    if (err) throw err;
    res.redirect("/crud/list");
  });
});

module.exports = router;
