// =============================================
// Admin Panel - کافه آرا ARA Cafe
// =============================================

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'cafe123';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

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
// Menu Data
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
// 🆕 Image Upload Handler
// =============================================
let addFormImageData = '';  // ذخیره عکس فرم افزودن
let editFormImageData = ''; // ذخیره عکس فرم ویرایش

// راه‌اندازی آپلود عکس برای فرم افزودن
function initAddImageUpload() {
    const container = document.getElementById('imageUploadContainer');
    const input = document.getElementById('itemImage');
    const preview = document.getElementById('imagePreview');
    
    if (!container || !input || !preview) return;
    
    // کلیک روی container
    container.addEventListener('click', function() {
        input.click();
    });
    
    // انتخاب فایل
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // بررسی نوع فایل
        if (!file.type.startsWith('image/')) {
            alert('❌ فقط فایل تصویری مجاز است');
            input.value = '';
            return;
        }
        
        // بررسی حجم
        if (file.size > MAX_IMAGE_SIZE) {
            alert('❌ حجم فایل نباید بیشتر از 2 مگابایت باشد');
            input.value = '';
            return;
        }
        
        // خواندن فایل
        const reader = new FileReader();
        reader.onload = function(e) {
            addFormImageData = e.target.result;
            preview.innerHTML = `<img src="${addFormImageData}" alt="Preview" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">`;
            container.classList.add('has-image');
            console.log('✅ عکس افزودن آماده شد');
        };
        reader.onerror = function() {
            alert('❌ خطا در خواندن فایل');
        };
        reader.readAsDataURL(file);
    });
    
    // Drag & Drop
    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        container.classList.add('drag-over');
    });
    
    container.addEventListener('dragleave', function() {
        container.classList.remove('drag-over');
    });
    
    container.addEventListener('drop', function(e) {
        e.preventDefault();
        container.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
}

// راه‌اندازی آپلود عکس برای فرم ویرایش
function initEditImageUpload() {
    const container = document.getElementById('editImageUploadContainer');
    const input = document.getElementById('editItemImage');
    const preview = document.getElementById('editImagePreview');
    
    if (!container || !input || !preview) return;
    
    // کلیک روی container
    container.addEventListener('click', function(e) {
        // اگه روی دکمه‌ها کلیک شده، هیچ کاری نکن
        if (e.target.closest('button')) return;
        input.click();
    });
    
    // انتخاب فایل
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('❌ فقط فایل تصویری مجاز است');
            input.value = '';
            return;
        }
        
        if (file.size > MAX_IMAGE_SIZE) {
            alert('❌ حجم فایل نباید بیشتر از 2 مگابایت باشد');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            editFormImageData = e.target.result;
            preview.innerHTML = `
                <img src="${editFormImageData}" alt="Preview" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button type="button" onclick="document.getElementById('editItemImage').click()" style="background:rgba(79,195,247,0.2);color:#4FC3F7;border:1px solid rgba(79,195,247,0.3);padding:6px 12px;border-radius:6px;cursor:pointer;">🔄 تغییر</button>
                    <button type="button" onclick="removeEditImage()" style="background:rgba(255,107,107,0.2);color:#ff6b6b;border:1px solid rgba(255,107,107,0.3);padding:6px 12px;border-radius:6px;cursor:pointer;">🗑️ حذف</button>
                </div>
            `;
            container.classList.add('has-image');
            console.log('✅ عکس ویرایش آماده شد');
        };
        reader.onerror = function() {
            alert('❌ خطا در خواندن فایل');
        };
        reader.readAsDataURL(file);
    });
    
    // Drag & Drop
    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        container.classList.add('drag-over');
    });
    
    container.addEventListener('dragleave', function() {
        container.classList.remove('drag-over');
    });
    
    container.addEventListener('drop', function(e) {
        e.preventDefault();
        container.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
}

// حذف عکس در فرم ویرایش
function removeEditImage() {
    editFormImageData = '';
    const preview = document.getElementById('editImagePreview');
    const container = document.getElementById('editImageUploadContainer');
    const input = document.getElementById('editItemImage');
    
    if (preview) {
        preview.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style="opacity:0.7;">برای آپلود عکس کلیک کنید</span>
        `;
    }
    if (container) container.classList.remove('has-image');
    if (input) input.value = '';
    console.log('🗑️ عکس ویرایش حذف شد');
}

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
// Edit Product - Open Modal
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
    
    // Reset image
    editFormImageData = item.image || '';
    const preview = document.getElementById('editImagePreview');
    const container = document.getElementById('editImageUploadContainer');
    const input = document.getElementById('editItemImage');
    
    if (input) input.value = '';
    
    if (preview) {
        if (editFormImageData) {
            preview.innerHTML = `
                <img src="${editFormImageData}" alt="Preview" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button type="button" onclick="document.getElementById('editItemImage').click()" style="background:rgba(79,195,247,0.2);color:#4FC3F7;border:1px solid rgba(79,195,247,0.3);padding:6px 12px;border-radius:6px;cursor:pointer;">🔄 تغییر</button>
                    <button type="button" onclick="removeEditImage()" style="background:rgba(255,107,107,0.2);color:#ff6b6b;border:1px solid rgba(255,107,107,0.3);padding:6px 12px;border-radius:6px;cursor:pointer;">🗑️ حذف</button>
                </div>
            `;
            if (container) container.classList.add('has-image');
        } else {
            preview.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span style="opacity:0.7;">برای آپلود عکس کلیک کنید</span>
            `;
            if (container) container.classList.remove('has-image');
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
    
    // حذف آیتم قدیمی
    for (const cat in data) {
        const index = data[cat].findIndex(i => i.id === id);
        if (index !== -1) { data[cat].splice(index, 1); break; }
    }
    
    // اضافه کردن آیتم جدید با عکس
    const updatedItem = {
        id: id,
        name: name,
        price: price,
        description: description,
        category: category,
        image: editFormImageData  // 🆕 عکس از متغیر global
    };
    
    data[category].push(updatedItem);
    saveMenuData(data);
    
    // بستن مودال
    const modal = document.getElementById('editModal');
    if (modal) { modal.classList.remove('active'); modal.style.display = 'none'; }
    
    // ریست عکس
    editFormImageData = '';
    
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
    
    const data = getMenuData();
    
    const newItem = {
        id: generateId(),
        name: name,
        price: price,
        description: description,
        category: category,
        image: addFormImageData  // 🆕 عکس از متغیر global
    };
    
    data[category].push(newItem);
    saveMenuData(data);
    
    // ریست فرم
    const form = document.getElementById('addItemForm');
    if (form) form.reset();
    
    // ریست preview عکس
    const preview = document.getElementById('imagePreview');
    const container = document.getElementById('imageUploadContainer');
    const input = document.getElementById('itemImage');
    
    if (preview) {
        preview.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style="opacity:0.7;">برای آپلود عکس کلیک کنید</span>
        `;
    }
    if (container) container.classList.remove('has-image');
    if (input) input.value = '';
    
    // ریست متغیر عکس
    addFormImageData = '';
    
    renderProducts(getCurrentFilter());
    showNotification('✅ محصول اضافه شد');
}

// =============================================
// Export JSON
// =============================================
function exportToJSON() {
    const data = getMenuData();
    const jsonStr = JSON.stringify(data, null, 2);
    
    console.log('📋 محتوای menu.json:');
    console.log(jsonStr);
    
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
        productsList.innerHTML = `
            <div style="text-align:center;padding:60px;color:#8D6E63;">
                <p style="font-size:1.2rem;">🚀 هیچ محصولی وجود ندارد</p>
                <p style="font-size:0.9rem;">از فرم بالا محصول اضافه کنید</p>
            </div>`;
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
// Filters, Modal, Logout
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
// Add Export Button
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
// Init Admin Panel
// =============================================
function initAdminPanel() {
    // Global functions
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
    window.removeEditImage = removeEditImage;
    
    // Init image uploads
    initAddImageUpload();
    initEditImageUpload();
    
    // Forms
    const addForm = document.getElementById('addItemForm');
    if (addForm) addForm.addEventListener('submit', addProduct);
    
    const editForm = document.getElementById('editItemForm');
    if (editForm) editForm.addEventListener('submit', saveEdit);
    
    // Init components
    renderProducts();
    initFilters();
    initModal();
    initLogout();
    addExportButton();
    
    console.log('☕ پنل مدیریت کافه آرا - آماده');
    console.log('📸 آپلود عکس فعال است');
    console.log('💡 بعد از اضافه کردن محصولات، دکمه "خروجی JSON" را بزنید');
}

// =============================================
// Start
// =============================================
document.addEventListener('DOMContentLoaded', initLogin);