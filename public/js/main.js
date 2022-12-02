//////////////////////////////////////////////////////////////////////////////////////////////// MOBILE SEARCH BOX ANIMATION

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
//////////////////////////////////////////////////////////////////////////////////////////////// SEARCH FOR ARTIST

//Get search input, fetch artists results, and display on screen
let searchInputs = document.querySelectorAll('.search_input');
searchInputs.forEach(element => element.addEventListener('input', () => getSearchResults(element)));

let timeout;
function getSearchResults(e) {
    //displays results 300 milliseconds after input has stopped coming in
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(async () => {
        let data = await fetchArtists(e.value)
        makeArtistObjects(data);
        displayArtistSearchResults();
    }, 250);
}

//fetch artists from Spotify API via API Relay on server
async function fetchArtists(input) {
    if (!input) return;
    
    try {
        let response = await fetch(`/spotifyRelay/${input}`);
        let data = await response.json();
      
        return data.artists.items;
    } catch (err) {
        console.log(err);
    }
}

//Artist class stores information about each artist returned from search
class Artist {
    constructor(name, href, image, id, popularity, genres) {
        this.name = name;
        this.href = href;
        this.image = image;
        this.id = id;
        this.popularity = popularity;
        this.genres = genres;
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
            let artist = new Artist(person.name, person.href, person.images[0], person.id, person.popularity, person.genres);
            artistList[artist.name] = artist;
        }
    }
}

//displays artist results in DOM
function displayArtistSearchResults() {
   //get dropdown that's active (either home or catalog)
    let dropdown = getDropdown();
    //clear previous dropdown results
    dropdown.innerHTML = "";
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
            //shorten long text
            let cutoff;
            if (artist.length > 40) cutoff = artist.slice(0,37) + "...";
            block.innerText = (cutoff || artist);
            block.classList.add('search_dropdown_entry');
            block.addEventListener('click', () => displayCatalog(artist));
            dropdown.appendChild(block);
        }
    }      
}

//////////////////////////////////////////////////////////////////////////////////////////////// DISPLAY SELECTED ARTIST IN CATALOG PAGES 

//swiches view in main catalog page (to either timeline or catalog)
let timelineBtn = document.querySelector('.timeline-btn');
let catalogBtn = document.querySelector('.catalog-btn');
timelineBtn.addEventListener('click', async() => {
    closeWindow()
    await waitFor(500);
    document.querySelector('.projects').classList.add('hidden');
    timelineBtn.classList.add('hidden');
    document.querySelector('.timeline').classList.remove('hidden');
    catalogBtn.classList.remove('hidden');
    openWindow()
});
catalogBtn.addEventListener('click', async() => {
    closeWindow()
    await waitFor(500);
    document.querySelector('.timeline').classList.add('hidden');
    timelineBtn.classList.remove('hidden');
    document.querySelector('.projects').classList.remove('hidden');
    catalogBtn.classList.add('hidden');
    openWindow()
});

//Display artist catalog page 
async function displayCatalog(artistName) {
    //get artist ID
    let id = artistList[artistName].id;
    closeWindow();
    await waitFor(500);
    //set catalog screen if necessary
    setCatalogScreen();
    //fetch catalog
    let albums = await fetchAlbums(id);
    //reset screen values
    resetScreen();
    
    makeAlbumObjects(albums);
    addArtistInfoToPage(artistName);
    //adds album cards to both timeline and catalog view pages
    addAlbumInfoToPages();

    //lets page completely before showing
    await waitFor(200);
    openWindow();  
}

//manages transition from home screen to catalog screen
function setCatalogScreen() {
    let home = document.querySelector('#home');
    let catalog = document.querySelector('#catalog');

    if (!(home.classList.contains('hidden'))) {
        home.classList.add('hidden');
        catalog.classList.remove('hidden');
    }
}

function addAlbumInfoToPages() {
    //add albums to catalog
    let catalog = document.querySelector('.projects');
    
    for (let catagory in albumTypeMap) {
        
        //if catagory object has values
        if (Object.keys(albumTypeMap[catagory]).length > 0) {
            let newGroup = document.createElement('section')
            newGroup.classList.add('project-group');

            let groupTitle = document.createElement('h3')
            groupTitle.innerText = (catagory + "s").toUpperCase();
            newGroup.appendChild(groupTitle);

            let cardsContainer = document.createElement('section');
            cardsContainer.classList.add('project-cards')

            //capializate type casing
            let type = catagory[0].toUpperCase() + catagory.slice(1)
            
            //add each album card
            for (let album in albumTypeMap[catagory]) {
                //create album card element
                let card = createCard(album, catagory, type);
                //add card to catalog container
                cardsContainer.appendChild(card)
                //add card to timeline view
                let projGroup = document.querySelector(`.Y${albumTypeMap[catagory][album].year} .project-cards`);
                let cardCopy = card.cloneNode(true);
                //CLICK EVENT TO ACTIVATE MODAL WINDOW FOR TIMELINE CARDS
                cardCopy.addEventListener('click', async () => {
                    let tracks = await fetchTracks(albumTypeMap[catagory][album].id);

                    addAlbumInfoToModal(albumTypeMap[catagory][album]);
                    addTracksToModal(tracks);
                
                    //let system process
                    await waitFor(100)
                
                    //unhide modal
                    document.querySelector('#modal-screen').classList.remove('hidden')
                })

                projGroup.appendChild(cardCopy);
            }
            newGroup.appendChild(cardsContainer);
            catalog.appendChild(newGroup);
        }
        
    }
}

//creates album cards
function createCard(album, catagory, type) {
    let card = document.createElement('div');
    card.classList.add('card');
                
    let cardImg = document.createElement('img');
    cardImg.src = albumTypeMap[catagory][album].image[0].url;
    cardImg.classList.add('card_image')
    card.appendChild(cardImg);

    let cardTitle = document.createElement('h4');
    cardTitle.classList.add('card_title');
    //allows long text to fit card
    let cutoff;
    if (albumTypeMap[catagory][album].name.length > 30) cutoff = albumTypeMap[catagory][album].name.slice(0,29) + '...';
    //decreases font size for long text in mobile and otherwise
    if (window.innerWidth <= 550 && albumTypeMap[catagory][album].name.length >= 30) cardTitle.style.fontSize = "1rem";
    else if (albumTypeMap[catagory][album].name.length >= 35) cardTitle.style.fontSize = "1.3rem";
    cardTitle.innerText = ( cutoff || albumTypeMap[catagory][album].name );
    card.appendChild(cardTitle);

    let cardDetails = document.createElement('span');
    cardDetails.classList.add('card_type');
    cardDetails.innerHTML = `${type} • <span class="card_year">${albumTypeMap[catagory][album].year}</span>`;
    card.appendChild(cardDetails);
    //CLICK EVENT TO ACTIVATE MODAL WINDOW FOR CATALOG CARDS
    card.addEventListener('click', async () => {
        let tracks = await fetchTracks(albumTypeMap[catagory][album].id);
        
        addAlbumInfoToModal(albumTypeMap[catagory][album]);
        addTracksToModal(tracks);

        //let system process
        await waitFor(100)

        //unhide modal
        document.querySelector('#modal-screen').classList.remove('hidden')
    })
    return card;
}

function addArtistInfoToPage(name) {
    let artist = artistList[name];
    
    let titleName = document.querySelector('.artist-info-block h1');
    //reduces text size if title is long on mobile
    if (window.innerWidth <= 500 ) {
        if ((![...artist.name].includes(' ') && artist.name.length > 7) || artist.name.length > 20) titleName.style.fontSize = "2rem";
    }
    titleName.innerText = artist.name;
    //inputs the first 3 genres if present
    document.querySelector('.genres').innerHTML = `<span> Genres: </span> ${artist.genres[0] ? artist.genres[0] : "N/A" }${artist.genres[1] ? ", " + artist.genres[1]  : "" }${artist.genres[2] ? ", " + artist.genres[2] : "" }`
    let titleImg = document.querySelector('.artist-info-image');
    if (artist.image?.url) titleImg.src = artist.image.url;
}

//find which dropdown screen is active
//TODO: Make this more efficient (maybe use a varaible to signify which screen is open)
function getDropdown() {
    
    let dropdown;
    let options = document.querySelectorAll('#home, #catalog');
    options.forEach(element => {
        let hidden = element.classList.contains('hidden');
        if (hidden) return;
        dropdown = document.querySelector(`#${element.id} .search_dropdown`);
    });
    
    return dropdown;
}

function resetScreen() {
    
    let dropdown = getDropdown();
    //clear previous dropdown results
    while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

    //clear previous artist info
    let titleName = document.querySelector('.artist-info-block h1');
   titleName.innerText = "";
    let titleImg = document.querySelector('.artist-info-image');
    titleImg.src = 'blank-profile-picture.webp'

    //clear previous albums info on both view pages and only include headers
    let projects = document.querySelector('.projects');
    let timeline = document.querySelector('.timeline');
    timeline.innerHTML = '<h2 class="medium-size">Timeline</h2>';
    projects.innerHTML = '<h2 class="medium-size">Music Catalog</h2>';
}

//create album objects and group them into catagories
let albumTypeMap, albumYearList; //globals
function makeAlbumObjects(albums) {
    albumTypeMap = {
        'album': {},
        'single': {},
        'compilation': {}
    };
    albumYearList = [];
    
    for (let i = 0; i < albums.length; i++) {
        let album = albums[i];
        //if album has alreay been listed in album catagory list, skip it
        if ((album.name in albumTypeMap[album.album_type]) ) continue;
        //NOTE: i didnt wantt to use slice bc performance but rlly tho idk 
        let year = album.release_date[0] + album.release_date[1] +album.release_date[2]+album.release_date[3];     
        //create album obj
        let albumObj = new Album(album.name, album.album_type, album.id, album.images, album.release_date, year, album.total_tracks, album.artists, album.external_urls.spotify);
        //add album to type map
        albumTypeMap[albumObj.type][albumObj.name] = albumObj;
        //track album years, if year catagory doesnt exists, create it
        if (!albumYearList.includes(year)) albumYearList.push(year)
    }

    //create year group in timeline
    albumYearList.sort((a,b) => b - a);
    addYearGroupsToTimeline(albumYearList);
    
}

function addYearGroupsToTimeline(yearList) {
    let timeline = document.querySelector(`.timeline`);
    
    for (let year of yearList) {
        
        let yearMarker = document.createElement('div');
        yearMarker.classList.add(`year-marker`);
        yearMarker.innerHTML = `<h3>${year}</h3><div class="line"></div>`
        timeline.appendChild(yearMarker);
        

        //TODO: Refractor this later so that we're not creating two groups
        let yearGroup = document.createElement('section');
        yearGroup.classList.add(`year-group`);
        yearGroup.classList.add(`Y${year}`);
        let projectCardsGroup = document.createElement('section');
        projectCardsGroup.classList.add('project-cards');
        yearGroup.appendChild(projectCardsGroup);
        timeline.appendChild(yearGroup);
    }
}

class Album {
    constructor(name, type, id, image, releaseDate, year, totalTracks, artists, externalLink) {
        this.name = name;
        this.type = type;
        this.id = id;
        this.image = image;
        this.releaseDate = releaseDate;
        this.year = year;
        this. totalTracks = totalTracks;
        this.artists = artists;
        this.externalLink = externalLink;
    }
}

async function fetchAlbums(id) {
    const requestHeaders = new Headers();
    requestHeaders.append("content-type", "application/json");

    const requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({"artist": id})
    }
    try {
        let res = await fetch(`/spotifyRelay`, requestOptions);
        let data = await res.json();
        console.log(data)
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

//////////////////////////////////////////////////////////////////////////////////////////////// DISPLAY MODAL WINDOW WITH ALBUM TRACKS

async function fetchTracks(id) {
    
    const requestHeaders = new Headers();
    requestHeaders.append("content-type", "application/json");

    const requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({"album": id})
    }
    try {
        let res = await fetch(`/spotifyRelay`, requestOptions);
        let data = await res.json();
        console.log(data);
        return data;
        
    } catch (err) {
        console.log(err)
    }
}

function addAlbumInfoToModal(album) {
    let img = document.querySelector('.project-image');
    let type = document.querySelector('.details span');
    let title = document.querySelector('.details_title');
    let artists = document.querySelector('.details_name');

    if (album.image?.[1]) img.src = album.image[1].url;
    else img.src = "blank-profile-picture.webp";
    type.innerText = album.type.toUpperCase();
    
    if (album.name.length > 40) {
        if (window.innerWidth < 500) title.style.fontSize = '1.3rem'
        else title.style.fontSize = '2rem'
    }
    else if (album.name.length > 75) title.style.fontSize = '1rem'
    
    title.innerHTML = `<a href="${album.externalLink}" target="_blank">${album.name}</a>`
    artists.innerHTML = `${album.artists.map(obj => obj.name).join(', ')} &#8226; <span class="details_year">${album.year}</span> &#8226; <span class="details_amount">${album.totalTracks} Songs</span>`
}

function addTracksToModal(tracks) {
    let tracklist = document.querySelector('.tracklist');
    for (let track of tracks) {
        
        let newTrack = document.createElement('div');
        newTrack.classList.add('track');
        //calculate track length in h:m:ss format
        let h = parseInt(track.duration_ms / 3600000) 
        let m = parseInt((track.duration_ms - (h * 3600000)) / 60000);
        let s = (parseInt((track.duration_ms - (h * 3600000) - (m * 60000)) / 1000) + "").padStart(2, '0');
        h = h > 1 ? h + ":" : "";
        m = m > 1 ? m + ":" : "0:";
        newTrack.innerHTML = `<span class="track_num">${track.track_number}</span>
                            <div class="track_details">
                            <h5 class="track-name">${track.name}</h5>
                                <span class="track-artist">${track.artists.map(obj => obj.name).join(', ')}</span>
                            </div>
                            <span class="track-time">${h}${m}${s}</span>`
        let trackLink = document.createElement('a');
        trackLink.href = track.external_urls.spotify;
        trackLink.target = "_blank";
        trackLink.appendChild(newTrack);
        tracklist.appendChild(trackLink);
    }
}

//close modal window
document.querySelector('.x-button').addEventListener('click', () => {
    //hide modal
    document.querySelector('#modal-screen').classList.add('hidden')

    //clear tracks
    document.querySelector('.tracklist').innerHTML = ""
})