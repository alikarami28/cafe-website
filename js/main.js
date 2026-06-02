let menuData = { hot: [], cold: [], tea: [] };

async function loadMenuData() {
    try {
        const response = await fetch('data/menu.json');
        if (response.ok) menuData = await response.json();
    } catch (error) { console.warn('Error loading menu'); }
    renderMenu();
}

function formatPrice(price) {
    return parseInt(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' تومان';
}

function getCategoryIcon(category) {
    const icons = {
        hot: `<svg width="40" height="40" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#6F4E37" opacity="0.1"/><path d="M15 35 Q15 15 25 10 Q35 15 35 35Z" fill="#6F4E37" stroke="#3E2723" stroke-width="2"/></svg>`,
        cold: `<svg width="40" height="40" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#4FC3F7" opacity="0.1"/><path d="M18 35 L18 15 L22 15 L22 25 L28 15 L28 35" fill="#4FC3F7" stroke="#0277BD" stroke-width="2"/></svg>`,
        tea: `<svg width="40" height="40" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#66BB6A" opacity="0.1"/><path d="M12 35 L12 20 Q12 10 20 8 L20 12 Q15 14 15 20 L15 35Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="2"/></svg>`
    };
    return icons[category] || icons.hot;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function createMenuItemHTML(item) {
    let imageHTML = '';
    if (item.image && item.image.trim() !== '') {
        imageHTML = `<div class="menu-item-image"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy"></div>`;
    } else {
        imageHTML = `<div class="menu-item-icon">${getCategoryIcon(item.category)}</div>`;
    }
    return `<div class="menu-item" data-category="${item.category}">
        ${imageHTML}
        <div class="item-content">
            <div class="item-header"><h3 class="item-name">${escapeHTML(item.name)}</h3><span class="item-price">${formatPrice(item.price)}</span></div>
            ${item.description ? `<p class="item-description">${escapeHTML(item.description)}</p>` : ''}
        </div>
    </div>`;
}

function renderMenu() {
    ['hot', 'cold', 'tea'].forEach(cat => {
        const grid = document.getElementById(cat + '-drinks-grid');
        if (grid) {
            const items = (menuData[cat] || []).sort((a, b) => (a.order || 999) - (b.order || 999));
            grid.innerHTML = items.length > 0 ? items.map(item => createMenuItemHTML(item)).join('') : '<p class="empty-state">به زودی...</p>';
        }
    });
}

function initPreloader() {
    const p = document.getElementById('preloader');
    if (!p) return;
    const t = setTimeout(() => { p.classList.add('hidden'); setTimeout(() => p.style.display = 'none', 500); }, 3000);
    window.addEventListener('load', () => { clearTimeout(t); setTimeout(() => { p.classList.add('hidden'); setTimeout(() => p.style.display = 'none', 500); }, 500); });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const t = document.querySelector(this.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function initBannerScroll() {
    const b = document.querySelector('.banner-scroll');
    if (b) b.addEventListener('click', () => { const m = document.querySelector('#hot-drinks'); if (m) m.scrollIntoView({ behavior: 'smooth' }); });
}

function initHeaderScroll() {
    const h = document.getElementById('header');
    if (h) window.addEventListener('scroll', () => { h.style.boxShadow = window.scrollY > 50 ? '0 4px 20px rgba(62,39,35,0.3)' : '0 4px 16px rgba(62,39,35,0.15)'; });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) btn.classList.add('visible'); else { btn.classList.remove('visible'); btn.classList.remove('pulse'); }
    });
    btn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); btn.classList.add('pulse'); setTimeout(() => btn.classList.remove('pulse'), 500); });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadMenuData();
    initPreloader();
    initSmoothScroll();
    initHeaderScroll();
    initBannerScroll();
    initBackToTop();
});