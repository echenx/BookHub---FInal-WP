require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const reviewRoutes = require("./routes/reviews");
const profileRoutes = require("./routes/profile");
const searchRouter = require("./routes/search");
const db = require("./db");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: null,
      secure: false,
    },
  })
);

app.use((req, res, next) => {
  console.log("Current session user:", req.session.user);
  next();
});

app.set("view engine", "ejs");

app.use("/auth", authRoutes);
app.use("/reviews", reviewRoutes);
app.use("/profile", profileRoutes);
app.use("/search", searchRouter);

app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.render("home");
  }
});

app.get("/auth/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.render("login");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    const countQuery =
      "SELECT COUNT(*) as totalReviews FROM reviews WHERE user_id = ?";

    const topBookQuery = `
            SELECT title, rating 
            FROM reviews 
            WHERE user_id = ? 
            ORDER BY rating DESC, created_at DESC 
            LIMIT 1
        `;

    const lastActiveQuery = `
            SELECT created_at 
            FROM reviews 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `;

    db.query(countQuery, [req.session.user.id], (err, countResults) => {
      if (err) {
        console.error("Error fetching review count:", err);
        return res.status(500).send("Error fetching dashboard data");
      }

      db.query(topBookQuery, [req.session.user.id], (err, topBookResults) => {
        if (err) {
          console.error("Error fetching top book:", err);
          return res.status(500).send("Error fetching dashboard data");
        }

        db.query(
          lastActiveQuery,
          [req.session.user.id],
          (err, lastActiveResults) => {
            if (err) {
              console.error("Error fetching last active time:", err);
              return res.status(500).send("Error fetching dashboard data");
            }

            const totalReviews = countResults[0].totalReviews;
            const topBook = topBookResults[0]?.title || "No reviews yet";

            let lastActive = "Never";
            if (lastActiveResults[0]?.created_at) {
              const lastActiveDate = new Date(lastActiveResults[0].created_at);
              const now = new Date();
              const diffInHours = Math.floor(
                (now - lastActiveDate) / (1000 * 60 * 60)
              );

              if (diffInHours < 1) {
                lastActive = "Just now";
              } else if (diffInHours < 24) {
                lastActive = `${diffInHours} hour${
                  diffInHours > 1 ? "s" : ""
                } ago`;
              } else {
                const diffInDays = Math.floor(diffInHours / 24);
                lastActive = `${diffInDays} day${
                  diffInDays > 1 ? "s" : ""
                } ago`;
              }
            }

            res.render("dashboard", {
              user: req.session.user,
              stats: {
                totalReviews,
                topBook,
                lastActive,
              },
            });
          }
        );
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get("/crud", (req, res) => {
  if (req.session.user) {
    const query = "SELECT * FROM reviews WHERE user_id = ?";

    db.query(query, [req.session.user.id], (err, reviews) => {
      if (err) {
        console.error("Error fetching reviews:", err);
        return res.status(500).send("Error fetching reviews");
      }
      res.render("crud", {
        user: req.session.user,
        reviews: reviews,
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/support", (req, res) => {
  res.render("support", { user: req.session.user });
});

app.post("/support/contact", (req, res) => {
  res.redirect("/support");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
