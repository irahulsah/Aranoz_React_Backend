const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Product = require("../models/Product");
const User = require("../models/User");
const fileHelper = require("../utils/deleteImage");
const Review = require("../models/Review");
const Order = require("../models/Order");

exports.postNewProduct = async (req, res, next) => {
  //fetch data from frontend input values
  const { productName, price, creator } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorMessage = errors.array()[0].msg;
    return next(new HttpError(errorMessage, 422));
  }

  const createdProduct = new Product({
    productName,
    price,
    image: "uploads/images/" + req.file.filename,
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(
      new HttpError(
        "Soemthing went wrong,Please check internet connection.",
        401
      )
    );
  }
  if (!user) {
    return next(
      new HttpError("Could not find user for the provided userId", 401)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdProduct.save({ session: sess });
    user.products.push(createdProduct);
    await user.save({ session: sess });
    await sess.commitTransaction();
    res.json({ message: "add product", product: createdProduct });
  } catch (error) {
    return next(new HttpError("creating product failed,try it again", 500));
  }
};

exports.getProductsByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let userWithProducts;
  try {
    userWithProducts = await User.findById(userId)
      .populate("products")
      .sort({ _id: -1 });
  } catch (error) {
    return next(
      new HttpError("something,went wrong,check your internet connection", 401)
    );
  }
  if (!userWithProducts) {
    return next(
      new HttpError("something went wrong,fetching products failed", 401)
    );
  }

  res.json({
    message: "fetched Succcesfully",
    products: userWithProducts.products.map((product) =>
      product.toObject({ getters: true })
    ),
  });
};

exports.postEditProduct = async (req, res, next) => {
  const { productName, price } = req.body;

  const image = req.file;
  const { productId } = req.params;

  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    return next(
      new HttpError("something,went wrong,check your internet connection", 401)
    );
  }
  if (!product) {
    return next(
      new HttpError("something went wrong,fetching product failed", 401)
    );
  }
  product.productName = productName;
  product.price = price;
  if (image) {
    fileHelper.deleteImage(product.image);
    product.image = "uploads/images/" + req.file.filename;
  }
  try {
    product.save();
  } catch (error) {
    return next(
      new HttpError("something went wrong,Editing product detail failed.", 401)
    );
  }
  res.json({
    message: "Updated",
    product: product.toObject({ getters: true }),
  });
};

exports.deleteProductHandler = async (req, res, next) => {
  const { productId } = req.params;
  const { userId } = req.userData;
  let product;
  try {
    product = await Product.findById(productId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("something,went wrong,check your internet connection", 401)
    );
  }
  if (!product) {
    return next(
      new HttpError("something went wrong,Deleting product  failed.", 401)
    );
  }
  let user;
  try {
    user = await user.findById(userId);
  } catch (error) {
    return next(
      new HttpError("Could not find User with the given user Id", 404)
    );
  }
  if (!user) {
    return next(
      new HttpError("Could not find User with the given user Id", 404)
    );
  }

  const imagePath = product.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await product.deleteOne({ session: sess });
    product.creator.products.pull(product);
    await product.creator.save({ session: sess });
    await user.removeFromCart(productId, { session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError(
        "something went wrong,deleting product failed,try it again..",
        404
      )
    );
  }
  fileHelper.deleteImage(imagePath, (err) => console.log(error));
  res.status(200).json({ message: "Posts deleted Successfully" });
};

exports.postReviewProductComment = async (req, res, next) => {
  const { name, email, phoneNumber, message } = req.body;
  const { productId } = req.params;
  const review = new Review({ name, email, phoneNumber, message });
  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    return next(
      new HttpError(
        "Could not find the product,please try again with correct productId",
        401
      )
    );
  }
  if (!product) {
    return next(
      new HttpError(
        "Could not find the product,please try again with correct productId",
        401
      )
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await review.save({ session: sess });
    product.reviews.push(review);
    await product.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError(
        "something went wrong,could not post review product comment.",
        401
      )
    );
  }
  res.json({ message: "Review Updated", review });
};

exports.postCart = async (req, res, next) => {
  const { productId } = req.body;
  const { userId } = req.userData;
  let product;
  let user;
  let result;

  try {
    product = await Product.findById(productId);
  } catch (error) {
    return next(
      new HttpError(
        "something went wrong,please try again adding the product to cart",
        401
      )
    );
  }
  if (!product) {
    return next(
      new HttpError(
        "Semething went wrong,try login or signup and then continue to add to cart.",
        404
      )
    );
  }

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(
      new HttpError(
        "Semething went wrong,try login or signup and then continue to add to cart.",
        404
      )
    );
  }
  if (!user) {
    return next(
      new HttpError(
        "Semething went wrong,please login or signup,and then continue adding to cart.",
        404
      )
    );
  }
  try {
    result = await user.addToCart(product);
  } catch (error) {
    return next(
      new HttpError(
        "Semething went wrong,please login or signup,and then continue adding to cart.",
        404
      )
    );
  }
  if (!result) {
    return next(
      new HttpError(
        "Semething went wrong,please login or signup,and then continue adding to cart.",
        404
      )
    );
  }

  res.json({ message: "Success", result });
};

exports.gerCart = async (req, res, next) => {
  let cartItems;
  try {
    cartItems = await User.findById(req.userData.userId).populate(
      "cart.items.productId"
    );
  } catch (error) {
    return next(
      new HttpError(
        "Semething went wrong,fetching cart details failed!!,please login or signup,and then continue.",
        404
      )
    );
  }
  // console.log(cartItems);
  res.json({ message: "fetched Cart successful", cartItems });
};

exports.postOrders = async (req, res, next) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    country,
    address1,

    city,
    zipCode,
    items,
    totalAmount,
  } = req.body;

  const { userId } = req.userData;
  const order = new Order({
    firstName,
    lastName,
    phoneNumber,
    email,
    country,
    address1,

    city,
    zipCode,
    items,
    totalAmount,
    user: req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(
      new HttpError(
        "Semething went wrong,please login or signup to fix this.",
        404
      )
    );
  }
  if (!user) {
    return next(
      new HttpError(
        "Semething went wrong,please login or signup to fix this.",
        404
      )
    );
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await order.save({ session: sess });
    user.orders.push(order);
    await user.save({ session: sess });
    await user.clearCart({ session: sess });

    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Semething went wrong,posting order failed. ", 404)
    );
  }
  res.json({ message: "Success", Orders: order });
};

exports.getOrderDetails = async (req, res, next) => {
  const { orderId } = req.params;

  let order;

  try {
    order = await Order.findById(orderId);
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong,could not find the order details.",
        404
      )
    );
  }

  if (!order) {
    return next(
      new HttpError(
        "Something went wrong,could not find the order details.",
        404
      )
    );
  }

  res.json({
    message: "OrderFetched",
    OrderDetails: order,
  });
};
