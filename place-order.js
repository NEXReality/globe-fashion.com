document.addEventListener('DOMContentLoaded', () => {
    const addDesignButton = document.getElementById('add-design-button');
    const modal = document.getElementById('design-select-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const designList = document.querySelector('.design-list');
    const orderTableBody = document.getElementById('order-table-body');
    const grandTotal = document.getElementById('grand-total');

    async function fetchDesigns() {
      const { data, error } = await supabase
          .from('user_files')
          .select('id, design_name, name, custom_name, design_metadata, created_at, short_code')
          .order('created_at', { ascending: false }); // Sort by created_at in descending order
          
      if (error) {
          console.error('Error fetching designs:', error);
          return [];
      }
  
      return data.filter(design => design.design_name !== null || design.custom_name !== null);
  }
  
  function openModal() {
        modal.classList.add('active');
        loadDesigns();
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    async function loadDesigns() {
        const designs = await fetchDesigns();
        designList.innerHTML = '';
        designs.forEach(design => {
            const designElement = createDesignElement(design);
            designList.appendChild(designElement);
        });
    }

    function createDesignElement(design) {
        const designItem = document.createElement("div")
        designItem.className = "design-item"
        designItem.dataset.designId = design.id
        const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/public-bucket/${design.name}`
        const createdDate = new Date(design.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        const displayName = design.custom_name && design.custom_name.trim() !== "" ? design.custom_name : design.design_name
    
        designItem.innerHTML = `
                <div class="design-preview">
                    <img src="${imageUrl}" alt="${displayName}" class="design-thumbnail">
                </div>
                <div class="design-info">
                    <h3>${displayName}</h3>
                    <p>Created on ${createdDate}</p>
                </div>
                <button class="select-button">Select</button>
            `
    
        designItem.addEventListener("click", () => selectDesign(design))
        const selectButton = designItem.querySelector(".select-button")
        selectButton.addEventListener("click", (e) => {
          e.stopPropagation()
          selectDesign(design)
        })
    
        return designItem
      }

    function selectDesign(design) {
      addDesignToOrder(design.id);
        closeModal();
    }

    async function addDesignToOrder(designId) {
      // Fetch the design data from Supabase
      const { data: design, error } = await supabase.from("user_files").select("*").eq("id", designId).single()
    
      if (error) {
        console.error("Error fetching design:", error)
        return
      }
    
      const displayName = design.custom_name && design.custom_name.trim() !== "" ? design.custom_name : design.design_name
      const row = document.createElement("tr")
      row.className = "design-row"
      row.dataset.designId = design.id
      row.innerHTML = `
            <td>${displayName}</td>
            <td>
                <div class="preview-box">
                    <img src="${SUPABASE_URL}/storage/v1/object/public/public-bucket/${design.name}" alt="${design.design_name} Preview" class="design-preview">
                </div>
            </td>
            <td>
                <div class="size-ranges">
                    ${createSizeRangeGroup(row).outerHTML}
                </div>
            </td>
            <td class="silicon-grip">
                <input type="checkbox" class="silicon-grip-checkbox">
            </td>
            <td class="total-quantity">0</td>
            <td>
                <button class="remove-design">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </td>
        `
      orderTableBody.appendChild(row)
      setupRowEventListeners(row)
      initializeSizeRanges(row)
      updateQuantities()
    }
    
      function createSizeRangeGroup(row) {
        const div = document.createElement('div');
        div.className = 'size-range-group';
        
        const availableSizes = getAvailableSizes(row);
        const defaultSize = availableSizes[0] || '';
        
        div.innerHTML = `
            <select class="size-range-select">
                ${availableSizes.map(size => `<option value="${size}">${size}</option>`).join('')}
            </select>
            <input type="number" class="quantity-input" min="1" value="0">
            <button class="add-size-range">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button class="remove-size-range">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        
        const select = div.querySelector('.size-range-select');
        if (select) {
            select.value = defaultSize;
        }
        
        return div;
    }

    function getAvailableSizes(row) {
        const allSizes = ['27/30', '31/34', '35/38', '39/42', '43/46', '47/50'];
        const usedSizes = Array.from(row.querySelectorAll('.size-range-select')).map(select => select.value);
        return allSizes.filter(size => !usedSizes.includes(size));
    }

    function setupRowEventListeners(row) {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.add-size-range')) {
                addNewSizeRange(row);
            } else if (e.target.closest('.remove-size-range')) {
                removeSizeRangeGroup(e.target.closest('.remove-size-range'));
            } else if (e.target.closest('.remove-design')) {
                removeDesignRow(row);
            }
        });
    
        row.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                updateQuantities();
            }
        });
    
        row.addEventListener('change', (e) => {
            if (e.target.classList.contains('size-range-select')) {
                updateSizeRangeOptions(row);
            }
        });
    }

    function updateSizeRangeOptions(row) {
        const availableSizes = getAvailableSizes(row);
        row.querySelectorAll('.size-range-select').forEach(select => {
            const currentValue = select.value;
            const options = availableSizes.concat(currentValue).filter((v, i, a) => a.indexOf(v) === i);
            select.innerHTML = options.map(size => `<option value="${size}">${size}</option>`).join('');
            select.value = currentValue;
        });
    }

    function addNewSizeRange(row) {
        const sizeRanges = row.querySelector('.size-ranges');
        const availableSizes = getAvailableSizes(row);
        
        if (availableSizes.length > 0) {
            const newGroup = createSizeRangeGroup(row);
            sizeRanges.appendChild(newGroup);
            updateSizeRangeOptions(row);
            updateQuantities();
        } else {
          window.translatedAlert('all_sizes_added');
        }
    }

    function initializeSizeRanges(row) {
        const sizeRanges = row.querySelector('.size-ranges');
        sizeRanges.innerHTML = '';
        const initialGroup = createSizeRangeGroup(row);
        sizeRanges.appendChild(initialGroup);
    }

    function removeSizeRangeGroup(button) {
        const group = button.closest('.size-range-group');
        const row = group.closest('.design-row');
        const sizeRanges = group.parentElement;
        if (sizeRanges.children.length > 1) {
            group.remove();
            updateSizeRangeOptions(row);
            updateQuantities();
        }
    }

    function removeDesignRow(row) {
        row.remove();
        updateQuantities();
    }

    function updateQuantities() {
        const rows = document.querySelectorAll('.design-row');
        let grandTotalQuantity = 0;

        rows.forEach(row => {
            const quantities = Array.from(row.querySelectorAll('.quantity-input'))
                .map(input => parseInt(input.value) || 0);
            
            const total = quantities.reduce((sum, qty) => sum + qty, 0);
            row.querySelector('.total-quantity').textContent = total;
            grandTotalQuantity += total;
        });

        grandTotal.textContent = grandTotalQuantity;
    }

    addDesignButton.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle quantity input validation
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.startsWith('0')) {
                e.target.value = e.target.value.substring(1);
            }
            updateQuantities();
        }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
  // Form validation elements
  const fullNameInput = document.getElementById("fullName")
  const clubNameInput = document.getElementById("clubName")
  const emailOrderInput = document.getElementById("email_order")
  const phoneInput = document.getElementById("phone")
  const addressInput = document.getElementById("address")
  const cityInput = document.getElementById("city")
  const zipCodeInput = document.getElementById("zipCode")
  const stateInput = document.getElementById("state")
  const countryInput = document.getElementById("country")
  const placeOrderButton = document.querySelector(".place-order-button")
  const grandTotalElement = document.getElementById("grand-total")

  const formFields = [
    fullNameInput,
    clubNameInput,
    emailOrderInput,
    phoneInput,
    addressInput,
    cityInput,
    zipCodeInput,
    stateInput,
    countryInput,
  ]

  // Form validation functions
  function validateEmail(email) {
    return email.includes("@") && email.includes(".")
  }

  function setupInputValidation(input, regex) {
    if (input) {
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(regex, "")
        validateField(input)
      })
    }
  }

  // Function to get the current language (replace with your actual implementation)
  function getCurrentLanguage() {
    // Example implementation:  Check browser language settings or a stored preference
    const userLang = navigator.language || navigator.userLanguage
    return userLang.substring(0, 2) === "fr" ? "fr" : "en"
  }

  function validateField(field) {
    if (!field) return

    const errorElement = field.parentElement.querySelector(".error-message")
    if (!errorElement) return

    const currentLang = getCurrentLanguage() // Assuming you have this function

    if (field.required && !field.value.trim()) {
      field.classList.add("error")
      errorElement.innerHTML = `<span data-en="${field.name || "This field"} is required." data-fr="${field.name || "Ce champ"} est obligatoire."></span>`
    } else if (field.id === "email_order" && !validateEmail(field.value)) {
      field.classList.add("error")
      errorElement.innerHTML =
        '<span data-en="Please enter a valid email address." data-fr="Veuillez entrer une adresse e-mail valide."></span>'
    } else if (field.id === "phone" && !/^\d{7,15}$/.test(field.value.replace(/\D/g, ""))) {
      field.classList.add("error")
      errorElement.innerHTML =
        '<span data-en="Please enter a valid phone number." data-fr="Veuillez entrer un numéro de téléphone valide."></span>'
    } else {
      field.classList.remove("error")
      errorElement.textContent = ""
    }

    // Show the correct language version
    if (errorElement.firstChild) {
      errorElement.firstChild.textContent = errorElement.firstChild.getAttribute(`data-${currentLang}`)
    }
  }

  // Setup input validation
  setupInputValidation(fullNameInput, /[^A-Za-z ]/g)
  setupInputValidation(clubNameInput, /[^A-Za-z0-9 ]/g)
  setupInputValidation(phoneInput, /[^0-9-+() ]/g)
  setupInputValidation(cityInput, /[^A-Za-z ]/g)
  setupInputValidation(zipCodeInput, /[^0-9-]/g)
  setupInputValidation(stateInput, /[^A-Za-z ]/g)
  setupInputValidation(countryInput, /[^A-Za-z ]/g)

  // Fetch user data from Supabase and populate form
  async function fetchAndPopulateUserData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("No authenticated user found")
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

      if (error) throw error

      if (data) {
        fullNameInput.value = data.full_name || ""
        clubNameInput.value = data.club_name || ""
        emailOrderInput.value = data.email_order || ""
        phoneInput.value = data.phone || ""
        addressInput.value = data.address_line1 || ""
        cityInput.value = data.city || ""
        zipCodeInput.value = data.zip_code || ""
        stateInput.value = data.state || ""
        countryInput.value = data.country || ""
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  async function saveProfileData() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error("No authenticated user found")
    }

    const profileData = {
      user_id: user.id,
      full_name: fullNameInput.value.trim(),
      email: user.email,
      email_order: emailOrderInput.value.trim(),
      phone: phoneInput.value.trim(),
      club_name: clubNameInput.value.trim(),
      address_line1: addressInput.value.trim(),
      city: cityInput.value.trim(),
      state: stateInput.value.trim(),
      zip_code: zipCodeInput.value.trim(),
      country: countryInput.value.trim(),
    }

    const { error } = await supabase.from("profiles").upsert(profileData)

    if (error) throw error
  }

  // Place order form submission
  if (placeOrderButton) {
    placeOrderButton.addEventListener("click", handleOrderSubmission)
  }

  async function handleOrderSubmission(event) {
    event.preventDefault()

    // Validate all fields
    formFields.forEach(validateField)

    // Check if any required fields are empty or have errors
    const hasErrors = formFields.some((field) => field.classList.contains("error"))

    if (hasErrors) {
      window.translatedAlert("form_errors")
      return
    }

    // Validate total quantity
    const grandTotalQuantity = grandTotalElement ? Number.parseInt(grandTotalElement.textContent) : 0
    if (grandTotalQuantity < 0) {
      window.translatedAlert("minimum_quantity_error")
      return
    }

    try {
      // Save the current form data when submitting an order
      await saveProfileData()

      // Gather design details
      const designDetails = await gatherDesignDetails()

      if (designDetails.length === 0) {
        window.translatedAlert("no_designs_in_order")
        return
      }

      // Prepare the order details
      const orderDetails = {
        fullName: fullNameInput.value.trim(),
        emailOrder: emailOrderInput.value.trim(),
        designs: designDetails,
      }

      // Save the order to Supabase
      const savedOrder = await saveOrderToSupabase(orderDetails)

      console.log("Order placed successfully:", savedOrder)

      window.translatedAlert("order_placed_success")
     // Refresh the page
     setTimeout(() => {
      window.location.reload();
  }, 3000);
    } catch (error) {
      console.error("Error submitting order:", error)
      window.translatedAlert("order_placement_error")
    }
  }

  // Handle quantity input validation
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("quantity-input")) {
      e.target.value = e.target.value.replace(/[^0-9]/g, "")
      if (e.target.value.startsWith("0")) {
        e.target.value = e.target.value.substring(1)
      }
      updateQuantities()
    }
  })

  function updateQuantities() {
    const rows = document.querySelectorAll(".design-row")
    let grandTotal = 0

    rows.forEach((row) => {
      const quantities = Array.from(row.querySelectorAll(".quantity-input")).map(
        (input) => Number.parseInt(input.value) || 0,
      )

      const total = quantities.reduce((sum, qty) => sum + qty, 0)
      const totalQuantityElement = row.querySelector(".total-quantity")
      if (totalQuantityElement) totalQuantityElement.textContent = total
      grandTotal += total
    })

    if (grandTotalElement) grandTotalElement.textContent = grandTotal
  }

  // Fetch and populate user data on page load
  fetchAndPopulateUserData()
})
  

async function  gatherDesignDetails() {
  const designs = []
  const designRows = document.querySelectorAll(".design-row")

  designRows.forEach((row) => {
    const designNameElement = row.querySelector("td:first-child")
    const designName = designNameElement ? designNameElement.textContent : "Unnamed Design"
    const designId = row.dataset.designId
    const imageElement = row.querySelector(".design-preview")
    const imageUrl = imageElement ? imageElement.src : null

    if (!designId) {
      console.error("Design ID is missing for row:", row)
      return // Skip this row if designId is missing
    }

    const sizes = {}
    const sizeRangeGroups = row.querySelectorAll(".size-range-group")

    sizeRangeGroups.forEach((group) => {
      const sizeSelect = group.querySelector(".size-range-select")
      const quantityInput = group.querySelector(".quantity-input")

      if (sizeSelect && quantityInput) {
        const size = sizeSelect.value
        const quantity = Number.parseInt(quantityInput.value) || 0
        if (quantity > 0) {
          sizes[size] = (sizes[size] || 0) + quantity
        }
      }
    })

    const siliconGripCheckbox = row.querySelector(".silicon-grip-checkbox")
    const siliconGrip = siliconGripCheckbox ? siliconGripCheckbox.checked : false

    if (Object.keys(sizes).length > 0) {
      designs.push({ id: designId, name: designName, sizes: sizes, siliconGrip: siliconGrip, imageUrl: imageUrl })
    }
  })

  return designs
}

async function saveOrderToSupabase(orderDetails) {
  showLoading(); // Show loading at the start of the function
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      hideLoading(); // Hide loading if there's a user error
      throw userError;
    }
    if (!user) {
      hideLoading(); // Hide loading if no authenticated user is found
      throw new Error("No authenticated user found");
    }
  
    let totalQuantity = 0;
    const orderItems = orderDetails.designs.map((design) => {
      const itemTotalQuantity = Object.values(design.sizes).reduce((sum, quantity) => sum + quantity, 0);
      totalQuantity += itemTotalQuantity;
      return {
        design_id: design.id,
        design_name: design.name || design.custom_name || 'Unnamed Design',
        sizes: design.sizes,
        item_total_quantity: itemTotalQuantity,
        silicon_grip: design.siliconGrip,
        image_url: design.imageUrl,
      };
    });

    const orderData = {
      user_id: user.id,
      full_name: orderDetails.fullName,
      email_order: orderDetails.emailOrder,
      total_quantity: totalQuantity,
      order_items: orderItems,
    };

    const { data: orderSaveData, error: orderSaveError } = await supabase
      .from("user_orders")
      .insert([orderData])
      .select();

    if (orderSaveError) {
      hideLoading(); // Hide loading if there's an error saving the order
      throw orderSaveError;
    }

    const updatePromises = orderItems.map(async item => {
      if (!item.design_id) {
        console.error('Design ID is undefined:', item);
        return;
      }

      const { data, error } = await supabase
        .from("user_files")
        .select('order_placed')
        .eq('id', item.design_id)
        .single();

      if (error) {
        console.error(`Error fetching order_placed for design ${item.design_id}:`, error);
        return;
      }

      const newOrderPlaced = ((data && data.order_placed) || 0) + 1;

      const { error: updateError } = await supabase
        .from("user_files")
        .update({ order_placed: newOrderPlaced })
        .eq('id', item.design_id);

      if (updateError) {
        console.error(`Error updating order_placed for design ${item.design_id}:`, updateError);
      } else {
        console.log(`Successfully updated order_placed for design ${item.design_id} to ${newOrderPlaced}`);
      }
    });

    await Promise.all(updatePromises);

    console.log("Order saved successfully:", orderSaveData);

    hideLoading(); // Hide loading after successful order save
    return orderSaveData;
  } catch (error) {
    console.error("Error saving order:", error);
    hideLoading(); // Hide loading if there's an error
    throw error;
  }
}