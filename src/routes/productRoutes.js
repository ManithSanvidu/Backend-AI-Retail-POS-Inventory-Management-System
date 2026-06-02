const express = require("express");

const {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deactivateProduct,
    deleteProduct
} = require("../controllers/productController");

const router = express.Router();

router.post("/", addProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.patch("/:id/deactivate", deactivateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;