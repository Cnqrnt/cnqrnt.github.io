document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'eb893ce7-26d5-4376-b989-ace2833d6a93';
    const apiUrl = 'https://api.pokemontcg.io/v2';

    const openBoosterButton = document.getElementById('openBooster');
    const cardsContainer = document.getElementById('cardsContainer');
    const setSelector = document.getElementById('setSelector');

    openBoosterButton.addEventListener('click', () => openBooster());

    loadSets();

    async function loadSets() {
        try {
            const response = await fetch(`${apiUrl}/sets`, {
                headers: {
                    'X-Api-Key': apiKey
                }
            });
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            const data = await response.json();
            // Ajouter un index d'ordre à chaque set
            const setsWithOrder = data.data.map((set, index) => ({...set, order: index}));
            populateSetSelector(setsWithOrder);
        } catch (error) {
            console.error('Loading...', error);
            setSelector.innerHTML = '<option>Loading...</option>';
        }
    }
    
    function populateSetSelector(sets) {
        setSelector.innerHTML = '<option value="">Every set</option>';
        // Trier les sets selon la propriété 'order'
        sets.sort((a, b) => a.order - b.order);
        sets.forEach(set => {
            const option = document.createElement('option');
            option.value = set.id;
            option.textContent = set.name;
            setSelector.appendChild(option);
        });
    }

    async function openBooster() {
        cardsContainer.innerHTML = 'Loading...';
        
        try {
            const selectedSet = setSelector.value;
            console.log('Selected set:', selectedSet);
            const cards = await getRandomCards(5, selectedSet);
            if (cards.length === 0) {
                cardsContainer.innerHTML = 'No card found. Please try again.';
            } else {
                displayCards(cards);
            }
        } catch (error) {
            console.error('Error. Please try again.', error);
            cardsContainer.innerHTML = 'Error. Please try again.';
        }
    }

    async function getRandomCards(count, setId = '') {
        let url = `${apiUrl}/cards?pageSize=250`;
        if (setId) {
            url += `&q=set.id:${setId}`;
        }

        console.log('Request URL :', url);

        try {
            const response = await fetch(url, {
                headers: { 'X-Api-Key': apiKey }
            });
            if (!response.ok) throw new Error('Network error');
            
            const data = await response.json();
            console.log('Cards:', data.data.length);

            // Mélanger les cartes
            let shuffled = data.data.sort(() => 0.5 - Math.random());

            // Retourner le nombre de cartes demandé
            return shuffled.slice(0, count);
        } catch (error) {
            console.error('Error. Please try again.', error);
            return [];
        }
    }

    function displayCards(cards) {
        cardsContainer.innerHTML = '';
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.innerHTML = `
                <img src="${card.images.small}" alt="${card.name}" />
                <div class="card-info">
                    <div class="card-name">${card.name}</div>
                    <div class="card-set">${card.set.name}</div>
                </div>
            `;
            cardElement.addEventListener('click', () => {
                if (card.cardmarket && card.cardmarket.url) {
                    window.open(card.cardmarket.url, '_blank');
                } else {
                    alert('No cardmarket link for this card.');
                }
            });
            cardsContainer.appendChild(cardElement);
        });
    }

    // Ouvrez un booster au chargement de la page
    openBooster();
});