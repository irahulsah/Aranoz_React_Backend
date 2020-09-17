const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const indexController = require("../controllers/index");

router.get("/", indexController.getIndex);
// router.get("/contact", indexController.getContactUsDetail);
router.post("/contact", indexController.postContactUsDetail);

router.post("/subscribe", indexController.postSubscribeNewsLetter);
router.post("/advance-book-now", indexController.postAdvanceBookNowProducts);
router.post(
  "/signup",
  [
    body("name")
      .isLength({ min: 2 })
      .withMessage("Please,Enter a name of atleast 2 character long"),
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Enter valid E-mail address"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Please,Enter password of atleast 5 character long.."),
  ],
  indexController.postSignup
);

router.post(
  "/login",
  [
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Enter valid E-mail address"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Please,Enter password of atleast 5 character long.."),
  ],
  indexController.postLogin
);
module.exports = router;
