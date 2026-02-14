import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../models/categoryModel.js";
import { v2 as cloudinary } from "cloudinary";

// Add Category
export const addCategory = async (req, res) => {
    try {
        const { name, overlayColor, ctaText, sortOrder } = req.body;
        const imageFile = req.file;

        if (!name || !imageFile) {
            return res.status(400).json({ success: false, message: "Name and Image are required" });
        }

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const category = await createCategory({
            name,
            image: imageUrl,
            overlayColor: overlayColor || '#000000',
            ctaText: ctaText || 'Shop Now',
            sortOrder: sortOrder || 0
        });

        res.json({ success: true, message: "Category Added", category });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// List Categories
export const listCategories = async (req, res) => {
    try {
        // Check if admin is requesting to see all (active & inactive)
        // For now, let's allow fetching all if a query param is present, or default to all for admin panel usage
        const showAll = req.query.showAll === 'true';
        const categories = await getAllCategories(showAll);
        res.json({ success: true, categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// List Public Categories (only active)
export const listPublicCategories = async (req, res) => {
    try {
        const categories = await getAllCategories(false); // false = only active
        res.json({ success: true, categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Update Category
export const editCategory = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL parameter
        const { name, overlayColor, ctaText, sortOrder, status } = req.body;
        const imageFile = req.file;

        let imageUrl = undefined;
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        const category = await updateCategory(id, {
            name,
            image: imageUrl,
            overlayColor,
            ctaText,
            sortOrder,
            status
        });

        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, message: "Category Updated", category });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Category
export const removeCategory = async (req, res) => {
    try {
        const { id } = req.body; // Expecting ID in body for consistency with other removal endpoints, or simplify to params
        if (!id) return res.json({ success: false, message: "Category ID required" });

        const category = await deleteCategory(id);
        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }
        res.json({ success: true, message: "Category Deleted" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}
