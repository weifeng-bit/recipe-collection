const Cuisine = require("../models/cuisine");
const Recipe = require("../models/recipe");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all cuisines
exports.cuisine_list = (req, res) => {
  Cuisine.find()
    .sort({ name: 1 })
    .exec((err, list_cuisines) => {
      if (err) {
        return next(err);
      }
      res.render("cuisine_list", {
        title: "Cuisine List",
        cuisine_list: list_cuisines,
      });
    });
};

// Display sigular cuisine detail
exports.cuisine_detail = (req, res) => {
  async.parallel(
    {
      cuisine: (callback) => {
        Cuisine.findById(req.params.id).exec(callback);
      },
      cuisine_recipes: (callback) => {
        Recipe.find({ cuisine: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.cuisine == null) {
        const err = new Error("Cuisine not found");
        err.status = 404;
        return next(err);
      }
      res.render("cuisine_detail", {
        title: "Cuisine Detail",
        cuisine: results.cuisine,
        cuisine_recipes: results.cuisine_recipes,
      });
    }
  );
};

// Display cuisine creation form on GET
exports.cuisine_creation_get = (req, res) => {
  res.render("cuisine_form", { title: "Create Cuisine" });
};

// Display cuisine creation on POST
exports.cuisine_creation_post = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Cuisine name required.")
    .isAlphanumeric(undefined, { ignore: "\s" })
    .withMessage("Cuinse name has non-alphanumeric characters."),

  body("origin")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Origin country must be specified")
    .isAlphanumeric(undefined, { ignore: "\s" })
    .withMessage("Country name has non-alphanumeric characters."),

  body("property")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .escape()
    .unescape("'", '"')
    .withMessage("The length of property should be no more than 300"),

  (req, res, next) => {
    const errors = validationResult(req);
    const cuisine = new Cuisine({
      name: req.body.name,
      origin: req.body.origin,
      property: req.body.property,
    });

    if (!errors.isEmpty()) {
      res.render("cuisine_form", {
        title: "Create Cuisine",
        cuisine: cuisine,
        errors: errors.array(),
      });
      return;
    } else {
      Cuisine.findOne({ name: req.body.name }).exec((err, found_cuisine) => {
        if (err) {
          return next(err);
        }
        if (found_cuisine) {
          res.redirect(found_cuisine.url);
        } else {
          cuisine.save((err) => {
            if (err) {
              return next(err);
            }
            res.redirect(cuisine.url);
          });
        }
      });
    }
  },
];

// Display cuisine deletion on GET
exports.cuisine_delete_get = (req, res, next) => {
  async.parallel(
    {
      cuisine: function (callback) {
        Cuisine.findById(req.params.id).exec(callback);
      },
      cuisine_recipes: function (callback) {
        Recipe.find({ cuisine: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.cuisine == null) {
        // No results.
        res.redirect("/catalog/cuisines");
      }
      if (results.cuisine_recipes.length > 0) {
        res.render("cuisine_delete", {
          title: "Delete Cuisine",
          cuisine: results.cuisine,
          cuisine_recipes: results.cuisine_recipes,
        });
        return;
      }

      res.render("cuisine_delete", {
        title: "Delete Cuisine",
        cuisine: results.cuisine,
        cuisine_recipes: results.cuisine_recipes,
      });
    }
  );
};

// Display cuisine deletion on POST
exports.cuisine_delete_post = (req, res, next) => {
  async.parallel(
    {
      cuisine: (callback) => {
        Cuisine.findById(req.body.cuisineid).exec(callback);
      },
      cuisine_recipes: (callback) => {
        Recipe.find({ cuisine: req.body.cuisineid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      Cuisine.findByIdAndRemove(
        req.body.cuisineid,
        function deleteCuisine(err) {
          if (err) {
            return next(err);
          }
          res.redirect("/catalog/cuisines");
        }
      );
    }
  );
};

// Display cuisine update on GET
exports.cuisine_update_get = (req, res, next) => {
  async.parallel(
    {
      cuisine: (callback) => {
        Cuisine.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.cuisine == null) {
        const err = new Error("Cuisine not found");
        err.status = 404;
        return next(err);
      }

      res.render("cuisine_form", {
        title: "Update Cuisine",
        cuisine: results.cuisine,
      });
    }
  );
};

// Display cuisine update on POST
exports.cuisine_update_post = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Cuisine name required.")
    .isAlphanumeric(undefined, { ignore: "\s" })
    .withMessage("Cuisine name has non-alphanumeric characters."),

  body("origin")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Origin country must be specified")
    .isAlpha(undefined, { ignore: "\s" })
    .withMessage("Country name has non-alpha characters."),

  body("property")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .escape()
    .unescape("'", '"')
    .withMessage("The length of property should be no more than 300"),

  (req, res, next) => {
    const errors = validationResult(req);
    const cuisine = new Cuisine({
      name: req.body.name,
      origin: req.body.origin,
      property: req.body.property,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("cuisine_form", {
        title: "Update Cuisine",
        cuisine: cuisine,
        errors: errors.array(),
      });
      return;
    } else {
      Cuisine.findByIdAndUpdate(
        req.params.id,
        cuisine,
        {},
        (err, updated_cuisine) => {
          if (err) {
            return next(err);
          }

          res.redirect(updated_cuisine.url);
        }
      );
    }
  },
];
