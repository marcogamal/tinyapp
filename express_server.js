const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
characters.length));
 }
 return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars)
})

// URL path with urls_index as the template
app.get("/urls", (req,res) => {
  const templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase
  };
  res.render("urls_index", templateVars)
})

app.post("/urls", (req,res) => {
    const randomShort = generateRandomString();
    urlDatabase[randomShort] = {
      shortURL: randomShort,
      longURL: req.body.longURL,
    };
    res.redirect(`/urls/${randomShort}`);
})

// URL/shortURL path with urls_show as the template
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/set", (req,res) => {
  const a = 1;
  res.send(`a = ${a}`)
})

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.post("/urls", (req,res) => {
   console.log(req.body)
   res.send("OK")
 })

 //Delete button routing on server
 app.post("/urls/:shortURL/delete", (req, res) => {
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

//login using express cookies
app.post("/login", (req,res) => {
  res.cookie ("username", req.body.username)
  res.redirect("/urls")
})

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//register
app.get("/register", (req,res) => {
  res.render("urls_register")
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
