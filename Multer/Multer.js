const multer = require("multer");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: "Images",
  filename: (req, file, cb) => {
    jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      async (err, decoded) => {
        if (err) {
          throw new Error("You need to be logged in");
        } else {
          filename = Date.now().toString() + file.originalname;

          cb(null, filename);
        }
      }
    );
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

module.exports = upload;
