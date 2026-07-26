/* The free tier has a limit of 1,000 requests anyway,
so it shouldn't be that big of a deal to share this API key publicly. */
const commonUrl = `https://www.omdbapi.com?apikey=c174379d&type=movie`;
const searchInput = document.getElementById("search-input");
const stripIcon = document.getElementById("strip-icon");
const emptyPlaceholderTitle = document.getElementById(
  "empty-placeholder-title",
);
const spinnerEl = document.getElementById("spinner-bg");
const moviesUl = document.getElementById("movies-ul");
let lastSearchQuery = "";
let currentTargetPage = 1;
let searchResultsCount = 0;

async function handleSearchButtonClick(e) {
  const query = searchInput.value;
  if (!query || query === lastSearchQuery) return;
  lastSearchQuery = query;
  currentTargetPage = 1;
  searchResultsCount = 0;
  spinnerEl.style.display = "block";

  try {
    const queryParameter = new URLSearchParams({ s: query });
    let response = await fetch(
      `${commonUrl}&page=${currentTargetPage}&${queryParameter}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.Response !== "True") {
      if (data.Error === "Movie not found!") {
        lastSearchQuery = "";
        spinnerEl.style.display = "none";
        stripIcon.style.display = "none";
        emptyPlaceholderTitle.style.display = "Block";
        moviesUl.innerHTML = "";
        emptyPlaceholderTitle.innerHTML =
          "Unable to find what you’re looking for.<br />Please try another search.";
        return;
      } else {
        throw new Error(data.Error);
      }
    }

    searchResultsCount = data.totalResults;
    let htmlString = "";
    for (const movie of data.Search) {
      const movieResponse = await fetch(`${commonUrl}&i=${movie.imdbID}`);
      if (!movieResponse.ok) {
        throw new Error(`HTTP ${movieResponse.status}`);
      }

      const movieData = await movieResponse.json();
      if (movieData.Response !== "True") {
        throw new Error(movieData.Error);
      }

      const isMovieAdded = localStorage.getItem(`movie_${movieData.imdbID}`);
      const addedClass = isMovieAdded ? " movie-added-button" : "";
      const buttonSpanContent = isMovieAdded ? "Added ✅" : "Watchlist";
      htmlString += `
      <li id="${movieData.imdbID}">
          <img
              class="movie-poster"
              alt=""
              src="${movieData.Poster}"
          />
          <div class="movie-info-container">
              <div class="movie-header-info-container">
                  <span class="movie-title">${movieData.Title}</span>
                  <span class="movie-rating">⭐️ ${movieData.imdbRating}</span>
              </div>
              <div class="movie-midinfo-container">
                  <span class="movie-duration">${movieData.Runtime}</span>
                  <span class="movie-genre"
                      >${movieData.Genre}</span
                  >
                  <button class="movie-add-or-remove-button${addedClass}" data-movie-id="${movieData.imdbID}" type="button">
                      <img
                          class="add-or-remove-icon"
                          alt=""
                          src="./icons/add.png"
                      />
                      <span>${buttonSpanContent}</span>
                  </button>
              </div>
              <p class="movie-plot">
                  ${movieData.Plot}
              </p>
          </div>
      </li>
      `;
    }

    spinnerEl.style.display = "none";
    stripIcon.style.display = "none";
    emptyPlaceholderTitle.style.display = "none";
    moviesUl.innerHTML = htmlString;
  } catch (error) {
    lastSearchQuery = "";
    moviesUl.innerHTML = "";
    spinnerEl.style.display = "none";
    stripIcon.style.display = "none";
    emptyPlaceholderTitle.style.display = "Block";
    console.error(error.message);
    emptyPlaceholderTitle.innerHTML =
      "Something went wrong.<br />Please try again later.";
  }
}

function addMovieToWatchlist(e) {
  const movieId = e.target.dataset["movieId"];
  if (localStorage.getItem(`movie_${movieId}`)) return;
  const movieElement = document.getElementById(movieId);
  let movieHTML = movieElement.outerHTML;
  const button = movieElement.querySelector(".movie-add-or-remove-button");
  const buttonSpan = button.querySelector("span");
  movieHTML = movieHTML
    .replace(`icons/add.png`, `icons/remove.png`)
    .replace(`<span>${buttonSpan.textContent}`, `<span>Remove`);
  localStorage.setItem(`movie_${movieId}`, movieHTML);
  button.classList.add("movie-added-button");
  buttonSpan.textContent = "Added ✅";
}

moviesUl.addEventListener(
  "error",
  (e) => {
    if (e.target.classList.contains("movie-poster")) {
      e.target.setAttribute("src", "./icons/fallback-poster.png");
    }
  },
  true,
);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleSearchButtonClick(e);
  }
});

document.body.addEventListener("click", (e) => {
  if (e.target.id === "search-button") {
    handleSearchButtonClick(e);
  } else if (e.target.dataset["movieId"]) {
    addMovieToWatchlist(e);
  }
});
