const Product = require("../models/Product.js");
const cloudinary = require("../config/cloudinary");

// Add Product
const addProduct = async (req, res) => {
    try {
        const {
            name,
            barcode,
            category,
            supplier,
            brand,
            description,
            price,
            costPrice,
            reorderLevel,
            unit,
            isActive
        } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: "Product name and price are required"
            });
        }

        if (barcode) {
            const existingProduct = await Product.findOne({ barcode });

            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: "This barcode already exists"
                });
            }
        }

        let imageUrl = "";

        if (req.file) {
            const base64Image = req.file.buffer.toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

            const uploadedImage = await cloudinary.uploader.upload(dataURI, {
                folder: "retail_pos_products"
            });

            imageUrl = uploadedImage.secure_url;
        }

        const product = await Product.create({
            name,
            barcode,
            category,
            supplier,
            brand,
            description,
            price,
            costPrice,
            image: imageUrl,
            reorderLevel,
            unit,
            isActive
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding product",
            error: error.message
        });
    }
};


// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category")
            .populate("supplier")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

// Get Single Product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category")
            .populate("supplier");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.name = req.body.name;
        product.barcode = req.body.barcode;
        product.brand = req.body.brand;
        product.description = req.body.description;
        product.price = req.body.price;
        product.costPrice = req.body.costPrice;
        product.image = req.body.image;
        product.reorderLevel = req.body.reorderLevel;
        product.unit = req.body.unit;
        product.isActive = req.body.isActive;

        const updatedProduct = await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
};

// Deactivate Product
const deactivateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.isActive = false;

        const updatedProduct = await product.save();

        res.status(200).json({
            success: true,
            message: "Product deactivated successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deactivating product",
            error: error.message
        });
    }
};

// Delete Product Permanently
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
};

module.exports = {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deactivateProduct,
    deleteProduct
};  