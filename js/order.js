// =============================================
// Order System - کافه آرا ARA Cafe
// =============================================

let menuData = { hot: [], cold: [], tea: [] };
let selectedItems = [];

// =============================================
// فال‌های حافظ
// =============================================
const hafezFal = [
    "مژده ای دل که دگر باره بهار آمده است | از پی هر نفسش بوی نگار آمده است",
    "یوسف گم‌گشته بازآید به کنعان غم مخور | کلبه احزان شود روزی گلستان غم مخور",
    "در ازل پرتو حسنت ز تجلی دم زد | عشق پیدا شد و آتش به همه عالم زد",
    "الا یا ایها الساقی ادر کأساً و ناولها | که عشق آسان نمود اول ولی افتاد مشکل‌ها",
    "دوش وقت سحر از غصه نجاتم دادند | واندر آن ظلمت شب آب حیاتم دادند",
    "صبح است و ژاله می‌چکد از ابر بهمنی | برگ صبوح ساز و بده جام یک منی",
    "بلبلی خون دلی خورد و گلی حاصل کرد | باد غیرت به صدش خار پریشان کرد و برفت",
    "سحرگه رهروی در سرزمینی | همی گفت این معما با قرینی",
    "هرگز از دور زمان ننالم و نگریزم | کاین همه زخم جفا از کف یار آمده است",
    "دیشب به سیل اشک ره خواب می‌زدم | نقشی به یاد خط تو بر آب می‌زدم"
];

// =============================================
// Load Menu
// =============================================
async function loadMenu() {
    try {
        const res = await fetch('data/menu.json');
        if (res.ok) menuData = await res.json();
    } catch (e) {}
    renderProducts('all');
}

// =============================================
// Format Price
// =============================================
function formatPrice(p) {
    return parseInt(p).toLocaleString('fa-IR');
}

// =============================================
// Render Products
// =============================================
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
                <div class="product-card-price">${formatPrice(item.price)} تومان</div>
                ${isSelected ? '<div style="color:green;margin-top:4px;">✓ انتخاب شده</div>' : ''}
            </div>
        `;
    }).join('');
}

// =============================================
// Toggle Item
// =============================================
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

// =============================================
// Render Order Items
// =============================================
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

// =============================================
// Change Qty
// =============================================
function changeQty(index, delta) {
    selectedItems[index].qty += delta;
    if (selectedItems[index].qty < 1) selectedItems[index].qty = 1;
    renderOrderItems();
}

// =============================================
// Remove Item
// =============================================
function removeItem(index) {
    selectedItems.splice(index, 1);
    const activeCategory = document.querySelector('.category-tab.active').dataset.category;
    renderProducts(activeCategory);
    renderOrderItems();
}

// =============================================
// Clear Order
// =============================================
function clearOrder() {
    if (!confirm('حذف همه سفارشات؟')) return;
    selectedItems = [];
    const activeCategory = document.querySelector('.category-tab.active').dataset.category;
    renderProducts(activeCategory);
    renderOrderItems();
}

// =============================================
// 🆕 Print Order - پرینتر فروشگاهی
// =============================================
function printOrder() {
    if (selectedItems.length === 0) return alert('محصولی انتخاب نشده!');

    const customerName = document.getElementById('customerName').value || 'مشتری';
    const customerPhone = document.getElementById('customerPhone').value || '';
    const customerTable = document.getElementById('customerTable').value || '';
    const orderNote = document.getElementById('orderNote').value || '';

    // انتخاب فال رندوم
    const randomFal = hafezFal[Math.floor(Math.random() * hafezFal.length)];

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR');
    const orderId = Math.floor(Math.random() * 9000) + 1000;

    let total = 0;
    let itemsHTML = '';
    
    selectedItems.forEach((item, i) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        itemsHTML += `
            <tr>
                <td class="r">${item.qty}</td>
                <td>${item.name}</td>
                <td class="l">${formatPrice(itemTotal)}</td>
            </tr>
        `;
    });

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاکتور</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Tahoma', sans-serif;
                    width: 80mm;
                    margin: 0 auto;
                    padding: 5mm;
                    background: #fff;
                    font-size: 11px;
                    line-height: 1.6;
                    color: #000;
                }
                .header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 3mm;
                    margin-bottom: 3mm;
                }
                .header h2 { font-size: 14px; margin-bottom: 1mm; }
                .header p { font-size: 9px; color: #333; }
                .info {
                    font-size: 9px;
                    margin-bottom: 3mm;
                    border-bottom: 1px dotted #ccc;
                    padding-bottom: 2mm;
                }
                .info div { margin-bottom: 0.5mm; }
                .info span { font-weight: bold; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 3mm;
                    font-size: 10px;
                }
                th {
                    border-bottom: 1px solid #000;
                    border-top: 1px solid #000;
                    padding: 1.5mm 0;
                    font-size: 9px;
                }
                td {
                    padding: 1mm 0;
                    border-bottom: 1px dotted #ccc;
                }
                .r { text-align: center; width: 15%; }
                .l { text-align: left; width: 30%; }
                .total {
                    text-align: left;
                    font-size: 14px;
                    font-weight: bold;
                    padding: 2mm 5mm;
                    background: #f5f5f5;
                    margin: 3mm 0;
                    border-radius: 4px;
                }
                .total span { float: left; }
                .fal {
                    text-align: center;
                    border-top: 1px dashed #000;
                    border-bottom: 1px dashed #000;
                    padding: 3mm 0;
                    margin: 3mm 0;
                    font-size: 9px;
                    font-style: italic;
                    color: #555;
                    line-height: 2;
                }
                .fal .label {
                    font-style: normal;
                    font-weight: bold;
                    font-size: 10px;
                    color: #000;
                    margin-bottom: 2mm;
                }
                .footer {
                    text-align: center;
                    font-size: 9px;
                    margin-top: 3mm;
                    color: #666;
                }
                .barcode {
                    text-align: center;
                    font-size: 8px;
                    letter-spacing: 2px;
                    margin: 2mm 0;
                    color: #999;
                }
                @media print {
                    body { 
                        width: 80mm;
                        margin: 0;
                        padding: 3mm;
                    }
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                }
                button {
                    display: block;
                    width: 100%;
                    padding: 8px;
                    background: #000;
                    color: #fff;
                    border: none;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 5mm;
                    font-family: inherit;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>☕ کافه آرا</h2>
                <p>ARA Cafe</p>
                <p>طعمی به گرمی یک خاطره</p>
            </div>
            
            <div class="info">
                <div><span>شماره سفارش:</span> #${orderId}</div>
                <div><span>تاریخ:</span> ${dateStr} | <span>ساعت:</span> ${timeStr}</div>
                ${customerTable ? `<div><span>میز:</span> ${customerTable}</div>` : ''}
                <div><span>مشتری:</span> ${customerName}</div>
                ${customerPhone ? `<div><span>تماس:</span> ${customerPhone}</div>` : ''}
                ${orderNote ? `<div><span>یادداشت:</span> ${orderNote}</div>` : ''}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th class="r">تعداد</th>
                        <th>محصول</th>
                        <th class="l">قیمت</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="total">
                جمع کل: <span>${total.toLocaleString('fa-IR')} تومان</span>
            </div>
            
            <div class="fal">
                <div class="label">🕊️ فال حافظ</div>
                ${randomFal}
            </div>
            
            <div class="barcode">
                *${orderId}*${Date.now().toString().slice(-8)}*
            </div>
            
            <div class="footer">
                با تشکر از حضور شما<br>
                کافه آرا - ARA Cafe ☕
            </div>
            
            <button onclick="window.print()">🖨️ چاپ فاکتور</button>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// =============================================
// Category Tabs
// =============================================
document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderProducts(this.dataset.category);
    });
});

// =============================================
// Init
// =============================================
loadMenu();