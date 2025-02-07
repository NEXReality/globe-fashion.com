// Pagination state
let currentPage = 1;
const itemsPerPage = 20;
let totalOrders = 0;

// DOM elements
const tableBody = document.getElementById('orders-table-body');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumbers = document.querySelector('.page-numbers');
const paginationInfo = document.querySelector('.pagination-info');

// Fetch orders from Supabase
async function fetchOrders() {
    const { data, error, count } = await supabase
        .from('user_orders')
        .select('date, order_items, full_name, email_order, order_id', { count: 'exact' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    totalOrders = count;
    return data;
}

// Update table with current page data
async function updateTable() {
    const orders = await fetchOrders();
    const start = (currentPage - 1) * itemsPerPage;
    const currentLang = getCurrentLanguage();

    tableBody.innerHTML = orders.map((order, index) => {
        const orderItems = Array.isArray(order.order_items) ? order.order_items : [order.order_items];
        const designLinks = orderItems.map(item => 
            `<a href="#" class="clickable-link" onclick="openDesignDetails('${item.design_name}')">
                ${item.design_name}
            </a>`
        ).join('<br>');

        const orderDate = new Date(order.date);
        const formattedDate = new Intl.DateTimeFormat(currentLang, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }).format(orderDate);
        const formattedTime = new Intl.DateTimeFormat(currentLang, { 
            hour: '2-digit', 
            minute: '2-digit' 
        }).format(orderDate);

        return `
            <tr>
                <td>${start + index + 1}</td>
                <td>
                    ${formattedDate}<br>
                    <span class="order-time">${formattedTime}</span>
                </td>
                <td>${designLinks}</td>
                <td>${order.full_name}</td>
                <td>${order.email_order}</td>
                <td>
                    <a href="#" class="clickable-link" onclick="showOrderDetails('${order.order_id}')">
                        ${order.order_id}
                    </a>
                </td>
            </tr>
        `;
    }).join('');

    // Update pagination info
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    updatePaginationInfo(start + 1, Math.min(start + orders.length, totalOrders), totalOrders);

    // Update pagination buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Update page numbers
    updatePageNumbers(totalPages);
}

function updatePaginationInfo(start, end, total) {
    const paginationInfo = document.getElementById('pagination-info');
    if (!paginationInfo) return;

    const currentLang = getCurrentLanguage();

    const translations = {
        en: `Showing ${start} to ${end} of ${total} results`,
        fr: `Affichage de ${start} à ${end} sur ${total} résultats`
    };

    paginationInfo.textContent = translations[currentLang];
}

// Update page number buttons
function updatePageNumbers(totalPages) {
    let pages = [];
    if (totalPages <= 3) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 2) {
        pages = [1, 2, 3];
    } else if (currentPage >= totalPages - 1) {
        pages = [totalPages - 2, totalPages - 1, totalPages];
    } else {
        pages = [currentPage - 1, currentPage, currentPage + 1];
    }

    pageNumbers.innerHTML = pages.map(page => `
        <button class="page-number ${page === currentPage ? 'active' : ''}"
                onclick="goToPage(${page})">${page}</button>
    `).join('');
}

// Navigation functions
function goToPage(page) {
    currentPage = page;
    updateTable();
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalOrders / itemsPerPage)) {
        currentPage++;
        updateTable();
    }
});

// Show order details
async function showOrderDetails(orderId) {
    const { data, error } = await supabase
        .from('user_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order details:', error);
        return;
    }

    const orderItems = Array.isArray(data.order_items) ? data.order_items : [data.order_items];
    let modalContent = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${data.order_id}</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
            <p><strong>Full Name:</strong> ${data.full_name}</p>
            <p><strong>Email:</strong> ${data.email_order}</p>
            <h3>Order Items:</h3>
    `;

    orderItems.forEach(item => {
        modalContent += `
            <div class="order-item">
                <p><strong>Design Name:</strong> ${item.design_name}</p>
                <p><strong>Silicon Grip:</strong> ${item.silicon_grip ? 'Yes' : 'No'}</p>
                <p><strong>Total Quantity:</strong> ${item.item_total_quantity}</p>
                <p><strong>Sizes:</strong></p>
                <ul>
                    ${Object.entries(item.sizes).map(([size, quantity]) => `
                        <li>${size}: ${quantity}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    });

    modalContent += '</div>';

    // Display the modal with order details
    const modal = document.getElementById('order-details-modal');
    modal.innerHTML = modalContent;
    modal.style.display = 'block';

    // Close modal when clicking on the close button
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('order-details-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Initialize the table
updateTable();

// Update the showOrderDetails function in admin.js
function showOrderDetails(orderId) {
    const orderDetailsUrl = `order-details.html?orderId=${encodeURIComponent(orderId)}`;
    window.open(orderDetailsUrl, '_blank');
}
// Function to find shortcode by design name or custom name
async function findShortCodeByName(designName) {
    const { data, error } = await supabase
        .from('user_files')
        .select('short_code')
        .or(`design_name.eq."${designName}",custom_name.eq."${designName}"`)
        .single();

    if (error) {
        console.error('Error finding shortcode:', error);
        return null;
    }

    return data ? data.short_code : null;
}

// Function to open design details page
async function openDesignDetails(designName) {
    const shortCode = await findShortCodeByName(designName);
    if (shortCode) {
        window.open(`admin-design.html?shortCode=${encodeURIComponent(shortCode)}`, '_blank');
    } else {
        console.error('Shortcode not found for design:', designName);
        window.translatedAlert('design_details_not_found');
    }
}
// Make functions globally accessible
window.openDesignDetails = openDesignDetails;
window.showOrderDetails = showOrderDetails;
window.goToPage = goToPage;