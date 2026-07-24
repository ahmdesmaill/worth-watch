const emptyPlaceholderContainer = document.getElementById(
  "empty-placeholder-container",
);
const moviesUl = document.getElementById("movies-ul");

function loadSavedMovies() {
  let htmlString = "";
  for (const [key, movieHTML] of Object.entries(localStorage)) {
    if (key.startsWith("movie_")) {
      htmlString += movieHTML;
    }
  }
  if (htmlString) {
    emptyPlaceholderContainer.style.display = "none";
    moviesUl.innerHTML = htmlString;
  }
}

document.body.addEventListener("click", (e) => {
  const movieId = e.target.dataset["movieId"];
  if (movieId && localStorage.getItem(`movie_${movieId}`)) {
    localStorage.removeItem(`movie_${movieId}`);
    document.getElementById(movieId)?.remove();
    if (moviesUl.childElementCount === 0) {
      emptyPlaceholderContainer.style.display = "flex";
    }
  }
});

loadSavedMovies();
