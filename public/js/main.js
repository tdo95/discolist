
//searchbox open and close animation (for mobile)
let searchIcon = document.querySelector('.catalog .search_icon');
let searchBox = document.querySelector('.catalog .search');
let searchInput = document.querySelector('.catalog .search_input')
let title = document.querySelector('.title.small');
searchIcon.addEventListener('click', toggleSearchBox);
let toggled;
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
        console.log(data)
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
    console.log(artists)
    artistList = []; //global 
    if (artists)
        for (let person of artists) {
            artistList.push(new Artist(person.name, person.href, person.images[0], person.id, person.popularity))
        }
    console.log(artistList);
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
    console.log(dropdown, artistList.length)
    
    //clear previous results
    while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);

    //append artists to dropdown
    if (artistList.length) {
        
        //add new artist results
        artistList.forEach(artist => {
            
            let block = document.createElement('p')
            block.innerText = artist.name;
            block.classList.add('search_dropdown_entry');
            console.log(block)
            dropdown.appendChild(block)
        })
    }


        
}

