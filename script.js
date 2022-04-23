const selected = new Map();
const checkedImg = './images/checked.png';
const unCheckedImg = './images/unchecked.png';

const giphyKey = '3AVuBH8oum4c1hO25iQcaX6nMqBg2LzT';
const clientId = 'a508d17005ab481d8c775eaee02b2db8';
const clientSecret = '2bba391f557e471e97109bde645fc19d';

let resultKey;
function getResultMap() {
    resultKey = selected.get('two') == selected.get('three') ?
        selected.get('two') : selected.get('one');
    return RESULTS_MAP[resultKey];
}

function onRandomIdResponse() {
    return 
}

function getGif(titleKey) {
    // fetch("https://api.giphy.com/v1/randomid", {api_key: giphyKey});
    //   .then(onResponse).then(onRandomIdResponse);
    console.log(titleKey);
    let api_end_point = "https://api.giphy.com/v1/gifs/random";
    fetch(api_end_point + "?api_key=" + giphyKey + "&tag=" + titleKey + "&rating=g")
        .then(onResponse).then(onGiphyResponse);
}

let resultGif;
function onGiphyResponse(json) {
    const result = document.querySelector('#result');
    const gifBox = document.createElement('div');
    gifBox.setAttribute('id', 'gif-box');

    const gif = document.createElement('img');
    gif.setAttribute('id', 'gif');
    gif.src = json['data'].images["preview_webp"].url;

    gifBox.appendChild(gif);

    result.insertBefore(gifBox, document.querySelector('#restart-button'));
}

function onResponse(response) {
    if (!response.ok) {
        console.log('Risposta non valida');
        return null;
    }
    return response.json();
}

let accessToken;
function onTokenJson(json) {
    if (!json) {
        console.log('Nessun testo');
        return;
    }

    console.log(json);
    accessToken = json.access_token;
}

function getSpotifyToken() {
    fetch("https://accounts.spotify.com/api/token",
        {
            method: "post",
            body: 'grant_type=client_credentials',
            headers:
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            }
        }
    ).then(onResponse).then(onTokenJson);
}

function createPlaylistLayout(json) {

}
function onPlaylistJson(json) {
    const result = document.querySelector('#result');

    const box = document.createElement('div');
    box.setAttribute('id', 'playlist-view');
    result.appendChild(box);

    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = "Playlist consigliata";
    box.appendChild(sectionTitle);

    const infoBox = document.createElement('div');
    infoBox.setAttribute('id', 'playlist-info');
    box.appendChild(infoBox);

    const name = document.createElement('p');
    name.textContent = json['name'];
    infoBox.appendChild(name);

    const thumbBox = document.createElement('div');
    thumbBox.setAttribute('id', 'thumb-box');
    infoBox.appendChild(thumbBox);

    const playlistThumb = document.createElement('img');
    playlistThumb.setAttribute('id', 'playlist-thumb');
    playlistThumb.src = json['images'][0]['url']
    thumbBox.appendChild(playlistThumb);

    const linkBox = document.createElement('div');
    linkBox.setAttribute('id', 'link-box');
    box.appendChild(linkBox);

    const playlistLink = document.createElement('a');
    playlistLink.setAttribute('id', 'playlist-link');
    playlistLink.href = json['external_urls']['spotify'];
    playlistLink.textContent = 'Ascolta su Spotify'
    linkBox.appendChild(playlistLink);

    console.log(json);
}

function getPlaylist(id) {
    fetch("https://api.spotify.com/v1/playlists/" + id,
        {
            method: "get",
            headers:
            {
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(onResponse).then(onPlaylistJson);
}

function getResult() {
    resultMap = getResultMap();  

    const result = document.querySelector('#result');
    result.style.display = 'flex';

    const h1 = document.createElement('h1');
    h1.textContent = resultMap['title'];
    result.appendChild(h1)

    const p = document.createElement('p');
    p.textContent = resultMap['contents'];
    result.appendChild(p)

    const div = document.createElement('div');
    div.setAttribute('id', 'restart-button');
    const p1 = document.createElement('p');
    p1.textContent = "Ricomincia il test";
    div.appendChild(p1)
    result.appendChild(div);

    const restartButton = document.querySelector('#result div');
    restartButton.style.display = 'flex';
    restartButton.addEventListener('click', _ => {
        window.location.reload(true)
    });

    getGif(resultKey);
    getPlaylist('50L3W8NaVU3d4bKlCPi6I9');
}

function resetSelection(ans) {
    ans.classList.remove('selected');
    ans.classList.remove('unselected');
    ans.classList.add('emptySelection');
}

function unselect(ans) {
    ans.classList.remove('emptySelection');
    ans.classList.remove('selected');
    ans.classList.add('unselected');
}

function select(ans) {
    ans.classList.remove('emptySelection');
    ans.classList.remove('unselected');
    ans.classList.add('selected');
}

function onClick(event) {
    const clicked = event.currentTarget;
    const queryOldAns = 'div[data-question-id="' + clicked.dataset.questionId +
        '"][data-choice-id="' + selected.get(clicked.dataset.questionId) + '"]';
    const queryNewAns = 'div[data-question-id="' + clicked.dataset.questionId +
        '"][data-choice-id="' + clicked.dataset.choiceId + '"]';

    const entries = document.
        querySelectorAll('[data-question-id="' + clicked.dataset.questionId + '"]')

    // diseleziono la risposta selezionata
    if (selected.get(clicked.dataset.questionId) == clicked.dataset.choiceId) {
        for (let entry of entries) {
            resetSelection(entry);
        }

        const image = document.querySelector(queryNewAns + ' .checkbox');
        image.src = unCheckedImg;
        selected.delete(clicked.dataset.questionId);
        return;
    }

    const unClicked = document.querySelector(queryOldAns);

    // se esiste, deseleziona la vecchia risposta, altrimenti 
    // deseleziona tutto tranne la risposta corrente
    if (unClicked) {
        unselect(unClicked);
        document.querySelector(queryOldAns + ' .checkbox').src = unCheckedImg;
    } else {
        for (let entry of entries) {
            if (entry.dataset.choiceId != clicked.dataset.choiceId) {
                unselect(entry);
            }
        }
    }

    // seleziona l'elemento cliccato
    select(clicked);
    const image = document.querySelector(queryNewAns + ' .checkbox');
    image.src = checkedImg;
    selected.set(clicked.dataset.questionId, clicked.dataset.choiceId);

    // controlla se ho tre risposte
    if (selected.size >= 3) {
        for (const ans of anss) {
            ans.removeEventListener('click', onClick);
        }
        getResult();
    }
}

getSpotifyToken();
const anss = document.querySelectorAll('section div');
for (const ans of anss) {
    ans.addEventListener('click', onClick);
}
