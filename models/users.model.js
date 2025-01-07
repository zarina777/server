const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 5, maxlength: 50 },
  password: { type: String, required: true, minlength: 6 },
  type: {
    type: String,
    enum: ["admin", "user"],
    required: true,
  },
  likedProducts: { type: Array, required: false, default: [] },
});

const Users = mongoose.model("Users", UsersSchema);
module.exports = Users;
