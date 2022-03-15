const bcrypt = require("bcryptjs");

const users = {
  Asta: {
    id: "Asta",
    email: "asta@asta.com",
    password: bcrypt.hashSync("asta1"),
  },
  kio: {
    id: "kio",
    email: "kio@kio.com",
    password: bcrypt.hashSync("kio1"),
  },
};

module.exports = users