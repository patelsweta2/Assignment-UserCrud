const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.authorization_token;
    console.log(token);
    if (!token) {
      return res.status(401).json({ error: "Please provide token" });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user) {
      return res.status(401).json({ error: "user is not exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = authMiddleware;
