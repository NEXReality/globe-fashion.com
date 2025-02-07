function getOrderIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderId');
}

async function fetchOrderDetails(orderId) {
    const { data, error } = await supabase
        .from('user_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order details:', error);
        return null;
    }

    return data;
}

async function fetchProfileData(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('phone, club_name, address_line1, city, state, zip_code, country')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }

    return data;
}

async function fetchThumbnailUrl(designName) {
    const { data, error } = await supabase
        .from('user_files')
        .select('name')
        .or(`design_name.eq.${designName},custom_name.eq.${designName}`)
        .single();

    if (error) {
        console.error('Error fetching thumbnail URL:', error);
        return null;
    }

    return data ? `${SUPABASE_URL}/storage/v1/object/public/public-bucket/${data.name}` : null;
}

function formatDate(dateString, lang = 'en') {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    };
    return new Date(dateString).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', options);
}

function formatAddress(profile) {
    const addressParts = [
        profile.address_line1,
        profile.city,
        profile.state,
        profile.country,
        profile.zip_code
    ].filter(Boolean);

    return addressParts.join('<br>');
}



async function renderOrderDetails(order, profile) {
    const currentLang = localStorage.getItem("language") || "en"
  
    // Update order title and date
    document.querySelector(".order-title").textContent =
      `${getTranslation("orderIdLabel", currentLang)} ${order.order_id}`
    document.querySelector(".order-date").textContent = formatDate(order.date, currentLang)
  
    // Render order items
    const designList = document.querySelector(".design-list")
    const orderItems = Array.isArray(order.order_items) ? order.order_items : [order.order_items]
    let totalQuantity = 0
  
    designList.innerHTML = "" // Clear existing content
  
    for (const item of orderItems) {
      const designItem = document.createElement("div")
      designItem.className = "design-item"
  
      const sizeColumns = Object.entries(item.sizes).reduce((acc, [size, quantity], index) => {
        const column = Math.floor(index / 3)
        if (!acc[column]) acc[column] = []
        acc[column].push(`
          <div class="size-item">
            ${getTranslation("sizeLabel", currentLang)} ${size}: ${quantity} ${getTranslation("pairsLabel", currentLang)}
            <br>
            <span class="silicon-grip-status">
              ${getTranslation("siliconGripLabel", currentLang)} ${item.silicon_grip ? getTranslation("yes", currentLang) : getTranslation("no", currentLang)}
            </span>
          </div>
        `)
        return acc
      }, [])
  
      const sizeGrid = sizeColumns
        .map(
          (column) => `
        <div class="size-column">
          ${column.join("")}
        </div>
      `,
        )
        .join("")
  
      const thumbnailUrl = await fetchThumbnailUrl(item.design_name)
      const imageUrl = thumbnailUrl || "/placeholder.svg"
  
      designItem.innerHTML = `
        <div class="design-preview">
          <img src="${imageUrl}" alt="${item.design_name}">
        </div>
        <div class="design-details">
          <h3 class="design-name">${item.design_name}</h3>
          <div class="size-grid">
            ${sizeGrid}
          </div>
          <div class="design-total">${getTranslation("totalLabel", currentLang)} ${item.item_total_quantity} ${getTranslation("pairsLabel", currentLang)}</div>
        </div>
      `
  
      designList.appendChild(designItem)
      totalQuantity += item.item_total_quantity
    }
  
    // Update total order quantity
    document.getElementById("total-quantity").textContent =
      `${totalQuantity} ${getTranslation("totalQuantity", currentLang)}`
  
    // Render customer details
    const detailsGrid = document.querySelector(".details-grid")
    const formattedAddress = profile ? formatAddress(profile) : "N/A"
  
    detailsGrid.innerHTML = `
      <div class="detail-group">
        <label>${getTranslation("fullNameLabel", currentLang)}</label>
        <div class="detail-value">${order.full_name}</div>
      </div>
      <div class="detail-group">
        <label>${getTranslation("emailLabel", currentLang)}</label>
        <div class="detail-value">${order.email_order}</div>
      </div>
      <div class="detail-group">
        <label>${getTranslation("phoneLabel", currentLang)}</label>
        <div class="detail-value">${profile ? profile.phone || "N/A" : "N/A"}</div>
      </div>
      <div class="detail-group">
        <label>${getTranslation("clubNameLabel", currentLang)}</label>
        <div class="detail-value">${profile ? profile.club_name || "N/A" : "N/A"}</div>
      </div>
      <div class="detail-group full-width">
        <label>${getTranslation("shippingAddressLabel", currentLang)}</label>
        <div class="detail-value address">
          ${formattedAddress}
        </div>
      </div>
    `
  }

  async function updateOrderDetails() {
    const currentLang = localStorage.getItem("language") || "en"
    const orderId = getOrderIdFromUrl()
    if (orderId) {
      const orderDetails = await fetchOrderDetails(orderId)
      if (orderDetails) {
        const profileData = await fetchProfileData(orderDetails.user_id)
        renderOrderDetails(orderDetails, profileData)
      } else {
        document.querySelector(".order-details-container").innerHTML =
          `<p>${getTranslation("errorOrderNotFound", currentLang)}</p>`
      }
    } else {
      document.querySelector(".order-details-container").innerHTML =
        `<p>${getTranslation("errorNoOrderId", currentLang)}</p>`
    }
  }
 

// Call updateOrderDetails when the page loads
document.addEventListener('DOMContentLoaded', updateOrderDetails);
