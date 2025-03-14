const POKEMON_API_BASE_URL = 'https://pokeapi.co/api/v2';
const favoritesList = document.getElementById('favoritesList');

// Load favorites from localStorage
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('pokeArray')) || [];
  if (favorites.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No favorites added yet.';
    favoritesList.appendChild(emptyMsg);
    return;
  }

  favorites.forEach(async favorite => {
    const pokemon = await fetchPokemon(favorite.id);
    if (pokemon) {
      const card = createPokemonCard(pokemon);
      if (card) {
        favoritesList.appendChild(card);
      }
    }
  });
}

// Fetch Pokemon data
async function fetchPokemon(id) {
  try {
    const response = await fetch(`${POKEMON_API_BASE_URL}/pokemon/${id}`);
    if (!response.ok) {
      // check if response is not ok, throw an error
      throw new Error(`Network HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return null;
  }
}

// Create Pokemon card
function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className =
    'pokemon bg-violet-300 rounded-lg shadow-lg p-4 transform hover:scale-105 transition-transform';
  card.dataset.pokemonId = pokemon.id;

  // Create image container
  const imgContainer = document.createElement('div');
  imgContainer.className =
    'image-container bg-[#ce91b9] bg-opacity-50 rounded-full';
  card.appendChild(imgContainer);

  // Create image
  const img = document.createElement('img');
  img.src =
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.front_default;
  img.alt = pokemon.name;
  img.className =
    'w-44 opacity-75 transition-all duration-300 ease-in-out hover:opacity-100 hover:scale-125';
  imgContainer.appendChild(img);

  // Create name
  const name = document.createElement('h3');
  name.className = 'text-xl font-bold capitalize mb-2';
  name.textContent = pokemon.name;
  card.appendChild(name);

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

  // Create notes section
  const notesDiv = document.createElement('div');
  notesDiv.className = 'mt-4';

  const notesLabel = document.createElement('label');
  notesLabel.textContent = 'Personal Notes:';
  notesLabel.className = 'block text-gray-700 font-bold mb-2';
  notesDiv.appendChild(notesLabel);

  const notesTextarea = document.createElement('textarea');
  notesTextarea.className = 'w-full p-2 border rounded';
  notesTextarea.value = getNotes(pokemon.id);
  notesDiv.appendChild(notesTextarea);

  const saveButton = document.createElement('button'); // TODO after click the save button, window.location.reload() to refresh the page
  saveButton.textContent = 'Save Notes';
  saveButton.className = 'mt-2 bg-blue-500 text-white p-2 rounded';
  saveButton.addEventListener('click', () => {
    saveNotes(pokemon.id, notesTextarea.value);
    notesTextarea.value = '';
  });
  notesDiv.appendChild(saveButton);

  card.appendChild(notesDiv);

  return card;
}

// Get notes from localStorage
function getNotes(pokemonId) {
  const notes = JSON.parse(localStorage.getItem('pokemonNotes')) || {};
  return notes[pokemonId] || '';
}

// Save notes to localStorage
function saveNotes(pokemonId, notes) {
  const allNotes = JSON.parse(localStorage.getItem('pokemonNotes')) || {};
  allNotes[pokemonId] = notes;
  localStorage.setItem('pokemonNotes', JSON.stringify(allNotes));
  // window.location.reload(); // TODO after click the save button, window.location.reload() to refresh the page, this is not working
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFavorites();
});
