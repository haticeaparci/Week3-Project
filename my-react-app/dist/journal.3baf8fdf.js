const favoritesList = document.getElementById('favoritesList');
const favoritesCount = document.getElementById('favoritesCount');
const updateFavoritesCount = ()=>{
    const favorites = JSON.parse(localStorage.getItem('pokeArray')) || [];
    favoritesCount.textContent = favorites.length;
    favoritesCount.className = ' bg-blue-500 text-lg inline-block rounded';
};
// Load favorites from localStorage
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('pokeArray')) || [];
    favoritesList.textContent = '';
    if (favorites.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No favorites added yet.';
        favoritesList.appendChild(emptyMsg);
        return;
    }
    console.log(favorites);
    favorites.forEach((favorite)=>{
        const card = createPokemonCard(favorite);
        favoritesList.appendChild(card);
    });
    updateFavoritesCount();
}
//favorites count
// Create Pokémon card with DOM
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon bg-violet-300 rounded-lg shadow-lg p-4 transform hover:scale-105 transition-transform';
    const img = document.createElement('img');
    img.src = pokemon.image;
    img.alt = pokemon.name;
    img.className = 'w-44 opacity-75 transition-all duration-300 ease-in-out hover:opacity-100 hover:scale-125';
    const name = document.createElement('h3');
    name.className = 'text-xl font-bold capitalize mb-2';
    name.textContent = pokemon.name;
    const hp = document.createElement('p');
    hp.className = 'text-gray-600 mb-2 text-sm';
    hp.textContent = `HP: ${pokemon.hp}`;
    const attack = document.createElement('p');
    attack.className = 'text-gray-600 mb-2 text-sm';
    attack.textContent = ` Attack ${pokemon.attack}`;
    const defense = document.createElement('p');
    defense.className = 'text-gray-600 mb-2 text-sm';
    defense.textContent = `Defense: ${pokemon.defense}`;
    const speed = document.createElement('p');
    speed.className = 'text-gray-600 mb-2 text-sm';
    speed.textContent = `Speed: ${pokemon.speed}`;
    const notesDiv = document.createElement('div');
    notesDiv.className = 'mt-4';
    const notesLabel = document.createElement('label');
    notesLabel.textContent = 'Your Notes';
    notesLabel.className = 'block text-gray-700 font-bold mb-2';
    notesDiv.appendChild(notesLabel);
    const notesTextarea = document.createElement('textarea');
    notesTextarea.className = 'w-full p-2 border rounded';
    notesTextarea.value = pokemon.note || '';
    notesDiv.appendChild(notesTextarea);
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Notes';
    saveButton.className = 'm-2 bg-blue-500 text-white p-2 rounded';
    const displayNotes = document.createElement('p');
    displayNotes.className = 'text-red-700 mt-2';
    displayNotes.textContent = pokemon.note ? `Notes: ${pokemon.note}` : 'No notes yet';
    notesDiv.appendChild(displayNotes);
    saveButton.addEventListener('click', ()=>{
        const newNotes = notesTextarea.value;
        saveNotes(pokemon.name, newNotes);
        displayNotes.textContent = newNotes ? `${newNotes}` : 'No notes yet';
        notesTextarea.value = '';
    });
    notesDiv.appendChild(saveButton);
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(hp);
    card.appendChild(attack);
    card.appendChild(defense);
    card.appendChild(speed);
    card.appendChild(notesDiv);
    return card;
}
// Save notes localStorage
function saveNotes(pokemonName, notes) {
    const pokeArray = JSON.parse(localStorage.getItem('pokeArray')) || [];
    const updatedPokeArray = pokeArray.map((pokemon)=>pokemon.name === pokemonName ? {
            ...pokemon,
            note: notes
        } : pokemon);
    localStorage.setItem('pokeArray', JSON.stringify(updatedPokeArray));
}
// Initialize
document.addEventListener('DOMContentLoaded', loadFavorites);

//# sourceMappingURL=journal.3baf8fdf.js.map
