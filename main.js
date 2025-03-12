//Favorites local storage
const addToFavorites = favePokemon => {
  const pokeArray = JSON.parse(localStorage.getItem('pokeArray')) || [];
  const updatedFaves = [...pokeArray, favePokemon];
  localStorage.setItem('pokeArray', JSON.stringify(updatedFaves));
};
export { addToFavorites };
