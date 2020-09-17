const Product = require("../models/Product");
const HttpError = require("../models/http-error");
const User = require("../models/User");

exports.getProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find().sort({ _id: -1 });
  } catch (error) {
    return new HttpError(
      "Something went wrong,could not find the products",
      404
    );
  }
  res.json({ products: products });
};

exports.getSingleProductByProductId = async (req, res, next) => {
  const { productId } = req.params;

  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    return new HttpError(
      "Something went wrong,cound not fetch the product",
      404
    );
  }
  res.json({ message: "Single Product Fetched", product });
};

exports.getSingleProductReview = async (req, res, next) => {
  const { productId } = req.params;
  let reviews;
  try {
    reviews = await Product.findById(productId).populate("reviews");
  } catch (error) {
    return next(
      new HttpError("Something went wrong,fetching product review failed", 404)
    );
  }
  res.json({ message: "Review Fetched", reviews });
};
