async function fetchDesigns() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
        .from('user_files')
        .select("id, design_name, name, custom_name, design_metadata, created_at, short_code, order_placed")
        .eq('owner', user.id) // Filter by owner ID
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
            <button class="menu-button" aria-label="More options">
                <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="2" cy="2" r="2" fill="currentColor"/>
                    <circle cx="2" cy="8" r="2" fill="currentColor"/>
                    <circle cx="2" cy="14" r="2" fill="currentColor"/>
                </svg>
            </button>
            <div class="design-menu" style="display: none;">
                <button class="menu-item rename-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span data-en>Rename</span>
                    <span data-fr>Renommer</span>
                </button>
                <button class="menu-item share-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 9.316a3 3 0 105.368-2.684 3 3 0 00-5.368 2.684zm0-9.316a3 3 0 105.366-2.683 3 3 0 00-5.366 2.683z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span data-en>Share</span>
                    <span data-fr>Partager</span>
                </button>
                <button class="menu-item delete-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span data-en>Delete</span>
                    <span data-fr>Supprimer</span>
                </button>
            </div>
        </div>
        <div class="design-preview">
            <img src="${imageUrl}" alt="${displayName} Preview" />
        </div>
        <div class="design-footer">
            <span class="creation-date" id="creation-date">
  ${getTranslation("created_on", getCurrentLanguage())}: ${new Date(design.created_at).toLocaleDateString()}
</span>
        </div>
    `;

    const currentLang = getCurrentLanguage()
    card.querySelectorAll(`[data-${currentLang}]`).forEach((el) => (el.style.display = "inline"))
    card.querySelectorAll(`[data-${currentLang === "en" ? "fr" : "en"}]`).forEach((el) => (el.style.display = "none"))
  
    const titleElement = card.querySelector('.design-title');
    titleElement.contentEditable = false;
    titleElement.classList.remove('renaming');

    return card;
}

function updateDesignCards(lang) {
    const designCards = document.querySelectorAll('.design-card');
    designCards.forEach(card => {
      card.querySelectorAll(`[data-${lang}]`).forEach((el) => (el.style.display = "inline"))
      card.querySelectorAll(`[data-${lang === "en" ? "fr" : "en"}]`).forEach((el) => (el.style.display = "none"))
    });
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
    card.addEventListener("click", (event) => {
      const isRenaming = card.querySelector(".design-title.renaming")
      if (!event.target.closest(".menu-button") && !event.target.closest(".design-menu") && !isRenaming) {
        openDesign(design.short_code)
      }
    })
    designsGrid.appendChild(card)
  })
  hideLoading();
  // Add event listeners for menu buttons
  document.querySelectorAll(".menu-button").forEach((button) => {
    button.addEventListener("click", toggleMenu)
  })

  document.querySelectorAll(".rename-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation()
      const card = event.target.closest(".design-card")
      const titleElement = card.querySelector(".design-title")
      titleElement.contentEditable = true
      titleElement.classList.add("renaming")
      titleElement.focus()
    })
  })

document.querySelectorAll('.share-button').forEach(button => {
  button.addEventListener('click', (event) => {
      event.stopPropagation();
      shareDesign(event);
  });
});

document.querySelectorAll('.delete-button').forEach(button => {
  button.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteDesign(event);
  });
});

document.querySelectorAll('.design-title').forEach(titleElement => {
  titleElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
          event.preventDefault();
          titleElement.blur();
      }
  });

  titleElement.addEventListener('blur', () => {
      titleElement.contentEditable = false;
      titleElement.classList.remove('renaming');
      const designId = titleElement.closest('.design-header').dataset.designId;
      renameDesign(designId, titleElement.textContent);
  });
});
    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".design-card")) {
        closeAllMenus()
      }
    })
  }
  

function closeAllMenus() {
    document.querySelectorAll('.design-menu').forEach(menu => {
      menu.style.display = 'none';
    });
    document.querySelectorAll('.design-title').forEach(title => {
      title.contentEditable = false;
      title.classList.remove('renaming');
    });
  }

function toggleMenu(event) {
    event.stopPropagation();
    const clickedMenu = event.target.closest('.design-header').querySelector('.design-menu');
    const isClickedMenuVisible = clickedMenu.style.display === 'block';

    // Close all menus
    closeAllMenus();

    // If the clicked menu wasn't visible, show it
    if (!isClickedMenuVisible) {
        clickedMenu.style.display = 'block';
    }
}

async function renameDesign(designId, newName) {
    let success = false;
    let message = '';

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error('Error getting user information');

        // Check if a design with the new name already exists
        const { data: existingDesigns, error: checkError } = await supabase
            .from("user_files")
            .select("id")
            .or(`design_name.eq.${newName},custom_name.eq.${newName}`)
            .eq("owner", user.id);

        if (checkError) {
            throw new Error('Error checking design names');
        }

        if (existingDesigns && existingDesigns.length > 0) {
            window.translatedAlert('unique_name_error');
            throw new Error('A design with this name already exists');
        }

        // If no existing design with that name, proceed with renaming
        const { data, error } = await supabase
            .from("user_files")
            .update({ custom_name: newName })
            .eq("id", designId);

        if (error) {
            throw new Error('Failed to rename design');
        }

        success = true;
        message = 'Design renamed successfully';

    } catch (error) {
        console.error('Error in renameDesign:', error);
        message = error.message;
    } finally {
        // Update the UI
        const titleElement = document.querySelector(`[data-design-id="${designId}"] .design-title`);
        if (titleElement) {
            if (!success) {
                titleElement.textContent = titleElement.getAttribute("data-original-name");
            } else {
                titleElement.setAttribute("data-original-name", newName);
            }
        }
        return { success, message };
    }
}

function shareDesign(event) {
    const card = event.target.closest('.design-card');
    const designName = card.querySelector('.design-title').textContent;
    const designMetadataString = card.dataset.designMetadata;

    let designMetadata;
    try {
        designMetadata = JSON.parse(designMetadataString);
    } catch (error) {
        console.error('Error parsing design metadata:', error);
        window.translatedAlert('error_sharing_design');
        return;
    }

    if (!designMetadata) {
        console.error('Design metadata is missing');
        window.translatedAlert('unable_to_share_missing_data');
        return;
    }

    const params = new URLSearchParams();
    params.append('name', designName);
    params.append('metadata', JSON.stringify(designMetadata));

    const shareUrl = `${window.location.origin}/share.html?${params.toString()}`;
    
    // Copy the URL to clipboard
    navigator.clipboard.writeText(shareUrl)
        .then(() => window.translatedAlert('share_url_copied'))
        .catch(err => {
            console.error('Error copying URL: ', err);
            window.translatedAlert('failed_to_copy_share_url');
        });
}


async function deleteDesign(event) {
  const card = event.target.closest(".design-card");
  const designId = card.querySelector(".design-header").dataset.designId;
  const designName = card.querySelector(".design-title").textContent;

  // First, check if the design has been ordered
  const { data: designData, error: fetchError } = await supabase
      .from("user_files")
      .select("order_placed, name")
      .eq("id", designId)
      .single();

  if (fetchError) {
      console.error("Error fetching design data:", fetchError);
      return;
  }

  if (designData.order_placed > 0) {
      window.translatedAlert('design_ordered_no_delete');
      return;
  }
  const currentLang = getCurrentLanguage();
  const translatedMessage = getTranslation('delete_confirmation', currentLang).replace('{0}', designName);
  const shouldDelete = await confirm(translatedMessage);

  if (shouldDelete) {
      try {
          // Step 1: Delete the file from storage
          const { error: storageError } = await supabase.storage
              .from("public-bucket")
              .remove([designData.name]);
  
          if (storageError) throw storageError;
  
          // Step 2: Delete the database entry
          const { error: dbError } = await supabase
              .from("user_files")
              .delete()
              .eq("id", designId);
  
          if (dbError) throw dbError;
  
          // Step 3: Remove the card from the UI
          card.remove();
  
          console.log("Design deleted successfully");
      } catch (error) {
          console.error("Error deleting design:", error);
          window.translatedAlert('error_deleting_design');
      }
  }
  // If user clicks Cancel, function simply ends and nothing happens
}
// Call renderDesigns when the page loads
document.addEventListener('DOMContentLoaded', renderDesigns);

function openDesign(shortCode) {
    const designUrl = `${window.location.origin}/index.html?=${shortCode}`;
    window.open(designUrl, '_self');
}
