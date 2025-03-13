// Constants
const POKEMON_API_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_PER_PAGE = 51;
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

//Favorites local storage
const addToFavorites = favePokemon => {
  const pokeArray = JSON.parse(localStorage.getItem('pokeArray')) || [];
  const updatedFaves = [...pokeArray, favePokemon];
  localStorage.setItem('pokeArray', JSON.stringify(updatedFaves));
};
export { addToFavorites };

/*// Load favorites from localStorage on startup
try {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        storedFavorites.split(',').forEach(id => {
            const numId = parseInt(id, 10);
            if (!isNaN(numId)) {
                favorites.add(numId);
            }
        });
    }
} catch (error) {
    console.error('Error loading favorites:', error);
}*/

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
    card.className = 'bg-white rounded-lg shadow-lg p-4 transform hover:scale-105 transition-transform';
    card.dataset.pokemonId = pokemon.id;
    
    // Create image
    const img = document.createElement('img');
    img.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    img.alt = pokemon.name;
    img.className = 'w-full h-48 object-contain mb-4';
    card.appendChild(img);

    // Create name
    const name = document.createElement('h3');
    name.className = 'text-xl font-bold capitalize mb-2';
    name.textContent = pokemon.name;
    card.appendChild(name);

    // Create type
    const typeP = document.createElement('p');
    typeP.className = 'text-gray-600 mb-2';
    typeP.textContent = 'Type: ' + pokemon.types.map(type => type.type.name).join(', ');
    card.appendChild(typeP);

    // Create stats container
    const statsDiv = document.createElement('div');
    statsDiv.className = 'grid grid-cols-2 gap-2 text-sm mb-4';

    // Add stats
    const stats = [
        { label: 'HP', value: pokemon.stats[0].base_stat },
        { label: 'Attack', value: pokemon.stats[1].base_stat },
        { label: 'Defense', value: pokemon.stats[2].base_stat },
        { label: 'Speed', value: pokemon.stats[5].base_stat }
    ];

    stats.forEach(stat => {
        const statP = document.createElement('p');
        statP.textContent = `${stat.label}: ${stat.value}`;
        statsDiv.appendChild(statP);
    });
    card.appendChild(statsDiv);

    
