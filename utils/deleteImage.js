const fs = require("fs");
exports.deleteImage = (path) => {
  fs.unlink(path, (err) => console.log(err));
};
