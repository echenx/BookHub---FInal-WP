const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

const isLoggedIn = (req, res, next) => {
  if (req.session.user) next();
  else res.redirect("/");
};

router.get("/dashboard", isLoggedIn, (req, res) =>
  res.render("dashboard", { user: req.session.user })
);

module.exports = router;
