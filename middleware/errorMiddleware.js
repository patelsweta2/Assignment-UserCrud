const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err.message.includes("User not found")) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

module.exports = errorHandler;
