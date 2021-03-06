const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const {getUserByEmail, addNewUser, urlsForUser, generateRandomString} = require("./helpers");
const urlDatabase = require("./database");
const users = require("./users");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["Marco123!@#"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// GET or POST
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res
      .status(400)
      .send("Please <a href='/login'>login</a> to access the page");
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  } else {
    return res.render("urls_login", templateVars);
  }
});

// URL path with urls_index as the template
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res
      .status(400)
      .send("Please <a href='/login'>login</a> to access the page");
  }
  const urls = urlsForUser(user.id);
  const templateVars = {
    user: users[req.session.user_id],
    urls: urls,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomShort = generateRandomString();
  if (users[req.session["user_id"]]) {
    urlDatabase[randomShort] = {
      shortURL: randomShort,
      longURL: req.body.longURL,
      userId: req.session.user_id,
    };
    res.redirect(`/urls/${randomShort}`);
  }
});

// URL/shortURL path with urls_show as the template
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (userId) {
    const templateVars = {
      user: user,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    };
    res.render("urls_show", templateVars);
  } else {
    return res
      .status(400)
      .send(
        "<h1>Sorry!</h1> The URL does not exist or not assiciated with the account"
      );
  }
});

//edit
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  if ((urlDatabase[req.params.shortURL].userId = req.session.user_id)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    return res
      .status(400)
      .send("Please login to designated account to continue");
  }
});

//Delete button routing on server
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res
      .status(400)
      .send("Please login to designated account to continue");
  }
  delete urlDatabase[req.params.shortURL];
  return res.redirect("/urls");
});

// requests to the endpoint "/u/:shortURL" will redirect to its longURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const fullURL = urlDatabase[req.params.shortURL].longURL;
    return res.redirect(fullURL);
  }
});

//register
app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const user = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password);
  if (user) {
    return res.status(400).send("Name is not allowed or User already exist");
  }
  if (email === "" || password === "") {
    return res.status(400).send("Invalid credentials");
  }
  const userId = addNewUser(email, password, users);
  req.session.user_id = userId;
  res.redirect("/urls");
});

//login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const hashedPassword = bcrypt.hashSync(password);
  if (!email || !password) {
    return res
      .status(403)
      .send("Invalid credentials - please fill the correct email or password");
  }
  const user = getUserByEmail(email, users);
  console.log("User is", user);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res
      .status(403)
      .send("Invalid credentials - please fix your username or password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

//listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
