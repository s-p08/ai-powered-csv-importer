import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
    callback(null, true);
  } else {
    callback(new Error("Only CSV files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: fileFilter
});

export default upload;
