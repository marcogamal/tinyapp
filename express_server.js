const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW",
  },
};

function generateRandomString() {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//users
const users = {
  Asta: {
    id: "Asta",
    email: "asta@asta.com",
    password: "asta1",
  },
  kio: {
    id: "kio",
    email: "kio@kio.com",
    password: "kio1",
  },
};

const findUserByEmail = (email) => {
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const addNewUser = function (email, password, users) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };
  return userId;
};

const urlsForUser = function (id) {
  const filterId = {};
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (urlDatabase[key].userId === id) {
      filterId[key] = url;
    }
  }
  return filterId;
};

// GET or POST
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  } else {
    return res.render("urls_login", templateVars);
  }
});

// URL path with urls_index as the template
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (!user) {
    return res
      .status(400)
      .send("Please <a href='/login'>login</a> to access the page");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomShort = generateRandomString();
  urlDatabase[randomShort] = {
    shortURL: randomShort,
    longURL: req.body.longURL,
  };
  res.redirect(`/urls/${randomShort}`);
});

// URL/shortURL path with urls_show as the template
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
});

//Delete button routing on server
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
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
  const user = findUserByEmail(email);
  if (user) {
    return res.status(400).send("Name is not allowed or User already exist");
  }
  if (email === "" || password === "") {
    return res.status(400).send("Invalid credentials");
  }
  const userId = addNewUser(email, password, users);
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

//login using express cookies
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  if (!email || !password) {
    return res
      .status(403)
      .send("Invalid credentials - please fill the correct email or password");
  }
  const user = findUserByEmail(email);
  console.log("User is", user);
  if (!user || !bcrypt.compareSync(password, hashedPassword)) {
    return res
      .status(403)
      .send("Invalid credentials - please fix your username or password");
  }
  res.cookie("user", { id: user.id, email: user.email });
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.userId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
