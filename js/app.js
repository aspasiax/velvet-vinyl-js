const songForm = document.getElementById("song-form");
const playlistContainer = document.getElementById("playlist-container");
const searchInput = document.getElementById("search-input");

songForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const artist = document.getElementById("artist").value;
    const genre = document.getElementById("genre").value;

    const songCard = document.createElement("div");
    songCard.classList.add("song-card");

    songCard.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Artist:</strong> ${artist}</p>
        <p><strong>Genre:</strong> ${genre}</p>

        <div class="card-actions">
            <button class="favorite-btn">🤍 Favorite</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;

    const favoriteButton = songCard.querySelector(".favorite-btn");

    favoriteButton.addEventListener("click", function () {
        songCard.classList.toggle("favorite");

        if (songCard.classList.contains("favorite")) {
            favoriteButton.textContent = "❤️ Favorite";
        } else {
            favoriteButton.textContent = "🤍 Favorite";
        }
    });

    const deleteButton = songCard.querySelector(".delete-btn");

    deleteButton.addEventListener("click", function () {
        songCard.remove();
    });

    playlistContainer.appendChild(songCard);

    songForm.reset();
});

searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    const songCards = document.querySelectorAll(".song-card");

    songCards.forEach(function (card) {
        const songText = card.textContent.toLowerCase();

        if (songText.includes(searchTerm)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});