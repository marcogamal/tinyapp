const urlDatabase = require("./database");
const users = require("./users");
const bcrypt = require("bcryptjs");

//functions
function generateRandomString() {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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
      filterId[key] = urlDatabase[key];
    }
  }
  return filterId;
};
const getUserByEmail = (email, users) => {
  for (let userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

module.exports = {getUserByEmail, urlsForUser, addNewUser, generateRandomString};
