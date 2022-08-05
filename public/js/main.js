
//searchbox open and close animation (for mobile)
let searchIcon = document.querySelector('.catalog .search_icon');
let searchBox = document.querySelector('.catalog .search');
let searchInput = document.querySelector('.catalog .search_input')
let title = document.querySelector('.title.small');
searchIcon.addEventListener('click', toggleSearchBox);
let toggled;
searchInput.addEventListener('focus', toggleSearchBox);
function toggleSearchBox() {

    if (window.innerWidth <= 730) {
        if (!toggled) {
            searchBox.classList.add('search_open');
            title.classList.add('hidden');
            searchInput.style.width = '180px'
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
    }, 350);
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
    //find which dropdown screen is active
    //TODO: Make this more effiecient (maybe use a varaible to signify which screen is open)
    let dropdown;
    let options = document.querySelectorAll('#home, #catalog');
    options.forEach(element => {
        let hidden = element.classList.contains('hidden');
        if (hidden) return;
        dropdown = document.querySelector(`#${element.id} .search_dropdown`);
        console.log(dropdown)
    });
    console.log(dropdown);
    
    //clear previous results
    while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

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
            let block = document.createElement('p');
            block.innerText = artist;
            block.classList.add('search_dropdown_entry');
            block.addEventListener('click', () => displayCatalog(artist));
            dropdown.appendChild(block);
        }
    }
        
}

//Display artist catalog
async function displayCatalog(artistName) {
    console.log(artistName)

    //fetch results

    closeWindow()
    
    await waitFor(1000);

    //input results in window
    openWindow()
    

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