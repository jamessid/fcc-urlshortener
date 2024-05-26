const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UrlSchema = new Schema({
    url: { type: String, required: true },
});

// Export model
module.exports = mongoose.model("Url", UrlSchema);