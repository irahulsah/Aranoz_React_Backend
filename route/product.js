const express = require("express");
const router = express.Router();
const indexController = require("../controllers/Product");

router.get("/products", indexController.getProducts);
router.get("/product/:productId", indexController.getSingleProductByProductId);
router.get("/:productId/product", indexController.getSingleProductReview);

module.exports = router;
