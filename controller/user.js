const User = require("../models/usersSchema");
const {
  userValidation,
  createUserValidation,
  emailValidation,
} = require("../utils/userValidations");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// create user
const createUsers = async (req, res) => {
  try {
    const { error } = createUserValidation.validate(req.body);
    if (error) {
      const errorMessages = error.details.map((err) => err.message);
      return res.status(400).send({
        success: false,
        message: errorMessages,
      });
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already exists");

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || "user",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    await user.save();

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res
      .cookie("authorization_token", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV !== "development",
      })
      .send({
        token: token,
      });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("Something went wrong");
    }
  }
};

//get all users or filter by role
const getUsers = async (req, res) => {
  try {
    const role = req.query.role;
    let users;
    if (role && role === "admin") {
      users = await User.find({ role: "admin" });
    } else {
      users = await User.find();
    }
    res.send(users);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;

    const { nameError } = userValidation.validate(req.body);
    if (nameError) {
      const errorMessages = nameError.details.map((err) => err.message);
      return res.status(400).send({
        success: false,
        message: errorMessages,
      });
    }
    const { emailError } = emailValidation.validate(req.body);
    if (emailError) {
      const errorMessages = emailError.details.map((err) => err.message);
      return res.status(400).send({
        success: false,
        message: errorMessages,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).send("You can only update your own data");
    }

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }

    await user.save();

    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Something went wrong");
  }
};

// Delete User for admin role
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied. Admins only");
    }
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

// login user
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send("Invalid email or password");
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res
      .cookie("authorization_token", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV !== "development",
      })
      .send({
        token: token,
      });
  } catch (error) {
    res.status(500).send("something went wrong");
  }
};

// resetPassword
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    // generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken; // store the token
    user.resetPasswordExpires = new Date() + 3600000; // Token expires for 1 hour
    await user.save();
    console.log(
      `Password reset link: http://localhost:5000/reset-password/${resetToken}`
    );
    res.send("Password reset link has been sent to your email.");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

// Update password after clicking the reset link
const updatePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
    });
    if (!user) return res.status(404).send("Invalid or expire token");

    // update the password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Clear token
    user.resetPasswordExpires = undefined; // Clear expiration
    await user.save();
    res.send("Password has been successfully reset.");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

const logOutUser = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("token", {
        sameSite: "none",
        secure: process.env.NODE_ENV !== "development",
      })
      .json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUsers,
  getUsers,
  updateUser,
  deleteUser,
  userLogin,
  resetPassword,
  updatePassword,
  logOutUser,
};
