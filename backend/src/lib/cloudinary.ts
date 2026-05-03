import { v2 as cloudinary } from "cloudinary";

// Cloudinary is configured via the CLOUDINARY_URL env variable
// Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
cloudinary.config(true); // reads CLOUDINARY_URL automatically

export default cloudinary;
