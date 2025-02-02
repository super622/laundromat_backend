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
const roleRoute = require('./app/routes/role.route');
const planRoute = require('./app/routes/plan.route');
const tagRoute = require('./app/routes/tag.route');
const likesRoute = require('./app/routes/likes.route');
const imageRoute = require('./app/routes/image.route');
const questionRoute = require('./app/routes/question.route');
const gptRoute = require('./app/routes/gpt.route');

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
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/role', roleRoute);
app.use('/api/plan', planRoute);
app.use('/api/tag', tagRoute);
app.use('/api/likes', likesRoute);
app.use('/image', imageRoute);
app.use('/api/question', questionRoute)
app.use('/', gptRoute)

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});
