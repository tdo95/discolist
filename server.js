require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const port = process.env.PORT || 3000;

const spotify = require("./spotifyRelay");

app.use(express.json());

//middle ware to accommodate browsers that remove origin header from requests
app.use(function (req, res, next) {
    req.headers.origin = req.headers.origin || req.headers.referer;
    next();
});

//limits each ip to 1 request per second
const limiter = rateLimit({
    windowMs: 1000,
    max: 100
})
// app.use(limiter);

//set app to source files from public folder
app.use(express.static('public'));

//main route
app.get("/", (req, res) => res.render("index"));

app.use("/spotifyRelay", spotify);

app.listen(port, () => console.log(`App listening on port ${port}`) );