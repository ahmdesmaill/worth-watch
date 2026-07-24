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

loadSavedMovies();
