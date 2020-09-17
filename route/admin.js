const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const fileUpload = require("../middleware/file-upload");
const { body } = require("express-validator");
const checkAuth = require("../middleware/check-auth");

router.get("/user/:userId", adminController.getProductsByUserId);
router.use(checkAuth);
router.post(
  "/add-product",
  fileUpload.single("image"),
  [
    body("productName")
      .isLength({ min: 2 })
      .withMessage("Enter ur name of atelast 2 character long"),
    body("price").isNumeric().withMessage("please,Enter the Price"),
  ],
  adminController.postNewProduct
);
router.patch(
  "/:productId",
  fileUpload.single("image"),
  adminController.postEditProduct
);
router.delete("/:productId", adminController.deleteProductHandler);

router.post("/:productId/review", adminController.postReviewProductComment);
router.get("/cart", adminController.gerCart);

router.post("/add-to-cart", adminController.postCart);
router.post("/order-details", adminController.postOrders);
router.get("/order-details/:orderId", adminController.getOrderDetails);

module.exports = router;
