const songForm = document.getElementById("song-form");
const playlistContainer = document.getElementById("playlist-container");
const searchInput = document.getElementById("search-input");
const totalSongsElement = document.getElementById("total-songs");
const favoriteSongsElement = document.getElementById("favorite-songs");
const popularGenreElement = document.getElementById("popular-genre");

let songs = [];
loadSongs();

function updateStats() {
    totalSongsElement.textContent = songs.length;

    const favoriteSongs = songs.filter(function (song) {
        return song.favorite;
    });

    favoriteSongsElement.textContent = favoriteSongs.length;

    if (songs.length === 0) {
        popularGenreElement.textContent = "-";
        return;
    }

    const genreCounts = {};

    songs.forEach(function (song) {
        genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
    });

    let topGenre = "";
    let maxCount = 0;

    for (let genre in genreCounts) {
        if (genreCounts[genre] > maxCount) {
            topGenre = genre;
            maxCount = genreCounts[genre];
        }
    }

    popularGenreElement.textContent = topGenre;
}

function renderSongs(songList) {
    playlistContainer.innerHTML = "";

    if (songList.length === 0) {
        playlistContainer.innerHTML = `
            <div class="empty-state">
                <h3>🎵 No songs in your playlist yet</h3>
                <p>Start building your collection by adding your first song.</p>
            </div>
        `;

        updateStats();
        return;
    }

    songList.forEach(function (song) {
        const songCard = document.createElement("div");
        songCard.classList.add("song-card");

        if (song.favorite) {
            songCard.classList.add("favorite");
        }

        songCard.innerHTML = `
            <div class="song-info">

                <h3>${song.title}</h3>

                <p class="artist-name">
                    🎤 ${song.artist}
                </p>

                <span class="genre-badge">
                    ${song.genre}
                </span>

            </div>

            <div class="card-actions">
                <button class="favorite-btn">
                    ${song.favorite ? "❤️ Favorite" : "🤍 Favorite"}
                </button>

                <button class="delete-btn">
                    Delete
                </button>
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

    updateStats();
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