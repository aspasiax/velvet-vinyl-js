/* DOM Elements */

const songForm = document.getElementById("song-form");
const playlistContainer = document.getElementById("playlist-container");
const searchInput = document.getElementById("search-input");

const totalSongsElement = document.getElementById("total-songs");
const favoriteSongsElement = document.getElementById("favorite-songs");
const popularGenreElement = document.getElementById("popular-genre");

const genreFilter = document.getElementById("genre-filter");
const sortFilter = document.getElementById("sort-filter");
const favoriteFilter = document.getElementById("favorite-filter");
const clearPlaylistButton = document.getElementById("clear-playlist-btn");
const cancelEditButton = document.getElementById("cancel-edit-btn");
const formError = document.getElementById("form-error");

const titleInput = document.getElementById("title");
const artistInput = document.getElementById("artist");
const genreInput = document.getElementById("genre");
const submitButton = songForm.querySelector("button");

const confirmationModal = document.getElementById("confirmation-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalCancelButton = document.getElementById("modal-cancel-btn");
const modalConfirmButton = document.getElementById("modal-confirm-btn");

const toast = document.getElementById("toast");

/* Application State */

let songs = [];

let editingSongId = null;
let songIdToDelete = null;
let pendingAction = null;

loadSongs();


/* Statistics */

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


/* Render Songs */

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

                <button class="edit-btn">
                    Edit
                </button>

                <button class="delete-btn">
                    Delete
                </button>

            </div>
        `;

        const favoriteButton = songCard.querySelector(".favorite-btn");
        const deleteButton = songCard.querySelector(".delete-btn");
        const editButton = songCard.querySelector(".edit-btn");

        favoriteButton.addEventListener("click", function () {
            toggleFavorite(song.id);
        });

        deleteButton.addEventListener("click", function () {
            openDeleteModal(song.id);
        });

        editButton.addEventListener("click", function () {
            startEditSong(song.id);
        });

        playlistContainer.appendChild(songCard);
    });

    updateStats();
}


/* Song Actions */

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
    filterSongs();

    showToast("✅ Song added successfully!");
}

function deleteSong(id) {
    songs = songs.filter(function (song) {
        return song.id !== id;
    });

    saveSongs();
    filterSongs();

    showToast("🗑️ Song deleted successfully!");
}

function toggleFavorite(id) {
    let isFavorite = false;

    songs = songs.map(function (song) {
        if (song.id === id) {
            const updatedSong = {
                ...song,
                favorite: !song.favorite
            };

            isFavorite = updatedSong.favorite;

            return updatedSong;
        }

        return song;
    });

    saveSongs();
    filterSongs();

    if (isFavorite) {
        showToast("❤️ Added to favorites!");
    } else {
        showToast("🤍 Removed from favorites!");
    }
}

function clearPlaylist() {
    if (songs.length === 0) {
        return;
    }

    pendingAction = "clear";

    modalTitle.textContent = "Clear Playlist";
    modalMessage.textContent = "Are you sure you want to delete all songs from your playlist?";
    modalConfirmButton.textContent = "Clear";

    confirmationModal.classList.remove("hidden");
}

function startEditSong(id) {
    const songToEdit = songs.find(function (song) {
        return song.id === id;
    });

    if (!songToEdit) {
        return;
    }

    titleInput.value = songToEdit.title;
    artistInput.value = songToEdit.artist;
    genreInput.value = songToEdit.genre;

    editingSongId = id;
    submitButton.textContent = "Update Song";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    cancelEditButton.hidden = false;
}

function updateSong(id, title, artist, genre) {
    songs = songs.map(function (song) {
        if (song.id === id) {
            return {
                ...song,
                title: title,
                artist: artist,
                genre: genre
            };
        }

        return song;
    });

    editingSongId = null;
    submitButton.textContent = "Add Song";
    cancelEditButton.hidden = true;

    saveSongs();
    filterSongs();

    showToast("✏️ Song updated successfully!");
}

function cancelEdit() {
    editingSongId = null;

    songForm.reset();

    submitButton.textContent = "Add Song";

    cancelEditButton.hidden = true;

    formError.textContent = "";
}

function openDeleteModal(id) {
    const songToDelete = songs.find(function (song) {
        return song.id === id;
    });

    if (!songToDelete) {
        return;
    }

    songIdToDelete = id;

    modalTitle.textContent = "Delete Song";
    modalMessage.textContent = `Are you sure you want to delete "${songToDelete.title}"?`;
    modalConfirmButton.textContent = "Delete";

    pendingAction = "delete";
    confirmationModal.classList.remove("hidden");
}

function closeModal() {
    songIdToDelete = null;
    pendingAction = null;
    confirmationModal.classList.add("hidden");
}

function validateForm(title, artist, genre) {
    if (!title || !artist || !genre) {
        formError.textContent = "Please fill in all fields.";
        return false;
    }

    formError.textContent = "";
    return true;
}

/* Local Storage */

function saveSongs() {
    localStorage.setItem("songs", JSON.stringify(songs));
}

function loadSongs() {
    const storedSongs = localStorage.getItem("songs");

    if (storedSongs) {
        songs = JSON.parse(storedSongs);
    }

    renderSongs(songs);
}


/* Filtering and Sorting */

function filterSongs() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;

    let filteredSongs = songs.filter(function (song) {
        const matchesSearch =
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm);

        const matchesGenre =
            selectedGenre === "All" ||
            song.genre === selectedGenre;

        const matchesFavorite =
            favoriteFilter.value === "all" ||
            song.favorite;

        return matchesSearch && matchesGenre && matchesFavorite;
    });

    filteredSongs.sort(function (a, b) {
        if (sortFilter.value === "az") {
            return a.title.localeCompare(b.title);
        }

        return b.title.localeCompare(a.title);
    });

    renderSongs(filteredSongs);
}

function showToast(message) {

    toast.textContent = message;

    toast.classList.remove("hidden");

    setTimeout(function () {
        toast.classList.add("hidden");
    }, 2000);
}

/* Event Listeners */

songForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value;
    const artist = artistInput.value;
    const genre = genreInput.value;

    if (!validateForm(title, artist, genre)) {
    return;
}

    if (editingSongId) {
        updateSong(editingSongId, title, artist, genre);
    } else {
        addSong(title, artist, genre);
    }

    songForm.reset();
});

searchInput.addEventListener("input", filterSongs);
genreFilter.addEventListener("change", filterSongs);
sortFilter.addEventListener("change", filterSongs);
favoriteFilter.addEventListener("change", filterSongs);
clearPlaylistButton.addEventListener("click", clearPlaylist);
cancelEditButton.addEventListener("click", cancelEdit);
modalCancelButton.addEventListener("click", closeModal);

modalConfirmButton.addEventListener("click", function () {

    if (pendingAction === "delete" && songIdToDelete) {
        deleteSong(songIdToDelete);
    }

    if (pendingAction === "clear") {
        songs = [];
        saveSongs();
        filterSongs();

        showToast("🎵 Playlist cleared!");
    }

    closeModal();
});