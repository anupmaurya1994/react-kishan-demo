import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimetypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."));

  if (allowedMimetypes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`Only PDF, DOC, DOCX files allowed. Received: ${file.mimetype} with extension ${extension}`));
  }
};

export const upload = multer({
  storage,
  fileFilter
});