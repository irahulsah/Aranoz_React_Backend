const Contact = require("../models/Contact");
const Subscribe = require("../models/Subscribe");
const AdvanceBookNow = require("../models/AdvanceBookNowProduct");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

exports.getIndex = (req, res, next) => {
  res.json({ message: "This is index" });
};

exports.postContactUsDetail = async (req, res, next) => {
  const { name, subject, email, message } = req.body;
  const contact = new Contact({ name, subject, email, message });
  try {
    await contact.save();
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong,could not post the contact details.",
        404
      )
    );
  }
  res.json({ message: "Detail Posted successful..." });
};

exports.postSubscribeNewsLetter = async (req, res, next) => {
  const { email_subscribe, email_footer } = req.body;

  let email;
  if (email_subscribe) {
    email = email_subscribe;
    // console.log(email);
  } else {
    email = email_footer;
    // console.log(email);
  }
  const subscribe = new Subscribe({ email });
  try {
    await subscribe.save();
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong,could not subscribe newsletter,please try it again",
        404
      )
    );
  }
  res.json({ message: "Subscribed Successfully" });
};

exports.postAdvanceBookNowProducts = async (req, res, next) => {
  const { email } = req.body;
  const advanceBookNow = new AdvanceBookNow({ email });
  try {
    await advanceBookNow.save();
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong,could not book the product ,please try it again",
        404
      )
    );
  }
  res.json({ message: "Advanced Booked Successfully Done.." });
};

exports.postSignup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const errors = validationResult(req);
  let errorMessage;
  if (!errors.isEmpty()) {
    errorMessage = errors.array()[0].msg;
    return next(new HttpError(errorMessage, 422));
  }
  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(
      new HttpError("Something,went wrong,check your internet connection", 404)
    );
  }
  if (existingUser) {
    return next(
      new HttpError(
        "User already exists,please try again with a different email..",
        422
      )
    );
  }

  const hashedPassowrd = await bcrypt.hash(password, 12);

  const user = new User({
    name,
    email,
    password: hashedPassowrd,
    products: [],
  });
  try {
    await user.save();
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong,signup unsuccesful,please try it again..",
        404
      )
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      "iamnotArobotmrjwt",
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Something went wrong,please try it again", 404));
  }

  res.json({
    messgae: "SignUp Successful",
    userId: user.id,
    email: user.id,
    token,
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  let errorMessage;
  if (!errors.isEmpty()) {
    errorMessage = errors.array[0].msg;
    return next(new HttpError(errorMessage, 422));
  }

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email });
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong,could not match the associtaed email address,try it again.",
        401
      )
    );
  }

  if (!identifiedUser) {
    return next(
      new HttpError(
        "Please check your credentials and try again,could not log u in",
        401
      )
    );
  }

  let passwordIsValid;
  try {
    passwordIsValid = await bcrypt.compare(password, identifiedUser.password);
  } catch (error) {
    return next(
      new HttpError(
        "could not log u in, please try checking your credentials.",
        500
      )
    );
  }
  if (!passwordIsValid) {
    return next(
      new HttpError(
        "Invalid credentials,login with your correct credentials..",
        500
      )
    );
  }
  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      "iamnotArobotmrjwt",
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong,could not verify you,please try it again",
        404
      )
    );
  }

  res.json({
    message: "Logged In",
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token,
  });
};
