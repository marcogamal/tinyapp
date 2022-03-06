const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser")

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

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
  res.render("urls_new")
})

// URL path with urls_index as the template
app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars)
})

app.post("/urls", (req,res) => {
    const randomShort = generateRandomString();
    urlDatabase[randomShort] = {
      longURL: req.body.longURL,
    };
    return res.redirect(`/urls/${randomShort}`);
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello2", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
