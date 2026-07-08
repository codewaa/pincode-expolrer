const button = document.getElementById('search-btn');
const inputField = document.getElementById('pincode');
const message = document.getElementById('message');
const resultsEl = document.getElementById('results');

button.addEventListener('click', function(){
    const pincode = inputField.value.trim();
    // hide the static prompt and map icon inside the empty state
    const staticPrompt = document.querySelector('.empty-state .empty-text:not(#message)');
    const mapIcon = document.querySelector('.empty-state .map-icon');
    if(staticPrompt) staticPrompt.remove();
    if(mapIcon) mapIcon.remove();
    // validate 6-digit pincode
    if(!/^\d{6}$/.test(pincode)){
        message.textContent = 'Please enter a valid 6-digit pincode.';
        inputField.classList.add('invalid');
        inputField.focus();
        clearResults();
        return;
    }
    inputField.classList.remove('invalid');
    message.textContent = 'Searching ' + pincode + ' …';
    getData(pincode);
})

async function getData(pincode) {
    try{
        const Api = 'https://api.postalpincode.in/pincode/' + pincode;
        const response = await fetch(Api);
        const data = await response.json();

        // API returns an array; check expected structure
        if(!Array.isArray(data) || !data[0]){
            message.textContent = 'Unexpected response format.';
            clearResults();
            return;
        }

        const payload = data[0];
        if(payload.Status && payload.Status !== 'Success'){
            message.textContent = payload.Message || 'No results found.';
            clearResults();
            return;
        }

        const postOffices = payload.PostOffice || [];
        if(postOffices.length === 0){
            message.textContent = 'No post offices found for this pincode.';
            clearResults();
            return;
        }

        message.textContent = '';
        renderResults(postOffices);
    }catch(err){
        console.error(err);
        message.textContent = 'Network or server error.';
        clearResults();
    }
}

function clearResults(){
    resultsEl.innerHTML = '';
}

function renderResults(offices){
    clearResults();
    offices.forEach(o => {
        const card = document.createElement('div');
        card.className = 'result-card';

        const title = document.createElement('h3');
        title.textContent = o.Name || '—';
        card.appendChild(title);

        const desc = document.createElement('div');
        desc.className = 'muted';
        desc.textContent = (o.BranchType ? o.BranchType + ' — ' : '') + (o.DeliveryStatus || '');
        card.appendChild(desc);

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = `
          <div class="tag">${o.Block || o.Taluk || ''}</div>
          <div class="tag">${o.District || ''}</div>
          <div class="tag">${o.State || ''}</div>
        `;
        card.appendChild(meta);

        const more = document.createElement('div');
        more.className = 'muted';
        more.style.marginTop = '8px';
        more.textContent = `${o.Division || ''}${o.Region ? ' • ' + o.Region : ''}${o.Pincode ? ' • ' + o.Pincode : ''}`;
        card.appendChild(more);

        resultsEl.appendChild(card);
    });
}


