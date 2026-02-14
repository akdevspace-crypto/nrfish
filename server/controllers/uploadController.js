
import { v2 as cloudinary } from "cloudinary"

export async function uploadImage(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });

        res.json({ success: true, url: result.secure_url, message: "Image uploaded successfully" });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
