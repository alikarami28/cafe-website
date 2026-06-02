let menuData = { hot: [], cold: [], tea: [] };
let selectedItems = [];

// لود منو
async function loadMenu() {
    try {
        const res = await fetch('data/menu.json');
        if (res.ok) menuData = await res.json();
    } catch (e) {}
    renderProducts('all');
}

// نمایش محصولات
function renderProducts(category) {
    let items = [];
    if (category === 'all') {
        items = [...(menuData.hot || []), ...(menuData.cold || []), ...(menuData.tea || [])];
    } else {
        items = menuData[category] || [];
    }
    items.sort((a, b) => (a.order || 999) - (b.order || 999));

    const grid = document.getElementById('productsGrid');
    if (items.length === 0) {
        grid.innerHTML = '<p class="empty-state">محصولی نیست</p>';
        return;
    }

    grid.innerHTML = items.map(item => {
        const isSelected = selectedItems.find(s => s.id === item.id);
        return `
            <div class="product-card ${isSelected ? 'selected' : ''}" onclick="toggleItem('${item.id}')">
                <div class="product-card-name">${item.name}</div>
                <div class="product-card-price">${formatPrice(item.price)}</div>
                ${isSelected ? '<div style="color:green;margin-top:4px;">✓ انتخاب شده</div>' : ''}
            </div>
        `;
    }).join('');
}

// انتخاب/حذف محصول
function toggleItem(id) {
    const allItems = [...(menuData.hot || []), ...(menuData.cold || []), ...(menuData.tea || [])];
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    const existing = selectedItems.find(s => s.id === id);
    if (existing) {
        selectedItems = selectedItems.filter(s => s.id !== id);
    } else {
        selectedItems.push({ ...item, qty: 1 });
    }

    const activeCategory = document.querySelector('.category-tab.active').dataset.category;
    renderProducts(activeCategory);
    renderOrderItems();
}

// نمایش سفارشات
function renderOrderItems() {
    const container = document.getElementById('orderItems');
    const totalSection = document.getElementById('totalSection');

    if (selectedItems.length === 0) {
        container.innerHTML = '<p class="empty-state">محصولی انتخاب نشده</p>';
        totalSection.style.display = 'none';
        return;
    }

    let html = '';
    let total = 0;

    selectedItems.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        html += `
            <div class="item-row">
                <span class="item-row-name">${item.name}</span>
                <span class="item-row-price">${formatPrice(item.price)}</span>
                <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                <span class="item-row-total">${formatPrice(itemTotal)}</span>
                <button class="delete-btn" onclick="removeItem(${index})">✕</button>
            </div>
        `;
    });

    container.innerHTML = html;
    totalSection.style.display = 'block';
    document.getElementById('totalPrice').textContent = total.toLocaleString('fa-IR');
}

// تغییر تعداد
function changeQty(index, delta) {
    selectedItems[index].qty += delta;
    if (selectedItems[index].qty < 1) selectedItems[index].qty = 1;
    renderOrderItems();
}

// حذف آیتم
function removeItem(index) {
    selectedItems.splice(index, 1);
    const activeCategory = document.querySelector('.category-tab.active').dataset.category;
    renderProducts(activeCategory);
    renderOrderItems();
}

// حذف همه
function clearOrder() {
    if (!confirm('حذف همه سفارشات؟')) return;
    selectedItems = [];
    const activeCategory = document.querySelector('.category-tab.active').dataset.category;
    renderProducts(activeCategory);
    renderOrderItems();
}

// چاپ فاکتور
function printOrder() {
    if (selectedItems.length === 0) return alert('محصولی انتخاب نشده!');

    const customerName = document.getElementById('customerName').value || '---------';
    const customerPhone = document.getElementById('customerPhone').value || '---------';
    const customerTable = document.getElementById('customerTable').value || '---------';
    const orderNote = document.getElementById('orderNote').value || '---------';

    let total = 0;
    let itemsHTML = '';
    selectedItems.forEach((item, i) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        itemsHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${item.name}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${item.qty}</td>
                <td>${formatPrice(itemTotal)}</td>
            </tr>
        `;
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاکتور - کافه آرا</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Tahoma, sans-serif; padding: 30px; direction: rtl; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
                .header h1 { font-size: 22px; margin-bottom: 5px; }
                .header p { font-size: 14px; color: #666; }
                .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
                .info div { flex: 1; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 13px; }
                th { background: #3E2723; color: #fff; }
                .total { text-align: left; font-size: 18px; font-weight: bold; margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
                @media print { body { padding: 10px; } button { display: none; } }
                button { padding: 10px 20px; background: #3E2723; color: #fff; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🧾 فاکتور سفارش</h1>
                <p>کافه آرا - ARA Cafe</p>
                <p>تاریخ: ${new Date().toLocaleDateString('fa-IR')} | ساعت: ${new Date().toLocaleTimeString('fa-IR')}</p>
            </div>
            <div class="info">
                <div><strong>👤 مشتری:</strong> ${customerName}</div>
                <div><strong>📱 تماس:</strong> ${customerPhone}</div>
                <div><strong>🪑 میز:</strong> ${customerTable}</div>
                <div><strong>📝 یادداشت:</strong> ${orderNote}</div>
            </div>
            <table>
                <thead>
                    <tr><th>#</th><th>محصول</th><th>قیمت واحد</th><th>تعداد</th><th>جمع</th></tr>
                </thead>
                <tbody>${itemsHTML}</tbody>
            </table>
            <div class="total">💰 جمع کل: ${total.toLocaleString('fa-IR')} تومان</div>
            <div style="text-align:center;"><button onclick="window.print()">🖨️ چاپ</button></div>
            <div class="footer">با تشکر از شما - کافه آرا ☕</div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function formatPrice(p) {
    return parseInt(p).toLocaleString('fa-IR');
}

// تب‌های دسته‌بندی
document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderProducts(this.dataset.category);
    });
});

// لود اولیه
loadMenu();