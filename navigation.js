// Navigation Helper for Timetable Management System

class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.initializeNavigation();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page.replace('.html', '') || 'dashboard';
    }

    initializeNavigation() {
        // Update active navigation item
        this.updateActiveNavItem();
        
        // Add navigation event listeners
        this.addNavigationListeners();
    }

    updateActiveNavItem() {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current page
        const currentNavItem = document.querySelector(`a[href="${this.currentPage}.html"]`)?.parentElement;
        if (currentNavItem) {
            currentNavItem.classList.add('active');
        }
    }

    addNavigationListeners() {
        // Add click handlers to navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Handle special cases
                if (href.startsWith('#')) {
                    e.preventDefault();
                    this.handleSpecialNavigation(href);
                } else if (href.endsWith('.html')) {
                    // Regular navigation - let it proceed normally
                    this.beforeNavigate(href);
                }
            });
        });
    }

    beforeNavigate(href) {
        // Save any unsaved data before navigation
        this.saveCurrentPageState();
        
        // Show loading indicator if needed
        this.showNavigationLoader();
    }

    handleSpecialNavigation(href) {
        switch(href) {
            case '#settings':
                this.openSettings();
                break;
            case '#profile':
                this.openProfile();
                break;
            default:
                console.log('Unknown navigation:', href);
        }
    }

    saveCurrentPageState() {
        // Save any form data or filters for the current page
        const state = {
            page: this.currentPage,
            timestamp: Date.now(),
            filters: this.getCurrentPageFilters(),
            scrollPosition: window.scrollY
        };
        
        sessionStorage.setItem(`pageState_${this.currentPage}`, JSON.stringify(state));
    }

    getCurrentPageFilters() {
        // Get current filters/search terms based on page
        const filters = {};
        
        // Search input
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"], input[type="text"][placeholder*="search"]');
        if (searchInput) {
            filters.search = searchInput.value;
        }

        // Filter selects
        document.querySelectorAll('select[id*="Filter"]').forEach(select => {
            filters[select.id] = select.value;
        });

        return filters;
    }

    restorePageState() {
        const savedState = sessionStorage.getItem(`pageState_${this.currentPage}`);
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Restore filters
            if (state.filters) {
                Object.keys(state.filters).forEach(filterId => {
                    const element = document.getElementById(filterId);
                    if (element) {
                        element.value = state.filters[filterId];
                    }
                });
                
                // Restore search
                if (state.filters.search) {
                    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"], input[type="text"][placeholder*="search"]');
                    if (searchInput) {
                        searchInput.value = state.filters.search;
                    }
                }
            }
            
            // Restore scroll position after a short delay
            setTimeout(() => {
                window.scrollTo(0, state.scrollPosition || 0);
            }, 100);
        }
    }

    showNavigationLoader() {
        // Optional: Show a loading indicator during navigation
        const loader = document.createElement('div');
        loader.id = 'navigationLoader';
        loader.innerHTML = '<div class="spinner"></div>';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        document.body.appendChild(loader);
    }

    openSettings() {
        console.log('Opening settings...');
        // Implement settings modal or page
    }

    openProfile() {
        console.log('Opening profile...');
        // Implement profile modal or page
    }

    // Static method to navigate programmatically
    static navigateTo(page, params = {}) {
        let url = `${page}.html`;
        
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }
        
        window.location.href = url;
    }

    // Get URL parameters
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.navigationManager = new NavigationManager();
    
    // Restore page state after initialization
    setTimeout(() => {
        window.navigationManager.restorePageState();
    }, 500);
});

// Export for use in other files
window.NavigationManager = NavigationManager;