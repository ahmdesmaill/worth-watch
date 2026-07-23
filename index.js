/* The free tier has a limit of 1,000 requests anyway,
so it shouldn't be that big of a deal to share this API key publicly. */
const commonUrl = `https://www.omdbapi.com?apikey=c174379d&type=movie`;
const searchInput = document.getElementById("search-input");
const emptyPlaceholderContainer = document.getElementById(
  "empty-placeholder-container",
);
const stripIcon = document.getElementById("strip-icon");
const emptyPlaceholderTitle = document.getElementById(
  "empty-placeholder-title",
);
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
        stripIcon.style.display = "None";
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

      htmlString += `
      <li>
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
                  <button class="movie-add-button" data-movie-id="${movieData.imdbID}" type="button">
                      <img
                          class="add-icon"
                          alt=""
                          src="./icons/add.png"
                      />
                      <span>Watchlist</span>
                  </button>
              </div>
              <p class="movie-plot">
                  ${movieData.Plot}
              </p>
          </div>
      </li>
      `;
    }

    stripIcon.style.display = "None";
    emptyPlaceholderTitle.style.display = "None";
    moviesUl.innerHTML = htmlString;
  } catch (error) {
    lastSearchQuery = "";
    moviesUl.innerHTML = "";
    stripIcon.style.display = "None";
    emptyPlaceholderTitle.style.display = "Block";
    console.error(error.message);
    emptyPlaceholderTitle.innerHTML =
      "Something went wrong.<br />Please try again later.";
  }
}

function addMovieToWatchlist(e) {
  console.log(e.target.dataset["movieId"]);
}

document.body.addEventListener("click", (e) => {
  if (e.target.id === "search-button") {
    handleSearchButtonClick(e);
  } else if (e.target.dataset["movieId"]) {
    addMovieToWatchlist(e);
  }
});
