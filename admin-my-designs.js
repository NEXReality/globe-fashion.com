const urlParams = new URLSearchParams(window.location.search);
  const ownerId = urlParams.get('owner');
  if (ownerId) {
    console.log("Owner ID from URL:", ownerId);
    // You can now use this ownerId to fetch and display the user's designs
    // For example: fetchUserDesigns(ownerId);
  } else {
    console.error("No owner ID found in the URL");
  }

async function fetchDesigns() {
    const { data, error } = await supabase
        .from('user_files')
        .select("owner, id, design_name, name, custom_name, design_metadata, created_at, short_code, order_placed")
        .eq('owner', ownerId) // Filter by owner ID
        .not('design_name', 'is', null); // Filter out null design_name

    if (error) {
        console.error('Error fetching designs:', error);
        return [];
    }

    return data.filter(design => design.design_name !== null);
}

function createDesignCard(design) {
    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/public-bucket/${design.name}`;
    const displayName = design.custom_name || design.design_name;
    const card = document.createElement('div');
    card.className = 'design-card';
    card.dataset.designMetadata = JSON.stringify(design.design_metadata);
    card.innerHTML = `
        <div class="design-header" data-design-id="${design.id}" data-short-code="${design.short_code}">
            <h3 class="design-title" id="page-title" data-original-name="${displayName}">${displayName}</h3>
        </div>
        <div class="design-preview">
            <img src="${imageUrl}" alt="${displayName} Preview" />
        </div>
        <div class="design-footer">
            <span class="creation-date" id="creation-date">Created on: ${new Date(design.created_at).toLocaleDateString()}</span>
        </div>
    `;

    const titleElement = card.querySelector('.design-title');
    titleElement.contentEditable = false;
    titleElement.classList.remove('renaming');

    return card;
}

async function renderDesigns() {
    showLoading();
    const designs = await fetchDesigns()
  
    // Sort designs by created_at date in descending order (latest first)
    designs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
    const designsGrid = document.querySelector(".designs-grid")
    designsGrid.innerHTML = "" // Clear existing content
  
    designs.forEach((design) => {
      const card = createDesignCard(design)
      card.addEventListener("click", () => {
        openDesign(design.short_code)
      })
      designsGrid.appendChild(card)
    })
  
    hideLoading();
  }

// Call renderDesigns when the page loads
document.addEventListener('DOMContentLoaded', renderDesigns);

function openDesign(shortCode) {
    const designUrl = `${window.location.origin}/admin-design.html?shortCode=${shortCode}`;
    window.open(designUrl, '_blank');
}
