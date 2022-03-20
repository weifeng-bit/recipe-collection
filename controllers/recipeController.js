const Recipe = require("../models/recipe");
const Cuisine = require("../models/cuisine");
const debug = require("debug");

const async = require("async");
const { body, validationResult } = require("express-validator");
const recipe = require("../models/recipe");

exports.index = (req, res) => {
  async.parallel(
    {
      recipe_count: (callback) => {
        Recipe.countDocuments({}, callback);
      },
      cuisine_count: (callback) => {
        Cuisine.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Recipe Collection Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all recipes
exports.recipe_list = (req, res, next) => {
  Recipe.find({}, "name cuisine")
    .sort({ name: 1 })
    .populate("cuisine")
    .exec((err, list_recipes) => {
      if (err) {
        debug("update error:" + err);
        return next(err);
      }
      res.render("recipe_list", {
        title: "Recipe List",
        recipe_list: list_recipes,
      });
    });
};

// Display sigular recipe detail
exports.recipe_detail = (req, res, next) => {
  async.parallel(
    {
      recipe: (callback) => {
        Recipe.findById(req.params.id).populate("cuisine").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        debug("update error:" + err);
        return next(err);
      }
      if (results.recipe == null) {
        const err = new Error("Recipe not found");
        err.status = 404;
        debug("update error:" + err);
        return next(err);
      }

      res.render("recipe_detail", {
        title: results.recipe.name,
        recipe: results.recipe,
      });
    }
  );
};

// Display recipe creation form on GET
exports.recipe_creation_get = (req, res, next) => {
  async.parallel(
    {
      cuisines: (callback) => {
        Cuisine.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        debug("update error:" + err);
        return next(err);
      }
      res.render("recipe_form", {
        title: "Create Recipe",
        cuisines: results.cuisines,
      });
    }
  );
};

// Display recipe creation on POST
exports.recipe_creation_post = [
  (req, res, next) => {
    if (!(req.body.cuisine instanceof Array)) {
      if (typeof req.body.cuisine === "undefined") req.body.cuisine = [];
      else req.body.cuisine = new Array(req.body.cuisine);
    }
    next();
  },

  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("The length of description should be no more than 500")
    .escape()
    .unescape("'", '"'),

  body("cuisine.*").escape(),
  body("cookTime")
    .escape()
    .isNumeric()
    .withMessage("Cooking time should be a number"),
  body("ingredient.*").escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const arr_ingredient = [];
    for (ing of req.body.ingredient) {
      if (ing.length !== 0) {
        arr_ingredient.push(ing);
      }
    }

    let recipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      cookTime: req.body.cookTime,
      cuisine: req.body.cuisine,
      ingredient: arr_ingredient,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          cuisines: (callback) => {
            Cuisine.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            debug("update error:" + err);
            return next(err);
          }

          for (let i = 0; i < results.cuisines.length; i++) {
            if (recipe.cuisine.indexOf(results.cuisines[i]._id) > -1) {
              results.cuisines[i].checked = "true";
            }
          }

          res.render("recipe_form", {
            title: "Create Recipe",
            cuisines: results.cuisines,
            recipe: recipe,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      recipe.save((err) => {
        if (err) {
          debug("update error:" + err);
          return next(err);
        }
        res.redirect(recipe.url);
      });
    }
  },
];

// Display recipe deletion on GET
exports.recipe_delete_get = (req, res, next) => {
  async.parallel(
    {
      recipe: (callback) => {
        Recipe.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        debug("update error:" + err);
        return next(err);
      }
      if (results.recipe == null) {
        res.redirect("/catalog/recipes");
      }

      res.render("recipe_delete", {
        title: "Delete Recipe",
        recipe: results.recipe,
      });
    }
  );
};

// Display recipe deletion on POST
exports.recipe_delete_post = (req, res, next) => {
  async.parallel(
    {
      recipe: (callback) => {
        Recipe.findById(req.body.recipeid).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        debug("update error:" + err);
        return next(err);
      }

      Recipe.findByIdAndDelete(req.body.recipeid, function DeleteRecipe(err) {
        if (err) {
          debug("update error:" + err);
          return next(err);
        }
        res.redirect("/catalog/recipes");
      });
    }
  );
};

// Display recipe update on GET
exports.recipe_update_get = (req, res, next) => {
  async.parallel(
    {
      recipe: (callback) => {
        Recipe.findById(req.params.id).populate("cuisine").exec(callback);
      },
      cuisines: (callback) => {
        Cuisine.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        debug("update error:" + err);
        return next(err);
      }
      if (results.recipe == null) {
        const err = new Error("Recipe not found");
        err.status = 404;
        debug("update error:" + err);
        return next(err);
      }

      for (
        let all_c_iter = 0;
        all_c_iter < results.cuisines.length;
        all_c_iter++
      ) {
        for (
          let recipe_c_iter = 0;
          recipe_c_iter < results.recipe.cuisine.length;
          recipe_c_iter++
        ) {
          if (
            results.cuisines[all_c_iter]._id.toString() ===
            results.recipe.cuisine[recipe_c_iter]._id.toString()
          ) {
            results.cuisines[all_c_iter].checked = "true";
          }
        }
      }
      res.render("recipe_form", {
        title: "Update Recipe",
        cuisines: results.cuisines,
        recipe: results.recipe,
      });
    }
  );
};

// Display recipe update on POST
exports.recipe_update_post = [
  (req, res, next) => {
    if (!req.body.cuisine instanceof Array) {
      if (typeof req.body.cuisine === "undefined") {
        req.body.cuisine = [];
      } else {
        req.body.cuisine = new Array(req.body.cuisine);
      }
    }
    next();
  },

  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),

  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("The length of description should be no more than 500")
    .escape()
    .unescape("'", '"'),

  body("cuisine.*").escape(),
  body("cookTime")
    .escape()
    .isNumeric()
    .withMessage("Cooking time should be a number"),
  body("ingredient.*").escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const arr_ingredient = [];
    for (ing of req.body.ingredient) {
      if (ing.length !== 0) {
        arr_ingredient.push(ing);
      }
    }

    let recipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      cookTime: req.body.cookTime,
      cuisine: req.body.cuisine,
      ingredient: arr_ingredient,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          cuisines: (callback) => {
            Cuisine.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            debug("update error:" + err);
            return next(err);
          }

          for (let i = 0; i < results.cuisines.length; i++) {
            if (recipe.cuisine.indexOf(results.cuisines[i]._id) > -1) {
              results.cuisines[i].checked = "true";
            }
          }

          res.render("recipe_form", {
            title: "Update Recipe",
            cuisines: results.cuisines,
            recipe: recipe,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      Recipe.findByIdAndUpdate(req.params.id, recipe, {}, (err, therecipe) => {
        if (err) {
          debug("update error:" + err);
          return next(err);
        }
        res.redirect(therecipe.url);
      });
    }
  },
];
