const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  name: { type: String, required: true, minlength: 1 },
  description: { type: String, maxlength: 500 },
  cookTime: { type: Number, enum: [10, 15, 20, 30, 60, 120], default: 60 },
  cuisine: [{ type: Schema.Types.ObjectId, ref: "Cuisine" }],
  ingredient: [String],
});

RecipeSchema.virtual("introduction").get(function () {
  let intro = "";
  if (this.name && this.description) {
    intro = `Name: ${this.name}
             Description: ${this.description}`;
  }
  return intro;
});

RecipeSchema.virtual("url").get(function () {
  return "/catalog/recipe/" + this._id;
});

module.exports = mongoose.model("Recipe", RecipeSchema, "Recipe");
