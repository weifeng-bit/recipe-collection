const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CuisineSchema = new Schema({
  name: {type: String, required: true, minlength: 1, maxlength: 100},
  origin: {type: String, minlength: 1},
  property: {type: String, maxlength: 300},
});

CuisineSchema
.virtual('url')
.get(function() {
  return '/catalog/cuisine/' + this._id;
});

module.exports = mongoose.model('Cuisine', CuisineSchema, 'Cuisine');