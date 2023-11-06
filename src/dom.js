const publicKey = 'e15a022ebba96ab238d8a6e596b78d1e';
const privateKey = '90e3c49f512379d224631817e8b6f749a4e27766';

const timestamp = new Date().getTime();
const hashValue = md5(timestamp + privateKey + publicKey);

const comicsLinkTabs = document.querySelector('a[href="#comics_tabs"]');
const eventsLinkTabs = document.querySelector('a[href="#events_tabs"]');
let input = document.getElementById("input-box");
let button = document.getElementById("submit-button");
let showContainer = document.getElementById("show-container");
let autocomleteContainer = document.querySelector(".autocomplete");

async function fetchData(queryType, queryValue) {
    let url;
    if (queryType === 'autocomplete') {
        url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${publicKey}&hash=${hashValue}&nameStartsWith=${queryValue}`;
    } else if (queryType === 'character') {
        url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${publicKey}&hash=${hashValue}&name=${queryValue}`;
    }
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error! Status: ${res.status}`);
        }
        const data = await res.json();
        return data.data.results;

    } catch (error) {
        console.error('There was a problem with fetch data:', error.message);
    }
}

function displayWords(value) {
    input.value = value;
    removeElements();
}

function removeElements() {
    autocomleteContainer.innerHTML = "";
}

input.addEventListener("keyup", async () => {
    removeElements();
    
    if (input.value.length < 4) {
        return false;
    }

    const characters = await fetchData('autocomplete', input.value);
    characters.forEach((result) => {
        let name = result.name;
        let div = document.createElement("div");
        div.style.cursor = "pointer";
        div.classList.add("autocomplete-items");
        div.onclick = function() {
            displayWords(name);
        };
        let word = "<b>" + name.substr(0, input.value.length) + "</b>";
        word += name.substr(input.value.length);
        div.innerHTML = `<p class="item">${word}</p>`;
        autocomleteContainer.appendChild(div);
    });
});

function displayCharacter(characters) {
    let htmlString = "";
   
    characters.forEach(character => {
        htmlString += `
        <div class="card-container">
            <div class="container-character-image">  
                <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
            </div>
            <div class="container-character-description">
                <div class="character-name">${character.name}</div>
                <div class="character-description">${character.description}</div>
            </div>
        </div>
        <div class="tabs">
        <ul class="tabs-wrapper">
            <li class="tabs__li active">
                <a class="tabs__link" data-character-id="${character.id}" data-content-type="overview">Overview</a>
            </li>
            <li class="tabs__li">
                <a class="tabs__link" data-character-id="${character.id}" data-content-type="comics">Comics</a>
            </li>
            <li class="tabs__li">
                <a class="tabs__link" data-character-id="${character.id}" data-content-type="movies">Series</a>
            </li>
            <li class="tabs__li">
                <a class="tabs__link" data-character-id="${character.id}" data-content-type="events">Events</a>
            </li>
        </ul>
    </div>
        `;
    });

    showContainer.innerHTML = htmlString;
    attachEventListenersToLinks();
}

function attachEventListenersToLinks() {
    document.querySelectorAll('.tabs__link').forEach(link => {
        link.addEventListener('click', function() {
            console.log('click'); 
            const characterId = this.getAttribute('data-character-id');
            const contentType = this.getAttribute('data-content-type');
            showTabsContent(characterId, contentType);
        });
    });
}

async function handleButtonClick(searchQuery) {
    const data = await fetchData('character', searchQuery);
    // Fetch the specific character based on the provided name or default to 'Iron Man'
    //const data = await fetchData('character', characterName, input.value); 

    // Fetch the specific character based on input value
    //const data = await fetchData('character', input.value); 

    showContainer.innerHTML = '';
    showTabsContent.innerHTML = '';
    displayCharacter(data);
    removeElements(); 
}

button.addEventListener('click', () => {
    handleButtonClick(input.value)
} )

async function fetchContentByCharacterId(characterId, contentType) {
    let endpoint = '';
    const limit = 6;
    switch (contentType) {
      case 'comics':
        endpoint = `https://gateway.marvel.com:443/v1/public/characters/${characterId}/comics`;
            break;
        case 'movies':
            endpoint = `https://gateway.marvel.com:443/v1/public/characters/${characterId}/series`;
            break;
        
            case 'events':
                endpoint = `https://gateway.marvel.com:443/v1/public/characters/${characterId}/events`;
                break;
      default:
        console.error('Unknown content type:', contentType);
        return;
    }
  
    const url = `${endpoint}?ts=${timestamp}&apikey=${publicKey}&hash=${hashValue}&limit=${limit}`;
 
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error! Status: ${res.status}`);
      }
        const data = await res.json();
      return data.data.results;
    } catch (error) {
      console.error('There was a problem with fetch data:', error.message);
    }
}

  async function showTabsContent(characterId, contentType) {
    const contentData = await fetchContentByCharacterId(characterId, contentType);
    if (!contentData) {
      console.error('No content data found for the given character ID and content type.');
      return;
    }
  
    let htmlString = '';
    contentData.forEach(item => {
      htmlString += `
        <div class="content-item">  
          <img class="comic-image" src="${item.thumbnail.path}.${item.thumbnail.extension}" alt="${item.title}"> 
          <h3 class="comic-title">${item.title}</h3>
        </div>
      `;
    });
  
    
    const showTabsContent = document.getElementById('comics-container')
      showTabsContent.innerHTML = htmlString;
      console.log(showTabsContent)
  }

  window.onload = () => {
    handleButtonClick('Iron Man');
 };
    












  