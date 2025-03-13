// Constants
const POKEMON_API_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_PER_PAGE = 151;
const MAX_POKEMON_ID = 1008; // Limit to prevent loading non-existent Pokemon

// DOM Elements
const pokemonList = document.getElementById('pokemonList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchModal = document.getElementById('searchModal');
const searchResults = document.getElementById('searchResults');
const closeModal = document.getElementById('closeModal');

// State
let currentPage = 1;
let loading = false;
let hasMorePokemon = true;
let loadedPokemon = new Set(); // Track loaded Pokemon IDs
let favorites = new Set(); // Using Set instead of Map for simpler storage

const addToFavorites = pokemon => {
  let favorites = JSON.parse(localStorage.getItem('pokeArray')) || [];

  // Create an object with necessary Pokémon details
  const pokemonData = {
    id: pokemon.id,
    name: pokemon.name,
    image:
      pokemon.sprites.other['official-artwork'].front_default ||
      pokemon.sprites.front_default,
    type: pokemon.types.map(t => t.type.name).join(', '),
    hp: pokemon.stats[0].base_stat,
    attack: pokemon.stats[1].base_stat,
    defense: pokemon.stats[2].base_stat,
    speed: pokemon.stats[5].base_stat,
  };

  // Check if Pokémon is already in favorites
  const exists = favorites.some(fav => fav.id === pokemon.id);

  if (!exists) {
    favorites.push(pokemonData);
  } else {
    favorites = favorites.filter(fav => fav.id !== pokemon.id); // Remove if already favorited
  }

  // Save back to localStorage
  localStorage.setItem('pokeArray', JSON.stringify(favorites));
};

// Load favorites from localStorage on startup
try {
  const storedFavorites = JSON.parse(localStorage.getItem('pokeArray')) || [];
  favorites = new Set(storedFavorites.map(pokemon => pokemon.id)); // Store only the IDs in the Set
} catch (error) {
  console.error('Error loading favorites:', error);
}

// Functions
async function fetchPokemon(id) {
  try {
    const response = await fetch(`${POKEMON_API_BASE_URL}/pokemon/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return null;
  }
}

function createPokemonCard(pokemon) {
  // Skip if this Pokemon has already been loaded
  if (loadedPokemon.has(pokemon.id)) {
    return null;
  }
  loadedPokemon.add(pokemon.id);

  const card = document.createElement('div');
  card.className =
    'bg-white rounded-lg shadow-lg p-4 transform hover:scale-105 transition-transform';
  card.dataset.pokemonId = pokemon.id;

  // Create image
  const img = document.createElement('img');
  img.src =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default;
  img.alt = pokemon.name;
  img.className = 'w-full h-48 object-contain mb-4';
  card.appendChild(img);

  //create name + fav button container
  const nameFavcontainer = document.createElement('div');
  nameFavcontainer.className = 'flex w-full justify-between';
  card.appendChild(nameFavcontainer);

  // Create name
  const name = document.createElement('h3');
  name.className = 'text-xl font-bold capitalize mb-2';
  name.textContent = pokemon.name;
  nameFavcontainer.appendChild(name);

  // Create Fav button
  const favBtn = document.createElement('img');
  const favePokemonId = pokemon.id; // Taking the pokemon ID
  let favorites = JSON.parse(localStorage.getItem('pokeArray')) || [];

  // Check if the Pokémon is already in favorites
  let isFavorite = favorites.some(fav => fav.id === pokemon.id);

  // Define image sources
  const imgUnstored = 'assets/favheartunselected.png';
  const imgHoveredUnstored = 'assets/favhearthovered.png';
  const imgStored = 'assets/favheartselected.png';

  // Set initial image
  favBtn.src = isFavorite ? imgStored : imgUnstored;
  favBtn.alt = 'favorites button';
  favBtn.className = 'h-7 ml-4 cursor-pointer';

  // Hover Effect
  favBtn.addEventListener('mouseenter', () => {
    if (!isFavorite) favBtn.src = imgHoveredUnstored;
  });

  favBtn.addEventListener('mouseleave', () => {
    if (!isFavorite) favBtn.src = imgUnstored;
  });

  // Click Event - Toggle Favorites
  favBtn.addEventListener('click', () => {
    let favorites = JSON.parse(localStorage.getItem('pokeArray')) || [];

    if (isFavorite) {
      // Remove from favorites
      favorites = favorites.filter(pokemon => pokemon.id !== favePokemonId);
    } else {
      // Add to favorites (store full Pokémon object)
      favorites.push({
        id: pokemon.id,
        name: pokemon.name,
        image:
          pokemon.sprites.other['official-artwork'].front_default ||
          pokemon.sprites.front_default,
        type: pokemon.types.map(type => type.type.name).join(', '),
        hp: pokemon.stats[0].base_stat,
        attack: pokemon.stats[1].base_stat,
        defense: pokemon.stats[2].base_stat,
        speed: pokemon.stats[5].base_stat,
      });
    }

    // Update localStorage
    localStorage.setItem('pokeArray', JSON.stringify(favorites));

    // Update isFavorite state
    isFavorite = !isFavorite;

    // Update the button image immediately
    favBtn.src = isFavorite ? imgStored : imgUnstored;

    console.log(pokeArray);
  });

  nameFavcontainer.appendChild(favBtn);

  // Create type
  const typeP = document.createElement('p');
  typeP.className = 'text-gray-600 mb-2';
  typeP.textContent =
    'Type: ' + pokemon.types.map(type => type.type.name).join(', ');
  card.appendChild(typeP);

  // Create stats container
  const statsDiv = document.createElement('div');
  statsDiv.className = 'grid grid-cols-2 gap-2 text-sm mb-4';

  // Add stats
  const stats = [
    { label: 'HP', value: pokemon.stats[0].base_stat },
    { label: 'Attack', value: pokemon.stats[1].base_stat },
    { label: 'Defense', value: pokemon.stats[2].base_stat },
    { label: 'Speed', value: pokemon.stats[5].base_stat },
  ];

  stats.forEach(stat => {
    const statP = document.createElement('p');
    statP.textContent = `${stat.label}: ${stat.value}`;
    statsDiv.appendChild(statP);
  });
  card.appendChild(statsDiv);

  return card;
}

async function loadPokemonList(append = false) {
  console.log('Loading Pokemon list...');
  if (loading || !hasMorePokemon) return;
  loading = true;

  try {
    const startId = (currentPage - 1) * POKEMON_PER_PAGE + 1;
    console.log(`Fetching Pokemon from ID ${startId}`);

    // Check if we've reached the maximum Pokemon ID
    if (startId > MAX_POKEMON_ID) {
      hasMorePokemon = false;
      return;
    }

    if (!append) {
      pokemonList.innerHTML = '';
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'col-span-full text-center';
      loadingMsg.textContent = 'Loading...';
      pokemonList.appendChild(loadingMsg);
      loadedPokemon.clear(); // Reset loaded Pokemon tracking
    }

    const promises = [];
    const endId = Math.min(startId + POKEMON_PER_PAGE - 1, MAX_POKEMON_ID);

    for (let i = startId; i <= endId; i++) {
      promises.push(fetchPokemon(i));
    }

    const pokemons = await Promise.all(promises);
    console.log(`Fetched ${pokemons.length} Pokemon`);

    if (!append) {
      pokemonList.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();
    pokemons.forEach(pokemon => {
      if (pokemon) {
        const card = createPokemonCard(pokemon);
        if (card) {
          // Only append if it's a new Pokemon
          fragment.appendChild(card);
        }
      }
    });
    pokemonList.appendChild(fragment);

    // Check if we've reached the end
    if (endId >= MAX_POKEMON_ID) {
      hasMorePokemon = false;
      const endMessage = document.createElement('div');
      endMessage.className = 'col-span-full text-center text-gray-600 py-4';
      endMessage.textContent = "You've reached the end of the Pokedex!";
      pokemonList.appendChild(endMessage);
    }
  } catch (error) {
    console.error('Error loading Pokemon list:', error);
    if (!append) {
      pokemonList.innerHTML = '';
      const errorMsg = document.createElement('div');
      errorMsg.className = 'col-span-full text-center text-red-600';
      errorMsg.textContent = 'Error loading Pokemon. Please try again.';
      pokemonList.appendChild(errorMsg);
    }
  } finally {
    loading = false;
  }
}

function searchPokemon(query) {
  query = query.toLowerCase().trim(); // Normalize query

  const allPokemonCards = document.querySelectorAll('#pokemonList > div');

  // ✅ If the input is empty, show all Pokémon
  if (query === '') {
    allPokemonCards.forEach(card => {
      card.style.display = 'block';
    });
    searchResults.innerHTML = ''; // Clear error messages
    return;
  }

  let found = false;

  allPokemonCards.forEach(card => {
    const pokemonName = card.querySelector('h3').textContent.toLowerCase();
    const pokemonID = card.dataset.pokemonId; // Get ID from data attribute

    if (pokemonName.includes(query) || pokemonID === query) {
      card.style.display = 'block';
      found = true;
    } else {
      card.style.display = 'none';
    }
  });

  // Handle case where no Pokémon match
  searchResults.innerHTML = '';
  if (!found) {
    const errorMsg = document.createElement('p');
    errorMsg.className = 'text-red-600 font-bold text-center';
    errorMsg.textContent = 'Pokémon not found. Try a different name or ID.';
    searchResults.appendChild(errorMsg);
    searchModal.classList.remove('hidden');
  }
}

// Event Listeners
// Reset the search when typing
searchInput.addEventListener('input', () => {
  if (searchInput.value.trim() === '') {
    loadPokemonList(); // Reloads all Pokémon when input is empty
  }
});

// Execute search only on button click
searchButton.addEventListener('click', () => {
  const searchText = searchInput.value.trim().toLowerCase();
  if (searchText) {
    searchPokemon(searchText); // Calls the search function only on click
  }
});

closeModal.addEventListener('click', () => {
  searchModal.classList.add('hidden');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting Pokemon fetch');
  loadPokemonList(false);
});

// Improved infinite scroll with Intersection Observer
const observerOptions = {
  root: null,
  rootMargin: '100px',
  threshold: 0.1,
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !loading && hasMorePokemon) {
      currentPage++;
      loadPokemonList(true);
    }
  });
}, observerOptions);

// Add a sentinel element for infinite scroll
const sentinel = document.createElement('div');
sentinel.className = 'h-10';
pokemonList.appendChild(sentinel);
observer.observe(sentinel);
