
//searchbox open and close animation (for mobile)
let searchIcon = document.querySelector('.catalog .search_icon');
let searchBox = document.querySelector('.catalog .search');
let searchInput = document.querySelector('.catalog .search_input')
let title = document.querySelector('.title.small');
searchIcon.addEventListener('click', toggleSearchBox);
let toggled;
searchInput.addEventListener('focus', () => {
    if (window.innerWidth <= 730) {
        searchBox.classList.add('search_open');
        title.classList.add('hidden');
        searchInput.style.width = window.innerWidth < 400 ? '160px' : '180px';
        toggled = true;
    }
});
function toggleSearchBox() {

    if (window.innerWidth <= 730) {
        if (!toggled) {
            searchBox.classList.add('search_open');
            title.classList.add('hidden');
            searchInput.style.width = window.innerWidth < 400 ? '160px' : '180px';
            toggled = true;
            console.log('TOGGLED!')
        }
        else {
            searchBox.classList.remove('search_open');
            title.classList.remove('hidden');
            searchInput.style.width = '0px'
            toggled = false;
        }   
    } 
}

//Get search input and fetch artists results
let searchInputs = document.querySelectorAll('.search_input');
searchInputs.forEach(element => element.addEventListener('input', () => getSearchResults(element)));

let timeout;
function getSearchResults(e) {
    //displays results 300 milliseconds after input has stopped coming in
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(async () => {
        let data = await fetchArtists(e.value)
        makeArtistObjects(data);
        displayArtistsResults();
    }, 450);
}

//fetch artists from Spotify API via API Relay on server
async function fetchArtists(input) {
    if (!input) return;
    console.log(input);
    try {
        let response = await fetch(`http://localhost:3000/spotifyRelay/${input}`);
        let data = await response.json();
        return data.artists.items;
    } catch (err) {
        console.log(err);
    }
}

//Artist class stores information about each artist returned from search
class Artist {
    constructor(name, href, image, id, popularity) {
        this.name = name;
        this.href = href;
        this.image = image;
        this.id = id;
        this.popularity = popularity;
    }
}
//Generates artist objects from data returned from fetch
let artistList;
function makeArtistObjects(artists) {
    artistList = {}; //global
    // only set to null if input is empty, if input is empty fetch returns undefined
    if (artists === undefined) artistList = null;
    else {
        for (let person of artists) {
            let artist = new Artist(person.name, person.href, person.images[0], person.id, person.popularity);
            artistList[artist.name] = artist;
        }
    }
    console.log(artists, artistList);
}
//displays artist results in DOM
function displayArtistsResults() {
   //returns dropdown that's active
    let dropdown = resetScreen();

    //skips if there is no search result
    if (!artistList) return;

    //append empty search message
    if (Object.keys(artistList).length === 0) {
        let block = document.createElement('p');
        block.innerHTML = '<span>Looks like we don\'t have that artist 🥺 <br><br>Try another search.</span>';       
        block.classList.add('search_dropdown_message');
        dropdown.appendChild(block);
    }
    //append artists to dropdown
    else {
        for (let artist in artistList) {
            let block = document.createElement('button');
            block.innerText = artist;
            block.classList.add('search_dropdown_entry');
            block.addEventListener('click', () => displayCatalog(artist));
            dropdown.appendChild(block);
        }
    }
        
}

//Display artist catalog
async function displayCatalog(artistName) {
    //get artist ID
    let id = artistList[artistName].id;
    
    closeWindow()

    await waitFor(500);
    //fetch catalog
    let albums = await fetchAlbums(id);
    makeAlbumObjects(albums);
    //reset screen values
    resetScreen()

    addArtistInfo(artistName)
    addAlbumInfo()
    
    
    //await waitFor(1000);
    //input results in window
    openWindow()
    
}

function addAlbumInfo() {
    //add albums to catalog
    let catalog = document.querySelector('.projects');
    console.log(albumTypeMap)
    for (let catagory in albumTypeMap) {
        
        //if object has values
        if (Object.keys(albumTypeMap[catagory]).length > 0) {
            let newGroup = document.createElement('section')
            newGroup.classList.add('project-group');
            let groupTitle = document.createElement('h3')
            groupTitle.innerText = (catagory + "s").toUpperCase();
            newGroup.appendChild(groupTitle);
            catalog.appendChild(newGroup);
        }
        
    }
    

    //add albums to timeline
}

function addArtistInfo(name) {
   let artist = artistList[name]
   console.log(artist);

   let titleName = document.querySelector('.artist-info-block h1');
   titleName.innerText = artist.name;
    let titleImg = document.querySelector('.artist-info-image');
    if (artist.image.url) titleImg.src = artist.image.url;
}

function resetScreen() {
    //find which dropdown screen is active
    //TODO: Make this more efficient (maybe use a varaible to signify which screen is open)
    let dropdown;
    let options = document.querySelectorAll('#home, #catalog');
    options.forEach(element => {
        let hidden = element.classList.contains('hidden');
        if (hidden) return;
        dropdown = document.querySelector(`#${element.id} .search_dropdown`);
        console.log(dropdown)
    });
    console.log(dropdown);
    
    //clear previous dropdown results
    while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

    //TODO: clear previous artist info
    let titleName = document.querySelector('.artist-info-block h1');
   titleName.innerText = "";
    let titleImg = document.querySelector('.artist-info-image');
    titleImg.src = 'blank-profile-picture.webp'
    //TODO: clear previous albums info on both view pages

    return dropdown;

}

//create album objects and group them into catagories
let albumTypeMap, albumYearMap;
function makeAlbumObjects(albums) {
    albumTypeMap = {
        'single': {},
        'compilation': {},
        'album': {}
    };
    albumYearMap = {};
    for (let i = albums.length - 1; i >= 0; i--) {
        let album = albums[i];
        //if album has alreay been listed in album catagory list, skip it
        if ((album.name in albumTypeMap[album.album_type]) ) continue;

        //create album obj
        let albumObj = new Album(album.name, album.album_type, album.id, album.images, album.release_date, album.total_tracks, album.artists);
        
        //add album to type map
        albumTypeMap[albumObj.type][albumObj.name] = albumObj;

        //add album to year map 
        //NOTE: i didnt wantt to use slice bc performance but rlly tho idk 
        let year = albumObj.releaseDate[0] + albumObj.releaseDate[1] +albumObj.releaseDate[2]+albumObj.releaseDate[3];
        //if year catagory doesnt exists, create it
        if (!albumYearMap[year]) albumYearMap[year] = {};
        albumYearMap[year][albumObj.name] = albumObj;
    }
    console.log(albumTypeMap, albumYearMap);
}

class Album {
    constructor(name, type, id, image, releaseDate, totalTracks, artists) {
        this.name = name;
        this.type = type;
        this.id = id;
        this.image = image;
        this.releaseDate = releaseDate;
        this. totalTracks = totalTracks;
        this.artists = artists;
    }
}

async function fetchAlbums(id) {
    const requestHeaders = new Headers();
    requestHeaders.append("content-type", "application/json");

    const requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({"id": id})
    }
    try {
        let res = await fetch(`http://localhost:3000/spotifyRelay/`, requestOptions);
        let data = await res.json();
        return data;
        
    } catch (err) {
        console.log(err)
    }

}

function closeWindow() {
    let page = document.querySelector('.window_cover');
    page.classList.remove('widen');
    page.classList.add('close');
}

function openWindow() {
    let page = document.querySelector('.window_cover');
    page.classList.remove('close')
    page.classList.add('widen')

}

const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));