const express = require("express");
const cors = require("cors");
const fileUpload = require('express-fileupload');
const http = require('http');
const https = require('https');
const fs = require('fs');
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const userRoute = require('./app/routes/user.route');
const authRoute = require('./app/routes/auth.route');

const authMiddleware = require('./app/middlewares/auth.middleware');

dotenv.config();

const app = express();

// Load SSL certificate and key
// const privateKey = fs.readFileSync('ssl/server.key', 'utf8');
// const certificate = fs.readFileSync('ssl/server.crt', 'utf8');

// const credentials = { key: privateKey, cert: certificate };

const server = http.createServer(app);

app.use(fileUpload());

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', authMiddleware, userRoute);
app.use('/auth', authMiddleware, authRoute);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

