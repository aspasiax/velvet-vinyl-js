const songForm = document.getElementById("song-form");
const playlistContainer = document.getElementById("playlist-container");

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
    `;

    playlistContainer.appendChild(songCard);

    songForm.reset();
});