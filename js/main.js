// =============================================
// Main JavaScript - کافه آرا ARA Cafe
// =============================================

let menuData = { hot: [], cold: [], tea: [] };

// =============================================
// لود محصولات از فایل JSON
// =============================================
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

// =============================================
// فرمت قیمت
// =============================================
function formatPrice(price) {
    return parseInt(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' تومان';
}

// =============================================
// آیکون دسته‌بندی‌ها
// =============================================
function getCategoryIcon(category) {
    const icons = {
        hot: `<svg width="40" height="40" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#6F4E37" opacity="0.1"/><path d="M15 35 Q15 15 25 10 Q35 15 35 35Z" fill="#6F4E37" stroke="#3E2723" stroke-width="2"/><path d="M12 30 Q12 20 18 18" stroke="#D7CCC8" fill="none" stroke-width="2"/></svg>`,
        cold: `<svg width="40" height="40" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#4FC3F7" opacity="0.1"/><path d="M18 35 L18 15 L22 15 L22 25 L28 15 L28 35" fill="#4FC3F7" stroke="#0277BD" stroke-width="2"/></svg>`,
        tea: `<svg width="40" height="40" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="#66BB6A" opacity="0.1"/><path d="M12 35 L12 20 Q12 10 20 8 L20 12 Q15 14 15 20 L15 35Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="2"/><path d="M15 28 L25 28" stroke="#2E7D32" stroke-width="2"/><path d="M15 32 L22 32" stroke="#2E7D32" stroke-width="2"/></svg>`
    };
    return icons[category] || icons.hot;
}

// =============================================
// Escape HTML
// =============================================
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// =============================================
// ساخت HTML کارت محصول
// =============================================
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

// =============================================
// رندر منو
// =============================================
function renderMenu() {
    // نوشیدنی‌های گرم
    const hotGrid = document.getElementById('hot-drinks-grid');
    if (hotGrid) {
        hotGrid.innerHTML = menuData.hot && menuData.hot.length > 0 ? 
            menuData.hot.map(item => createMenuItemHTML(item)).join('') :
            '<p class="empty-state">☕ به زودی...</p>';
    }
    
    // نوشیدنی‌های سرد
    const coldGrid = document.getElementById('cold-drinks-grid');
    if (coldGrid) {
        coldGrid.innerHTML = menuData.cold && menuData.cold.length > 0 ? 
            menuData.cold.map(item => createMenuItemHTML(item)).join('') :
            '<p class="empty-state">🧊 به زودی...</p>';
    }
    
    // چای و دمنوش
    const teaGrid = document.getElementById('tea-drinks-grid');
    if (teaGrid) {
        teaGrid.innerHTML = menuData.tea && menuData.tea.length > 0 ? 
            menuData.tea.map(item => createMenuItemHTML(item)).join('') :
            '<p class="empty-state">🍵 به زودی...</p>';
    }
}

// =============================================
// Preloader
// =============================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    // مخفی کردن اجباری بعد از ۳ ثانیه
    const forceHideTimeout = setTimeout(() => {
        hidePreloader(preloader);
    }, 3000);
    
    // مخفی کردن هنگام لود کامل صفحه
    window.addEventListener('load', () => {
        clearTimeout(forceHideTimeout);
        setTimeout(() => {
            hidePreloader(preloader);
        }, 500);
    });
    
    // Fallback: مخفی کردن هنگام آماده شدن DOM
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        clearTimeout(forceHideTimeout);
        setTimeout(() => {
            hidePreloader(preloader);
        }, 1000);
    }
}

function hidePreloader(preloader) {
    if (!preloader || preloader.classList.contains('hidden')) return;
    
    preloader.classList.add('hidden');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
}

// =============================================
// اسکرول نرم لینک‌های ناوبری
// =============================================
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

// =============================================
// اسکرول دکمه بنر
// =============================================
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

// =============================================
// افکت اسکرول هدر
// =============================================
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

// =============================================
// دکمه برگشت به بالا
// =============================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    // نشون دادن/مخفی کردن دکمه هنگام اسکرول
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
            backToTopBtn.classList.remove('pulse');
        }
    });
    
    // کلیک روی دکمه - برگشت به بالا
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // انیمیشن پالس
        this.classList.add('pulse');
        setTimeout(() => {
            this.classList.remove('pulse');
        }, 500);
    });
}

// =============================================
// راه‌اندازی برنامه
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    // لود منو
    await loadMenuData();
    
    // راه‌اندازی ماژول‌ها
    initPreloader();
    initSmoothScroll();
    initHeaderScroll();
    initBannerScroll();
    initBackToTop();
    
    // لاگ در کنسول
    console.log('☕ کافه آرا - ARA Cafe');
    const total = (menuData.hot?.length || 0) + (menuData.cold?.length || 0) + (menuData.tea?.length || 0);
    console.log('📋 تعداد محصولات:', total);
    console.log('🚀 سایت با موفقیت بارگذاری شد');
});