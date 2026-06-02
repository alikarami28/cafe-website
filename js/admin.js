// =============================================
// Admin Panel - کافه آرا ARA Cafe
// =============================================

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'cafe123';

// =============================================
// Login
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    
    // چک کن قبلاً لاگین شده یا نه
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showPanel();
        return;
    }
    
    // فرم لاگین
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var username = document.getElementById('username').value.trim();
        var password = document.getElementById('password').value.trim();
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showPanel();
        } else {
            document.getElementById('loginError').textContent = 'نام کاربری یا رمز عبور اشتباه است';
        }
    });
});

function showPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    initAdminPanel();
}

// =============================================
// Data
// =============================================
function getMenuData() {
    var stored = localStorage.getItem('cafeMenuData');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {}
    }
    
    var emptyData = { hot: [], cold: [], tea: [] };
    localStorage.setItem('cafeMenuData', JSON.stringify(emptyData));
    return emptyData;
}

function saveMenuData(data) {
    localStorage.setItem('cafeMenuData', JSON.stringify(data));
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

function formatPrice(price) {
    return parseInt(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' تومان';
}

var categoryNames = {
    hot: 'نوشیدنی گرم',
    cold: 'نوشیدنی سرد',
    tea: 'چای و دمنوش'
};

// =============================================
// Find Item
// =============================================
function findItemById(itemId) {
    var data = getMenuData();
    for (var category in data) {
        var items = data[category];
        if (items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === itemId) {
                    return { item: items[i], category: category, index: i };
                }
            }
        }
    }
    return null;
}

// =============================================
// Delete
// =============================================
function deleteProduct(itemId) {
    if (!confirm('حذف این محصول؟')) return;
    
    var result = findItemById(itemId);
    if (!result) {
        alert('محصول پیدا نشد!');
        return;
    }
    
    var data = getMenuData();
    data[result.category].splice(result.index, 1);
    saveMenuData(data);
    renderProducts(getCurrentFilter());
    alert('حذف شد');
}

// =============================================
// Edit
// =============================================
function editProduct(itemId) {
    var result = findItemById(itemId);
    if (!result) {
        alert('محصول پیدا نشد!');
        return;
    }
    
    var item = result.item;
    
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemDescription').value = item.description || '';
    document.getElementById('editItemCategory').value = item.category;
    document.getElementById('editItemOrder').value = item.order || 1;
    document.getElementById('editItemImage').value = item.image || '';
    
    var preview = document.getElementById('editImagePreviewContainer');
    if (preview) {
        if (item.image && item.image.trim() !== '') {
            preview.innerHTML = '<img src="' + item.image + '" style="width:200px;height:200px;object-fit:cover;border-radius:8px;">';
        } else {
            preview.innerHTML = '<p style="color:#8D6E63;">عکسی ثبت نشده</p>';
        }
    }
    
    var modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

// =============================================
// Save Edit
// =============================================
function saveEdit(e) {
    e.preventDefault();
    
    var id = document.getElementById('editItemId').value;
    var name = document.getElementById('editItemName').value.trim();
    var price = parseInt(document.getElementById('editItemPrice').value);
    var description = document.getElementById('editItemDescription').value.trim();
    var category = document.getElementById('editItemCategory').value;
    var order = parseInt(document.getElementById('editItemOrder').value) || 1;
    var image = document.getElementById('editItemImage').value.trim();
    
    if (!name || !price || isNaN(price)) {
        alert('نام و قیمت الزامی است');
        return;
    }
    
    var data = getMenuData();
    
    // Remove old
    for (var cat in data) {
        if (data[cat]) {
            for (var i = 0; i < data[cat].length; i++) {
                if (data[cat][i].id === id) {
                    data[cat].splice(i, 1);
                    break;
                }
            }
        }
    }
    
    // Add new
    if (!data[category]) data[category] = [];
    
    data[category].push({
        id: id,
        name: name,
        price: price,
        description: description,
        category: category,
        order: order,
        image: image
    });
    
    saveMenuData(data);
    
    // Close modal
    var modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    
    renderProducts(getCurrentFilter());
    alert('ذخیره شد');
}

// =============================================
// Add Product
// =============================================
function addProduct(e) {
    e.preventDefault();
    
    var name = document.getElementById('itemName').value.trim();
    var price = parseInt(document.getElementById('itemPrice').value);
    var description = document.getElementById('itemDescription').value.trim();
    var category = document.getElementById('itemCategory').value;
    var order = parseInt(document.getElementById('itemOrder').value) || 1;
    var image = document.getElementById('itemImage').value.trim();
    
    if (!name || !price || !category || isNaN(price)) {
        alert('همه فیلدهای ضروری را پر کنید');
        return;
    }
    
    var data = getMenuData();
    
    if (!data[category]) data[category] = [];
    
    data[category].push({
        id: generateId(),
        name: name,
        price: price,
        description: description,
        category: category,
        order: order,
        image: image
    });
    
    saveMenuData(data);
    
    document.getElementById('addItemForm').reset();
    document.getElementById('itemOrder').value = '1';
    
    var preview = document.getElementById('imagePreviewContainer');
    if (preview) {
        preview.innerHTML = '<p style="color:#8D6E63;">مسیر عکس را وارد کنید</p>';
    }
    
    renderProducts(getCurrentFilter());
    alert('محصول اضافه شد');
}

// =============================================
// Render
// =============================================
function getCurrentFilter() {
    var activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
}

function renderProducts(filter) {
    if (!filter) filter = getCurrentFilter();
    
    var data = getMenuData();
    var productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    var allItems = [];
    
    if (filter === 'all') {
        if (data.hot) allItems = allItems.concat(data.hot);
        if (data.cold) allItems = allItems.concat(data.cold);
        if (data.tea) allItems = allItems.concat(data.tea);
    } else {
        allItems = data[filter] || [];
    }
    
    allItems.sort(function(a, b) {
        return (a.order || 999) - (b.order || 999);
    });
    
    if (allItems.length === 0) {
        productsList.innerHTML = '<div style="text-align:center;padding:60px;color:#8D6E63;"><p>هیچ محصولی وجود ندارد</p><p>از فرم بالا محصول اضافه کنید</p></div>';
        return;
    }
    
    var html = '';
    allItems.forEach(function(item) {
        html += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px 16px;border:1px solid rgba(141,110,99,0.2);display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px;">';
        html += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">';
        html += '<span style="color:#8D6E63;font-weight:bold;">#' + (item.order || 1) + '</span>';
        html += '<strong style="color:#D7CCC8;">' + item.name + '</strong>';
        html += '<span style="color:#4FC3F7;">' + formatPrice(item.price) + '</span>';
        html += '<span style="background:rgba(141,110,99,0.2);color:#8D6E63;padding:2px 8px;border-radius:12px;font-size:0.7rem;">' + (categoryNames[item.category] || item.category) + '</span>';
        html += '</div>';
        html += '<div style="display:flex;gap:6px;">';
        html += '<button onclick="editProduct(\'' + item.id + '\')" style="background:rgba(79,195,247,0.15);color:#4FC3F7;border:1px solid rgba(79,195,247,0.3);padding:5px 12px;border-radius:6px;cursor:pointer;">ویرایش</button>';
        html += '<button onclick="deleteProduct(\'' + item.id + '\')" style="background:rgba(255,107,107,0.15);color:#ff6b6b;border:1px solid rgba(255,107,107,0.3);padding:5px 12px;border-radius:6px;cursor:pointer;">حذف</button>';
        html += '</div>';
        html += '</div>';
    });
    
    productsList.innerHTML = html;
}

// =============================================
// Export
// =============================================
function exportToJSON() {
    var data = getMenuData();
    var jsonStr = JSON.stringify(data, null, 2);
    
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'menu.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert('فایل menu.json دانلود شد!');
}

// =============================================
// Init
// =============================================
function initAdminPanel() {
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
    
    document.getElementById('addItemForm').addEventListener('submit', addProduct);
    document.getElementById('editItemForm').addEventListener('submit', saveEdit);
    
    renderProducts();
    
    // Filters
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            renderProducts(this.dataset.filter);
        });
    });
    
    // Modal
    var modal = document.getElementById('editModal');
    document.getElementById('modalClose').addEventListener('click', function() {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('خروج؟')) {
            sessionStorage.removeItem('adminLoggedIn');
            location.reload();
        }
    });
    
    // Export button
    var exportBtn = document.createElement('button');
    exportBtn.textContent = '📥 خروجی JSON';
    exportBtn.style.cssText = 'background:rgba(102,187,106,0.2);color:#66BB6A;border:1px solid rgba(102,187,106,0.3);padding:8px 16px;border-radius:8px;cursor:pointer;margin-right:8px;font-family:inherit;';
    exportBtn.onclick = exportToJSON;
    
    var adminActions = document.querySelector('.admin-actions');
    if (adminActions) {
        adminActions.appendChild(exportBtn);
    }
}