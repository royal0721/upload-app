const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// 指定靜態檔路徑（Angular build 出來的資料夾）
app.use(express.static(path.join(__dirname, "dist/upload-client")));

// 檔案上傳設定
const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];
const fileFilter = (req, file, cb) => {
  if (!allowedFileTypes.includes(file.mimetype)) {
    return cb(new Error("不允許的文件類型"), false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 建立隨機 16 bytes 編碼為 hex
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname); // 保留原副檔名
    cb(null, `${randomName}${ext}`);
  },
});

const upload = multer({ storage, fileFilter });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ message: "上傳成功", filename: req.file.filename });
});

// 把所有未命中的路由交給 Angular index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/upload-client"));
});

app.listen(3000, () => {
  console.log("伺服器運行在 http://localhost:3000");
});
