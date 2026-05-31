// =============================================
// Admin Panel - کافه آرا ARA Cafe (نسخه Local)
// =============================================
// 🟢 این پنل فقط روی کامپیوتر خودتان کار می‌کند
// 🟢 بعد از اضافه کردن محصولات، فایل data/menu.json را
// 🟢 روی GitHub پوش کنید تا روی سایت نمایش داده شود

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'cafe123';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// =============================================
// Login
// =============================================
function isLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

function initLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (isLoggedIn()) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        initAdminPanel();
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                if (loginScreen) loginScreen.style.display = 'none';
                if (adminPanel) adminPanel.style.display = 'block';
                initAdminPanel();
            } else {
                if (loginError) loginError.textContent = '❌ نام کاربری یا رمز عبور اشتباه است';
            }
        });
    }
}

// =============================================
// Menu Data Management (Local Storage)
// =============================================
function getMenuData() {
    const stored = localStorage.getItem('cafeMenuData');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing data');
        }
    }
    
    const emptyData = { hot: [], cold: [], tea: [] };
    localStorage.setItem('cafeMenuData', JSON.stringify(emptyData));
    return emptyData;
}

function saveMenuData(data) {
    localStorage.setItem('cafeMenuData', JSON.stringify(data));
}

// 🆕 خروجی گرفتن برای فایل JSON
function exportToJSON() {
    const data = getMenuData();
    const jsonStr = JSON.stringify(data, null, 2);
    
    // نمایش در console
    console.log('📋 محتوای فایل menu.json:');
    console.log(jsonStr);
    
    // دانلود فایل
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ فایل menu.json دانلود شد!\n\n📁 آن را در پوشه data/ جایگزین کنید\n📤 سپس روی GitHub پوش کنید');
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

function formatPrice(price) {
    return parseInt(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' تومان';
}

const categoryNames = {
    hot: 'نوشیدنی گرم',
    cold: 'نوشیدنی سرد',
    tea: 'چای و دمنوش'
};

// =============================================
// Find Item
// =============================================
function findItemById(itemId) {
    const data = getMenuData();
    for (const category in data) {
        const items = data[category];
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === itemId) {
                return { item: items[i], category: category, index: i };
            }
        }
    }
    return null;
}

// =============================================
// Delete Product
// =============================================
function deleteProduct(itemId) {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
    
    const result = findItemById(itemId);
    if (!result) { alert('❌ محصول پیدا نشد!'); return; }
    
    const data = getMenuData();
    data[result.category].splice(result.index, 1);
    saveMenuData(data);
    
    renderProducts(getCurrentFilter());
    showNotification('✅ محصول حذف شد');
}

// =============================================
// Edit Product
// =============================================
function editProduct(itemId) {
    const result = findItemById(itemId);
    if (!result) { alert('❌ محصول پیدا نشد!'); return; }
    
    const item = result.item;
    
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemDescription').value = item.description || '';
    document.getElementById('editItemCategory').value = item.category;
    
    const preview = document.getElementById('editImagePreview');
    const container = document.getElementById('editImageUploadContainer');
    
    if (preview) {
        if (item.image) {
            preview.innerHTML = `<img src="${item.image}" alt="Preview" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">`;
        } else {
            preview.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>برای آپلود عکس کلیک کنید</span>`;
        }
    }
    
    const modal = document.getElementById('editModal');
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
    
    const id = document.getElementById('editItemId').value;
    const name = document.getElementById('editItemName').value.trim();
    const price = parseInt(document.getElementById('editItemPrice').value);
    const description = document.getElementById('editItemDescription').value.trim();
    const category = document.getElementById('editItemCategory').value;
    
    if (!name || !price || isNaN(price)) {
        alert('❌ لطفاً نام و قیمت معتبر وارد کنید');
        return;
    }
    
    const data = getMenuData();
    
    let image = '';
    const oldItem = findItemById(id);
    if (oldItem) image = oldItem.item.image || '';
    
    const fileInput = document.getElementById('editItemImage');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image = e.target.result;
            finishEdit(data, id, name, price, description, category, image);
        };
        reader.readAsDataURL(fileInput.files[0]);
        return;
    }
    
    finishEdit(data, id, name, price, description, category, image);
}

function finishEdit(data, id, name, price, description, category, image) {
    for (const cat in data) {
        const index = data[cat].findIndex(i => i.id === id);
        if (index !== -1) { data[cat].splice(index, 1); break; }
    }
    
    const updatedItem = { id, name, price, description, category, image };
    data[category].push(updatedItem);
    saveMenuData(data);
    
    const modal = document.getElementById('editModal');
    if (modal) { modal.classList.remove('active'); modal.style.display = 'none'; }
    
    renderProducts(getCurrentFilter());
    showNotification('✅ محصول ویرایش شد');
}

// =============================================
// Add Product
// =============================================
function addProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('itemName').value.trim();
    const price = parseInt(document.getElementById('itemPrice').value);
    const description = document.getElementById('itemDescription').value.trim();
    const category = document.getElementById('itemCategory').value;
    
    if (!name || !price || !category || isNaN(price)) {
        alert('❌ لطفاً تمام فیلدها را پر کنید');
        return;
    }
    
    let image = '';
    const fileInput = document.getElementById('itemImage');
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image = e.target.result;
            finishAddProduct(name, price, description, category, image);
        };
        reader.readAsDataURL(fileInput.files[0]);
        return;
    }
    
    finishAddProduct(name, price, description, category, image);
}

function finishAddProduct(name, price, description, category, image) {
    const data = getMenuData();
    
    const newItem = {
        id: generateId(),
        name, price, description, category, image
    };
    
    data[category].push(newItem);
    saveMenuData(data);
    
    const form = document.getElementById('addItemForm');
    if (form) form.reset();
    
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>برای آپلود عکس کلیک کنید</span>`;
    }
    
    renderProducts(getCurrentFilter());
    showNotification('✅ محصول اضافه شد');
}

// =============================================
// Render Products
// =============================================
function getCurrentFilter() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
}

function renderProducts(filter = 'all') {
    const data = getMenuData();
    const productsList = document.getElementById('productsList');
    if (!productsList) return;

    let allItems = [];
    if (filter === 'all') {
        allItems = [...data.hot, ...data.cold, ...data.tea];
    } else {
        allItems = data[filter] || [];
    }

    if (allItems.length === 0) {
        productsList.innerHTML = `<div style="text-align:center;padding:60px;color:#8D6E63;"><p style="font-size:1.2rem;">🚀 هیچ محصولی وجود ندارد</p><p style="font-size:0.9rem;">از فرم بالا محصول اضافه کنید</p></div>`;
        return;
    }

    let html = '';
    allItems.forEach(item => {
        html += `
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;border:1px solid rgba(141,110,99,0.2);display:flex;gap:16px;align-items:center;margin-bottom:12px;">
                <div style="width:80px;height:80px;border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.2);flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                    ${item.image ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;">` : '<span style="font-size:2rem;">☕</span>'}
                </div>
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <strong style="color:#D7CCC8;">${item.name}</strong>
                        <span style="color:#4FC3F7;">${formatPrice(item.price)}</span>
                    </div>
                    ${item.description ? `<p style="color:#9e9e9e;font-size:0.85rem;margin-bottom:8px;">${item.description}</p>` : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="background:rgba(141,110,99,0.2);color:#8D6E63;padding:3px 10px;border-radius:20px;font-size:0.75rem;">${categoryNames[item.category]}</span>
                        <div style="display:flex;gap:6px;">
                            <button onclick="editProduct('${item.id}')" style="background:rgba(79,195,247,0.15);color:#4FC3F7;border:1px solid rgba(79,195,247,0.3);padding:6px 14px;border-radius:6px;cursor:pointer;">✏️ ویرایش</button>
                            <button onclick="deleteProduct('${item.id}')" style="background:rgba(255,107,107,0.15);color:#ff6b6b;border:1px solid rgba(255,107,107,0.3);padding:6px 14px;border-radius:6px;cursor:pointer;">🗑️ حذف</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsList.innerHTML = html;
}

// =============================================
// Filters, Modal, Logout, etc.
// =============================================
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderProducts(this.dataset.filter);
        });
    });
}

function initModal() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.getElementById('modalClose');
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
    }
}

function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            if (confirm('خروج؟')) {
                sessionStorage.removeItem('adminLoggedIn');
                location.reload();
            }
        });
    }
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = 'position:fixed;top:20px;right:20px;padding:14px 24px;background:#43A047;color:#fff;border-radius:10px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.3);font-family:inherit;';
    document.body.appendChild(notif);
    setTimeout(() => { notif.remove(); }, 3000);
}

// =============================================
// 🆕 Add Export Button
// =============================================
function addExportButton() {
    const adminActions = document.querySelector('.admin-actions');
    if (adminActions) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-preview';
        exportBtn.textContent = '📥 خروجی JSON';
        exportBtn.style.cssText = 'background:rgba(102,187,106,0.2);color:#66BB6A;border:1px solid rgba(102,187,106,0.3);margin-right:8px;';
        exportBtn.onclick = exportToJSON;
        adminActions.insertBefore(exportBtn, adminActions.firstChild);
    }
}

// =============================================
// Init
// =============================================
function initAdminPanel() {
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
    
    const addForm = document.getElementById('addItemForm');
    if (addForm) addForm.addEventListener('submit', addProduct);
    
    const editForm = document.getElementById('editItemForm');
    if (editForm) editForm.addEventListener('submit', saveEdit);
    
    renderProducts();
    initFilters();
    initModal();
    initLogout();
    addExportButton();
    
    console.log('☕ پنل مدیریت کافه آرا');
    console.log('💡 بعد از اضافه کردن محصولات، دکمه "خروجی JSON" را بزنید');
    console.log('📁 فایل را در data/menu.json جایگزین کنید');
    console.log('📤 سپس روی GitHub پوش کنید');
}

document.addEventListener('DOMContentLoaded', initLogin);