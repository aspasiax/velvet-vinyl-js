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
const submitButton = songForm.querySelector('button[type="submit"]');

const confirmationModal = document.getElementById("confirmation-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalCancelButton = document.getElementById("modal-cancel-btn");
const modalConfirmButton = document.getElementById("modal-confirm-btn");

const toast = document.getElementById("toast");
const songCounter = document.getElementById("song-counter");
const genreButtons = document.querySelectorAll(".genre-option");

/* Application State */

let songs = [];
let editingSongId = null;
let songIdToDelete = null;
let pendingAction = null;
let toastTimeoutId = null;

loadSongs();


/* Statistics */

function updateStats() {
    totalSongsElement.textContent = songs.length;

    if (songs.length === 0) {

        songCounter.innerHTML = `
            <i class="fa-solid fa-music"></i>
            Your playlist is empty.
        `;

    } else if (songs.length === 1) {

        songCounter.innerHTML = `
            <i class="fa-solid fa-record-vinyl"></i>
            1 song in your collection.
        `;

    } else if (songs.length < 10) {

        songCounter.innerHTML = `
            <i class="fa-solid fa-record-vinyl"></i>
            ${songs.length} songs in your collection.
        `;

    } else {

        songCounter.innerHTML = `
            <i class="fa-solid fa-compact-disc"></i>
            ${songs.length} songs in your collection.
        `;

    }

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

    for (const genre in genreCounts) {
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
                <h3>
                    <i class="fa-solid fa-music"></i>
                    No songs found
                </h3>

                <p>
                    Add a new song or change the active filters.
                </p>
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
                <h3>
                    ${escapeHtml(song.title)}

                    ${
                        song.isNew
                            ? `<span class="recent-badge">
                                    Recently Added
                            </span>`
                            : ""
                    }
                </h3>

                <p class="artist-name">
                    <i class="fa-solid fa-microphone-lines"></i>
                    ${escapeHtml(song.artist)}
                </p>

                <span class="genre-badge">
                    ${escapeHtml(song.genre)}
                </span>
            </div>

            <div class="card-actions">
                <button
                    type="button"
                    class="favorite-btn"
                    aria-label="Toggle favorite status"
                >
                    ${
                        song.favorite
                            ? '<i class="fa-solid fa-heart"></i> Favorite'
                            : '<i class="fa-regular fa-heart"></i> Favorite'
                    }
                </button>

                <button
                    type="button"
                    class="edit-btn"
                    aria-label="Edit song"
                >
                    <i class="fa-solid fa-pen"></i>
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-btn"
                    aria-label="Delete song"
                >
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>
            </div>
        `;

        const favoriteButton = songCard.querySelector(".favorite-btn");
        const editButton = songCard.querySelector(".edit-btn");
        const deleteButton = songCard.querySelector(".delete-btn");

        favoriteButton.addEventListener("click", function () {
            toggleFavorite(song.id);
        });

        editButton.addEventListener("click", function () {
            startEditSong(song.id);
        });

        deleteButton.addEventListener("click", function () {
            openDeleteModal(song.id);
        });

        playlistContainer.appendChild(songCard);
    });

    updateStats();
}

/* Genre Selection */

function selectGenre(genre) {
    genreInput.value = genre;

    genreButtons.forEach(function (button) {
        const isSelected = button.dataset.genre === genre;

        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
}

function clearGenreSelection() {
    genreInput.value = "";

    genreButtons.forEach(function (button) {
        button.classList.remove("selected");
        button.setAttribute("aria-pressed", "false");
    });
}


/* Song Actions */

function addSong(title, artist, genre) {

    songs.forEach(function (song) {
        song.isNew = false;
    });

    const newSong = {
        id: Date.now(),
        title: title,
        artist: artist,
        genre: genre,
        favorite: false,
        isNew: true
    };

    songs.push(newSong);

    saveSongs();
    filterSongs();

    showToast(`
        <i class="fa-solid fa-circle-check"></i>
        Song added successfully!
    `);
}

function deleteSong(id) {
    songs = songs.filter(function (song) {
        return song.id !== id;
    });

    if (editingSongId === id) {
        cancelEdit();
    }

    saveSongs();
    filterSongs();

    showToast(`
        <i class="fa-solid fa-trash"></i>
        Song deleted successfully!
    `);
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
        showToast(`
            <i class="fa-solid fa-heart"></i>
            Added to favorites!
        `);
    } else {
        showToast(`
            <i class="fa-regular fa-heart"></i>
            Removed from favorites!
        `);
    }
}

function clearPlaylist() {
    if (songs.length === 0) {
        return;
    }

    pendingAction = "clear";

    modalTitle.innerHTML = `
        <i class="fa-solid fa-trash-can"></i>
        Clear Playlist
    `;

    modalMessage.textContent =
        "Are you sure you want to delete all songs from your playlist?";

    modalConfirmButton.innerHTML = `
        <i class="fa-solid fa-trash-can"></i>
        Clear
    `;

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
    selectGenre(songToEdit.genre);

    editingSongId = id;

    submitButton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Update Song
    `;

    cancelEditButton.hidden = false;
    formError.textContent = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    titleInput.focus();
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

    resetEditMode();

    saveSongs();
    filterSongs();

    showToast(`
        <i class="fa-solid fa-pen-to-square"></i>
        Song updated successfully!
    `);
}

function cancelEdit() {
    resetEditMode();
    songForm.reset();
    clearGenreSelection();
    formError.textContent = "";
}

function resetEditMode() {
    editingSongId = null;

    submitButton.innerHTML = `
        <i class="fa-solid fa-plus"></i>
        Add Song
    `;

    cancelEditButton.hidden = true;
}

function openDeleteModal(id) {
    const songToDelete = songs.find(function (song) {
        return song.id === id;
    });

    if (!songToDelete) {
        return;
    }

    songIdToDelete = id;
    pendingAction = "delete";

    modalTitle.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Delete Song
    `;

    modalMessage.textContent =
        `Are you sure you want to delete "${songToDelete.title}"?`;

    modalConfirmButton.innerHTML = `
        <i class="fa-solid fa-trash"></i>
        Delete
    `;

    confirmationModal.classList.remove("hidden");
}

function closeModal() {
    songIdToDelete = null;
    pendingAction = null;

    confirmationModal.classList.add("hidden");
}


/* Form Validation */

function validateForm(title, artist, genre) {
    if (!title || !artist || !genre) {
        formError.textContent = "Please fill in all fields.";
        return false;
    }

    formError.textContent = "";
    return true;
}

function songAlreadyExists(title, artist, ignoredSongId = null) {
    const normalizedTitle = title.trim().toLowerCase();
    const normalizedArtist = artist.trim().toLowerCase();

    return songs.some(function (song) {
        const isSameSong =
            song.title.trim().toLowerCase() === normalizedTitle &&
            song.artist.trim().toLowerCase() === normalizedArtist;

        const isDifferentSong =
            ignoredSongId === null || song.id !== ignoredSongId;

        return isSameSong && isDifferentSong;
    });
}

/* Local Storage */

function saveSongs() {
    localStorage.setItem("songs", JSON.stringify(songs));
}

function loadSongs() {
    const storedSongs = localStorage.getItem("songs");

    if (storedSongs) {
        try {
            songs = JSON.parse(storedSongs);
        } catch (error) {
            console.error("Unable to load songs from local storage:", error);
            songs = [];
        }
    }

    renderSongs(songs);
}


/* Filtering and Sorting */

function filterSongs() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedGenre = genreFilter.value;

    const filteredSongs = songs.filter(function (song) {
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


/* Toast Notifications */

function showToast(message) {
    if (toastTimeoutId !== null) {
        clearTimeout(toastTimeoutId);
    }

    toast.innerHTML = message;
    toast.classList.remove("hidden");

    toastTimeoutId = setTimeout(function () {
        toast.classList.add("hidden");
        toastTimeoutId = null;
    }, 2000);
}


/* Utilities */

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* Event Listeners */

genreButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", function () {
        const selectedGenre = button.dataset.genre;

        selectGenre(selectedGenre);

        /*
         * Μεταφέρει το focus στο submit button.
         * Έτσι, μετά την επιλογή genre, το σκέτο Enter
         * κάνει Add ή Update Song.
         */
        submitButton.focus();
    });
});

songForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const artist = artistInput.value.trim();
    const genre = genreInput.value;

    if (!validateForm(title, artist, genre)) {
        return;
    }

    if (songAlreadyExists(title, artist, editingSongId)) {
        formError.textContent =
            "This song already exists in your playlist.";

        return;
    }

    if (editingSongId !== null) {
        updateSong(editingSongId, title, artist, genre);
    } else {
        addSong(title, artist, genre);
    }

    songForm.reset();
    clearGenreSelection();
});

searchInput.addEventListener("input", filterSongs);
genreFilter.addEventListener("change", filterSongs);
sortFilter.addEventListener("change", filterSongs);
favoriteFilter.addEventListener("change", filterSongs);

clearPlaylistButton.addEventListener("click", clearPlaylist);
cancelEditButton.addEventListener("click", cancelEdit);
modalCancelButton.addEventListener("click", closeModal);

modalConfirmButton.addEventListener("click", function () {
    if (pendingAction === "delete" && songIdToDelete !== null) {
        deleteSong(songIdToDelete);
    }

    if (pendingAction === "clear") {
        songs = [];

        cancelEdit();
        saveSongs();
        filterSongs();

        showToast(`
            <i class="fa-solid fa-trash-can"></i>
            Playlist cleared successfully!
        `);
    }

    closeModal();
});

/* Keyboard Shortcuts */

document.addEventListener("keydown", function (event) {
    const activeElement = document.activeElement;

    const isTyping =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT";

    if (event.key === "Escape") {
        if (!confirmationModal.classList.contains("hidden")) {
            closeModal();
            return;
        }

        if (editingSongId !== null) {
            cancelEdit();
        }

        return;
    }

    if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInput.focus();
        return;
    }
});