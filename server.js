require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const spotify = require("./spotifyRelay");

app.use(express.json());

//URLS permited to access the routes
const whitelist = ['https://localhost:3000'];

//protects routes 
const corsOptions = {
    origin: (origin, callback) => {
        console.log(origin)
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else callback(new Error ("Not allowed by CORS"));
          // callback(null, true);
    },
    optionsSuccessStatus: 200
}

// app.use(cors(corsOptions));


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