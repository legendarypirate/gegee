module.exports = (app) => {
  const appMobile = require("../controllers/app.mobile.controller.js");
  const router = require("express").Router();

  router.get("/version", appMobile.getVersionConfig);

  app.use("/api/mobile/app", router);
};
