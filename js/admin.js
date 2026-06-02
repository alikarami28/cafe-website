const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'cafe123';

function isLoggedIn() { return sessionStorage.getItem('adminLoggedIn') === 'true'; }

function initLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    if (isLoggedIn()) { loginScreen.style.display = 'none'; adminPanel.style.display = 'block'; initAdminPanel(); return; }
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (document.getElementById('username').value.trim() === ADMIN_USERNAME && document.getElementById('password').value.trim() === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            loginScreen.style.display = 'none'; adminPanel.style.display = 'block'; initAdminPanel();
        } else { document.getElementById('loginError').textContent = 'نام کاربری یا رمز عبور اشتباه است'; }
    });
}

function getMenuData() {
    const stored = localStorage.getItem('cafeMenuData');
    if (stored) try { return JSON.parse(stored); } catch (e) {}
    const d = { hot: [], cold: [], tea: [] };
    localStorage.setItem('cafeMenuData', JSON.stringify(d));
    return d;
}

function saveMenuData(data) { localStorage.setItem('cafeMenuData', JSON.stringify(data)); }
function generateId() { return 'id_' + Date.now(); }
function formatPrice(p) { return parseInt(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' تومان'; }
const catNames = { hot: 'نوشیدنی گرم', cold: 'نوشیدنی سرد', tea: 'چای و دمنوش' };

function findItemById(id) {
    const data = getMenuData();
    for (const cat in data) {
        for (let i = 0; i < data[cat].length; i++) {
            if (data[cat][i].id === id) return { item: data[cat][i], category: cat, index: i };
        }
    }
    return null;
}

function deleteProduct(id) {
    if (!confirm('حذف؟')) return;
    const r = findItemById(id);
    if (!r) return alert('پیدا نشد!');
    const data = getMenuData();
    data[r.category].splice(r.index, 1);
    saveMenuData(data);
    renderProducts(getCurrentFilter());
    alert('حذف شد');
}

function editProduct(id) {
    const r = findItemById(id);
    if (!r) return alert('پیدا نشد!');
    const item = r.item;
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemCategory').value = item.category;
    document.getElementById('editItemOrder').value = item.order || 1;
    document.getElementById('editItemDescription').value = item.description || '';
    document.getElementById('editItemImage').value = item.image || '';
    document.getElementById('editModal').classList.add('active');
    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit(e) {
    e.preventDefault();
    const id = document.getElementById('editItemId').value;
    const name = document.getElementById('editItemName').value.trim();
    const price = parseInt(document.getElementById('editItemPrice').value);
    const category = document.getElementById('editItemCategory').value;
    const order = parseInt(document.getElementById('editItemOrder').value) || 1;
    const description = document.getElementById('editItemDescription').value.trim();
    const image = document.getElementById('editItemImage').value.trim();
    if (!name || !price) return alert('نام و قیمت الزامی است');
    const data = getMenuData();
    for (const cat in data) { const idx = data[cat].findIndex(i => i.id === id); if (idx !== -1) { data[cat].splice(idx, 1); break; } }
    data[category].push({ id, name, price, category, order, description, image });
    saveMenuData(data);
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editModal').style.display = 'none';
    renderProducts(getCurrentFilter());
    alert('ذخیره شد');
}

function addProduct(e) {
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const price = parseInt(document.getElementById('itemPrice').value);
    const category = document.getElementById('itemCategory').value;
    const order = parseInt(document.getElementById('itemOrder').value) || 1;
    const description = document.getElementById('itemDescription').value.trim();
    const image = document.getElementById('itemImage').value.trim();
    if (!name || !price || !category) return alert('فیلدهای ضروری را پر کنید');
    const data = getMenuData();
    data[category].push({ id: generateId(), name, price, category, order, description, image });
    saveMenuData(data);
    document.getElementById('addItemForm').reset();
    renderProducts(getCurrentFilter());
    alert('اضافه شد');
}

function getCurrentFilter() { const a = document.querySelector('.filter-btn.active'); return a ? a.dataset.filter : 'all'; }

function renderProducts(filter) {
    filter = filter || getCurrentFilter();
    const data = getMenuData();
    let items = [];
    if (filter === 'all') items = [...data.hot, ...data.cold, ...data.tea];
    else items = data[filter] || [];
    items.sort((a, b) => (a.order || 999) - (b.order || 999));
    const list = document.getElementById('productsList');
    if (items.length === 0) { list.innerHTML = '<p style="text-align:center;padding:40px;color:#8D6E63;">محصولی وجود ندارد</p>'; return; }
    let html = '';
    items.forEach(item => {
        html += `<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px 16px;border:1px solid rgba(141,110,99,0.2);display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div style="display:flex;gap:12px;align-items:center;">
                <span style="color:#8D6E63;font-weight:bold;min-width:30px;">#${item.order || 1}</span>
                <strong style="color:#D7CCC8;">${item.name}</strong>
                <span style="color:#4FC3F7;">${formatPrice(item.price)}</span>
                <span style="color:#8D6E63;font-size:0.8rem;">${catNames[item.category]}</span>
            </div>
            <div style="display:flex;gap:8px;">
                <button onclick="editProduct('${item.id}')" style="background:rgba(79,195,247,0.2);color:#4FC3F7;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">✏️</button>
                <button onclick="deleteProduct('${item.id}')" style="background:rgba(255,107,107,0.2);color:#ff6b6b;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">🗑️</button>
            </div>
        </div>`;
    });
    list.innerHTML = html;
}

function exportJSON() {
    const data = getMenuData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'menu.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

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
    document.getElementById('modalClose').addEventListener('click', () => { modal.classList.remove('active'); modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('active'); modal.style.display = 'none'; } });
}

function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => { if (confirm('خروج؟')) { sessionStorage.removeItem('adminLoggedIn'); location.reload(); } });
}

function initAdminPanel() {
    window.deleteProduct = deleteProduct;
    window.editProduct = editProduct;
    document.getElementById('addItemForm').addEventListener('submit', addProduct);
    document.getElementById('editItemForm').addEventListener('submit', saveEdit);
    renderProducts();
    initFilters();
    initModal();
    initLogout();
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📥 خروجی JSON';
    exportBtn.style.cssText = 'background:rgba(102,187,106,0.2);color:#66BB6A;border:1px solid rgba(102,187,106,0.3);padding:8px 16px;border-radius:8px;cursor:pointer;margin-right:8px;';
    exportBtn.onclick = exportJSON;
    document.querySelector('.admin-actions').appendChild(exportBtn);
}

document.addEventListener('DOMContentLoaded', initLogin);