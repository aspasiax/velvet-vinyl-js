const songForm = document.getElementById("song-form");
const playlistContainer = document.getElementById("playlist-container");
const searchInput = document.getElementById("search-input");

let songs = [];
loadSongs();

function renderSongs(songList) {
    playlistContainer.innerHTML = "";

    songList.forEach(function (song) {
        const songCard = document.createElement("div");
        songCard.classList.add("song-card");

        if (song.favorite) {
            songCard.classList.add("favorite");
        }

        songCard.innerHTML = `
            <h3>${song.title}</h3>
            <p><strong>Artist:</strong> ${song.artist}</p>
            <p><strong>Genre:</strong> ${song.genre}</p>

            <div class="card-actions">
                <button class="favorite-btn">
                    ${song.favorite ? "❤️ Favorite" : "🤍 Favorite"}
                </button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        const favoriteButton = songCard.querySelector(".favorite-btn");

        favoriteButton.addEventListener("click", function () {
            toggleFavorite(song.id);
        });

        const deleteButton = songCard.querySelector(".delete-btn");

        deleteButton.addEventListener("click", function () {
            deleteSong(song.id);
        });

        playlistContainer.appendChild(songCard);
    });
}

function addSong(title, artist, genre) {
    const newSong = {
        id: Date.now(),
        title: title,
        artist: artist,
        genre: genre,
        favorite: false
    };

    songs.push(newSong);

    saveSongs();
    renderSongs(songs);
}

function deleteSong(id) {
    songs = songs.filter(function (song) {
        return song.id !== id;
    });

    saveSongs();
    renderSongs(songs);
}

function toggleFavorite(id) {
    songs = songs.map(function (song) {
        if (song.id === id) {
            return {
                ...song,
                favorite: !song.favorite
            };
        }

        return song;
    });

    saveSongs();
    renderSongs(songs);
}

function saveSongs() {
    localStorage.setItem("songs", JSON.stringify(songs));
}

function loadSongs() {
    const storedSongs = localStorage.getItem("songs");

    if (storedSongs) {
        songs = JSON.parse(storedSongs);
        renderSongs(songs);
    }
}

songForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const artist = document.getElementById("artist").value;
    const genre = document.getElementById("genre").value;

    addSong(title, artist, genre);

    songForm.reset();
});

searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredSongs = songs.filter(function (song) {
        return (
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm)
        );
    });

    renderSongs(filteredSongs);
});