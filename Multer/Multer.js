const multer = require("multer");
const jwt = require("jsonwebtoken");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const s3Config = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.S3_BUCKET_NAME,
});

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
  },
});
const multerS3Config = multerS3({
  s3: s3Config,
  bucket: process.env.S3_BUCKET_NAME,
  acl: "public-read",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: multerS3Config,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

module.exports = upload;
