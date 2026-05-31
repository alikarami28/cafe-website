// =============================================
// Main JavaScript - کافه آرا ARA Cafe
// =============================================

let menuData = { hot: [], cold: [], tea: [] };

// لود محصولات از فایل JSON
async function loadMenuData() {
    try {
        const response = await fetch('data/menu.json');
        if (response.ok) {
            menuData = await response.json();
        }
    } catch (error) {
        console.warn('Error loading menu data, using empty menu');
    }
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
    return `
        <div class="menu-item" data-category="${item.category}" data-id="${item.id}">
            ${item.image ? `
                <div class="menu-item-image">
                    <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
                </div>
            ` : `
                <div class="menu-item-icon">
                    ${getCategoryIcon(item.category)}
                </div>
            `}
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-name">${escapeHTML(item.name)}</h3>
                    <span class="item-price">${formatPrice(item.price)}</span>
                </div>
                ${item.description ? `<p class="item-description">${escapeHTML(item.description)}</p>` : ''}
            </div>
        </div>
    `;
}

function renderMenu() {
    const hotGrid = document.getElementById('hot-drinks-grid');
    if (hotGrid) {
        hotGrid.innerHTML = menuData.hot && menuData.hot.length > 0 ? 
            menuData.hot.map(item => createMenuItemHTML(item)).join('') :
            '<p class="empty-state">☕ به زودی...</p>';
    }
    
    const coldGrid = document.getElementById('cold-drinks-grid');
    if (coldGrid) {
        coldGrid.innerHTML = menuData.cold && menuData.cold.length > 0 ? 
            menuData.cold.map(item => createMenuItemHTML(item)).join('') :
            '<p class="empty-state">🧊 به زودی...</p>';
    }
    
    const teaGrid = document.getElementById('tea-drinks-grid');
    if (teaGrid) {
        teaGrid.innerHTML = menuData.tea && menuData.tea.length > 0 ? 
            menuData.tea.map(item => createMenuItemHTML(item)).join('') :
            '<p class="empty-state">🍵 به زودی...</p>';
    }
}

function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => { preloader.style.display = 'none'; }, 500);
            }, 1500);
        });
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initBannerScroll() {
    const bannerScroll = document.querySelector('.banner-scroll');
    if (bannerScroll) {
        bannerScroll.addEventListener('click', () => {
            const menuSection = document.querySelector('#hot-drinks');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

function initHeaderScroll() {
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.style.boxShadow = window.scrollY > 50 ? 
                '0 4px 20px rgba(62, 39, 35, 0.3)' : 
                '0 4px 16px rgba(62, 39, 35, 0.15)';
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadMenuData();
    initPreloader();
    initSmoothScroll();
    initHeaderScroll();
    initBannerScroll();
    
    console.log('☕ کافه آرا - ARA Cafe');
    const total = (menuData.hot?.length || 0) + (menuData.cold?.length || 0) + (menuData.tea?.length || 0);
    console.log('📋 تعداد محصولات:', total);
});