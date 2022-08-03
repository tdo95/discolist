const express = require("express");
const router = express.Router();
//Fetch no longer suppoerts CommonJS, use import to load it in asynchronously instead
//See: https://github.com/node-fetch/node-fetch#commonjs
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

//send request to authorization server to recieve access token
async function authorize() {
    let params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    let authHeaders = new Headers();
    authHeaders.append("Authorization", `Basic ${new Buffer.from(process.env.SPOTIFY_ID + ":" + process.env.SPOTIFY_KEY).toString('base64')}`);
    authHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method:'POST',
            headers: authHeaders,
            body: params,
            redirect: 'follow'
        });
        const data = await response.json();
        return data.access_token;

    } catch (err) {
        return {Error: err.stack}
    }
}

//fetch list of first 10 results of artists search based upon query entered
const fetchArtists = async (searchtext) => {
    const token = await authorize();
    
    const fetchHeaders = new Headers();
    fetchHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: 'GET',
        headers: fetchHeaders,
    }
    const url = `https://api.spotify.com/v1/search?q=${searchtext}&type=artist&limit=10`;

    try {
        const artistList =  await fetch(url, requestOptions);
        const artistListJson = await artistList.json();
        return artistListJson;

    } catch (err) {
        return { Error: err.stack };
    }
} 



router.get("/", (req, res) => {
    res.json({success: "Hello Spotify!"});
});
router.get('/:searchtext', async (req, res) => {
    const searchtext = req.params.searchtext;
    let data = await fetchArtists(searchtext);
    res.json(data)

})

router.post("/",async (req,res) => {
    const searchtext = req.body.searchtext;
    const data = await fetchArtists(searchtext);
    res.json(data);
})

module.exports = router;
