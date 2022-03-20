const express = require("express");
const router = express.Router();

// Require controller modules
const cuisine_controller = require("../controllers/cuisineController");
const recipe_controller = require("../controllers/recipeController");

// Recipe Routes
// GET catalog home page
router.get("/", recipe_controller.index);

// GET request for creating recipe. Note this must come
// before routes that display recipe (uses id)
router.get("/recipe/create", recipe_controller.recipe_creation_get);

// POST request for creating recipe
router.post("/recipe/create", recipe_controller.recipe_creation_post);

// GET request to delete recipe
router.get("/recipe/:id/delete", recipe_controller.recipe_delete_get);

// POST request to delete recipe
router.post("/recipe/:id/delete", recipe_controller.recipe_delete_post);

// GET request to update recipe
router.get("/recipe/:id/update", recipe_controller.recipe_update_get);

// POST request to upfate recipe
router.post("/recipe/:id/update", recipe_controller.recipe_update_post);

// GET request for one recipe
router.get("/recipe/:id", recipe_controller.recipe_detail);

// GET request for list of all recipe items
router.get("/recipes", recipe_controller.recipe_list);

// Cuisine Routes

// GET request for creating cuisine. Note this must come
// before routes that display cuisine (uses id)
router.get("/cuisine/create", cuisine_controller.cuisine_creation_get);

// POST request for creating cuisine
router.post("/cuisine/create", cuisine_controller.cuisine_creation_post);

// GET request to delete cuisine
router.get("/cuisine/:id/delete", cuisine_controller.cuisine_delete_get);

// POST request to delete cuisine
router.post("/cuisine/:id/delete", cuisine_controller.cuisine_delete_post);

// GET request to update cuisine
router.get("/cuisine/:id/update", cuisine_controller.cuisine_update_get);

// POST request to upfate cuisine
router.post("/cuisine/:id/update", cuisine_controller.cuisine_update_post);

// GET request for one cuisine
router.get("/cuisine/:id", cuisine_controller.cuisine_detail);

// GET request for list of all cuisine items
router.get("/cuisines", cuisine_controller.cuisine_list);

module.exports = router;
