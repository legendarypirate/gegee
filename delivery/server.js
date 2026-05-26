const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS configuration: allow specific origins and credentials (required for cookies/auth)
const allowedOrigins = [
  "http://localhost:3000",
  "https://superdeliv.mn",
  "https://www.superdeliv.mn",
];
var corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, mobile apps) in development
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Required: sends Access-Control-Allow-Credentials: true (needed when frontend uses credentials: 'include')
};

// Enable CORS
app.use(cors(corsOptions));

// parse requests of content-type - application/json
// Increase limit to 50MB to handle large payloads (e.g., base64 images, large delivery data)
app.use(express.json({ limit: '50mb' }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (images) from the 'app/assets' folder
app.use("/assets", express.static(path.join(__dirname, "app", "assets")));

// Import models (Make sure to update the path if necessary)y
const db = require("./app/models");

// Sync database and handle any errors
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});
require("./app/routes/ware.routes")(app);

require("./app/routes/good.routes")(app);

// Route imports
require("./app/routes/age.routes")(app);
require("./app/routes/doctor.routes")(app);
require("./app/routes/info.routes")(app);
require("./app/routes/delivery.routes")(app);
require("./app/routes/status.routes")(app);
require("./app/routes/order.routes")(app);
require("./app/routes/region.routes")(app);
require("./app/routes/notification.routes")(app);
require("./app/routes/report.routes")(app);
require("./app/routes/summary.routes")(app);
require("./app/routes/request.routes")(app);

// Route imports
require("./app/routes/banner.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/auth.routes")(app);

// Role-related routes
require("./app/routes/role.routes")(app);
require("./app/routes/permission.routes")(app);

// Word-related routes
require("./app/routes/word.routes")(app);

// Category-related routes
require("./app/routes/category.routes")(app);
require("./app/routes/privacy.routes")(app);
require("./app/routes/rolePermission.routes")(app);


// User-related routes
require("./app/routes/user.routes")(app);
//mobile
require("./app/routes/app.mobile.routes")(app);
require("./app/routes/delivery.mobile.routes")(app);
require("./app/routes/order.mobile.routes")(app);
require("./app/routes/good.mobile.routes")(app);

// Add error handling for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({ message: "Route not found!" });
});

// set port, listen for requests
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
