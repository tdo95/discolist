require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const app = express();
const port = 3000;

const spotify = require("./spotifyRelay");

app.use(express.json());

//URLS permited to access the routes
const whitelist = [];

//protects routes 
const corsOptions = {
    origin: (origin, callback) => {
        // if (!origin || whitelist.indexOf(origin) !== -1) {
        //     callback(null, true);
        // } else callback(new Error ("Not allowed by CORS"));
        callback(null, true);
    },
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

//limits each ip to 1 request per second
const limiter = rateLimit({
    windowMs: 500,
    max: 1
})
app.use(limiter);

//test route
app.get("/", (req, res) => res.json({success: "Hello World!"}));

app.use("/spotifyRelay", spotify);

app.listen(port, () => console.log(`App listening on port ${port}`) );