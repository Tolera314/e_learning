"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
// Cloudinary is configured via the CLOUDINARY_URL env variable
// Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
cloudinary_1.v2.config(true); // reads CLOUDINARY_URL automatically
exports.default = cloudinary_1.v2;
