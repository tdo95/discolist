const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require("cors");

//URLS permited to access the routes
const whitelist = ['https://discolist.cyclic.app'];

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

//send request to authorization server to recieve access token
var expires;
async function authorize() {
    let params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
   
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method:'POST',
            headers: {
              "Authorization": `Basic ${new Buffer.from(process.env.SPOTIFY_ID + ":" + process.env.SPOTIFY_KEY).toString('base64')}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
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
    token = await authorize();
    // let currentTime = new Date().getTime();
    // if(!expires || currentTime - expires >= 0) {
    //     token = await authorize();
    // }
    return token;
}

//fetch list of results of artists search based upon query entered
const fetchArtists = async (searchtext) => {
    let token = await getToken();
   

    const requestOptions = {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
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
router.get('/:searchtext', cors(corsOptions), async (req, res) => {
   
    const searchtext = req.params.searchtext;
    let data = await fetchArtists(searchtext);
    res.json(data)

})

router.post("/", cors(corsOptions), async (req,res) => {
    const artist = req.body.artist;
    const album = req.body.album
    console.log(req.body)
    if (artist) {
        let data = await fetchAlbums(artist);
        res.json(data);
    }
    else if(album) {
        let data = await fetchTracks(album);
        res.json(data);
    }
    
    else res.json('Did not work shawty');
})

async function fetchTracks(albumId) {
    let token = await getToken();

    const requestOptions = {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
    }
    try {
        let response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, requestOptions);
        
        let data = await response.json();
        let tracks = data.items;
        let nextLink = data.next;
        
        tracks = await paginate(nextLink, requestOptions, tracks);
        return tracks;
    } catch (err) {
        return { Error: err.stack }
    }

}

async function fetchAlbums(artistId) {
    let token = await getToken();

    const requestOptions = {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        },
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

    while (url) {
        let res = await fetch(url, reqOptions);
        let data = await res.json();
        albumList = albumList.concat(data.items);
        url = data.next;
    }
    return albumList;

}

module.exports = router;
