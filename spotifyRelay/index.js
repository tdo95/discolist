const express = require("express");
const router = express.Router();
//Node-fetch no longer supports CommonJS, use import to load it in asynchronously instead
//See: https://github.com/node-fetch/node-fetch#commonjs
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

//send request to authorization server to recieve access token
var expires;
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
        expires = new Date().getTime() + (data.expires_in * 1000);
        return data.access_token

    } catch (err) {
        return {Error: err.stack}
    }
}

//fetches token, if current token expired fetches new token
let token;
const getToken = async () => {
    let currentTime = new Date().getTime();
    if(!expires || currentTime - expires >= 0) {
        token = await authorize();
    }
    return token;
}

//fetch list of results of artists search based upon query entered
const fetchArtists = async (searchtext) => {
    let token = await getToken();
    
    const requestHeaders = new Headers();
    requestHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: 'GET',
        headers: requestHeaders,
    }
    const url = `https://api.spotify.com/v1/search?q=artist:${searchtext}&type=artist&limit=5`;

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
    const id = req.body.id;
    console.log(req.body)
    if (id) {
        let data = await fetchAlbums(id);
        res.json(data);
    }
    
    else res.json('Did not work shawty');
    //const data = await fetchArtists(searchtext);
    
})

async function fetchAlbums(artistId) {
    let token = await getToken();

    const requestHeaders = new Headers();
    requestHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: 'GET',
        headers: requestHeaders,
    }
    try {
        let response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,compilation&limit=50`, requestOptions);
        
        let data = await response.json();
        let albums = data.items;
        let nextLink = data.next;
        
        albums = await paginate(nextLink, requestOptions, albums);
        return albums;
    } catch (err) {
        return { Error: err.stack }
    }
}
//iterates through album list pages and adds all albums to array
async function paginate(url, reqOptions, albumList) {
    console.log('paginating....')
    while (url) {
        let res = await fetch(url, reqOptions);
        let data = await res.json();
        albumList = albumList.concat(data.items);
        url = data.next;
    }
    return albumList;

}

module.exports = router;
