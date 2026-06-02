module.exports = app => {
    const good = require("../controllers/good.controller.js");
    const { authenticate } = require("../middleware/auth.middleware");
  
    var router = require("express").Router();
    
    // Legacy mobile flow uses this endpoint without auth header.
    // Keep it public so "Шинэ хүргэлт нэмэх" can load goods.
    router.get("/", good.findAll);

    // Apply authentication middleware to protected routes
    router.use(authenticate);

    router.patch("/:id/stock", good.updateStock);
    router.get("/:id/history", good.getHistory);
    // Create a new Tutorial
    router.post("/", good.create);
  
    // Retrieve all published Tutorials
    router.get("/published", good.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", good.findOne);
  
    // Update a Tutorial with id
    router.patch("/:id", good.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", good.delete);
  
    // Delete all Tutorials
    router.delete("/", good.deleteAll);
  

    app.use('/api/good', router);
  };
  