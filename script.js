/**
 * Informe de Validación de Emails - Coltefinanciera
 * JavaScript optimizado y libre de errores
 * Versión: 2.0
 */

'use strict';

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    scrollOffset: 80,
    debounceDelay: 100,
    animationDuration: 300,
    csvFilename: 'informe-validacion-emails-coltefinanciera.csv',
    notificationDuration: 3000
};

// ===== UTILIDADES GLOBALES =====
const Utils = {
    /**
     * Función de debounce para optimizar eventos
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Formatear números con separadores de miles
     */
    formatNumber(num) {
        if (typeof num !== 'number') return num;
        return new Intl.NumberFormat('es-CO').format(num);
    },

    /**
     * Validar si un elemento existe en el DOM
     */
    elementExists(selector) {
        try {
            return document.querySelector(selector) !== null;
        } catch (error) {
            console.warn(`Selector inválido: ${selector}`);
            return false;
        }
    },

    /**
     * Obtener elemento del DOM de forma segura
     */
    getElement(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Error al obtener elemento: ${selector}`, error);
            return null;
        }
    },

    /**
     * Obtener múltiples elementos del DOM de forma segura
     */
    getElements(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Error al obtener elementos: ${selector}`, error);
            return [];
        }
    },

    /**
     * Mostrar notificación temporal
     */
    showNotification(message, type = 'info') {
        if (!message) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Crear icono basado en el tipo
        const iconMap = {
            'success': '✓',
            'error': '✗',
            'warning': '⚠',
            'info': 'ℹ'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${iconMap[type] || iconMap.info}</span>
            <span class="notification-message">${message}</span>
        `;
        
        // Estilos inline para la notificación
        const colorMap = {
            'success': '#27ae60',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colorMap[type] || colorMap.info,
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: '10000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        document.body.appendChild(notification);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Remover después del tiempo configurado
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, CONFIG.notificationDuration);
    },

    /**
     * Validar si el navegador soporta una característica
     */
    supportsFeature(feature) {
        const features = {
            'intersectionObserver': 'IntersectionObserver' in window,
            'smoothScroll': 'scrollBehavior' in document.documentElement.style,
            'download': 'download' in document.createElement('a')
        };
        return features[feature] || false;
    }
};

// ===== NAVEGACIÓN SUAVE =====
const SmoothNavigation = {
    init() {
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupKeyboardNavigation();
    },

    setupSmoothScrolling() {
        const tocLinks = Utils.getElements('.toc-link');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                if (!href || !href.startsWith('#')) return;
                
                const targetId = href.substring(1);
                const targetElement = Utils.getElement(`#${targetId}`);
                
                if (targetElement) {
                    this.scrollToElement(targetElement, targetId);
                }
            });
        });
    },

    scrollToElement(element, targetId) {
        const offsetTop = element.offsetTop - CONFIG.scrollOffset;
        
        if (Utils.supportsFeature('smoothScroll')) {
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        } else {
            // Fallback para navegadores antiguos
            this.smoothScrollFallback(offsetTop);
        }
        
        // Actualizar URL
        if (history.pushState) {
            history.pushState(null, null, `#${targetId}`);
        }
        
        // Feedback visual
        this.highlightActiveSection(targetId);
    },

    smoothScrollFallback(targetY) {
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const duration = 500;
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = progress * (2 - progress); // easeOutQuad
            window.scrollTo(0, startY + distance * ease);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        
        requestAnimationFrame(step);
    },

    setupActiveNavigation() {
        if (!Utils.supportsFeature('intersectionObserver')) return;

        const sections = Utils.getElements('[id]');
        const tocLinks = Utils.getElements('.toc-link');
        
        if (sections.length === 0 || tocLinks.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.id;
                    this.updateActiveLink(activeId, tocLinks);
                }
            });
        }, {
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0.1
        });

        sections.forEach(section => {
            if (section.id) {
                observer.observe(section);
            }
        });
    },

    updateActiveLink(activeId, tocLinks) {
        // Remover clase activa de todos los enlaces
        tocLinks.forEach(link => link.classList.remove('active'));
        
        // Agregar clase activa al enlace correspondiente
        const activeLink = Utils.getElement(`.toc-link[href="#${activeId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    },

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Home':
                        e.preventDefault();
                        this.scrollToTop();
                        break;
                    case 'End':
                        e.preventDefault();
                        this.scrollToBottom();
                        break;
                }
            }
        });
    },

    scrollToTop() {
        if (Utils.supportsFeature('smoothScroll')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            this.smoothScrollFallback(0);
        }
    },

    scrollToBottom() {
        const bottom = document.body.scrollHeight;
        if (Utils.supportsFeature('smoothScroll')) {
            window.scrollTo({ top: bottom, behavior: 'smooth' });
        } else {
            this.smoothScrollFallback(bottom);
        }
    },

    highlightActiveSection(sectionId) {
        const section = Utils.getElement(`#${sectionId}`);
        if (!section) return;

        const originalBackground = section.style.background;
        section.style.background = 'rgba(44, 90, 160, 0.05)';
        section.style.transition = 'background 0.3s ease';
        
        setTimeout(() => {
            section.style.background = originalBackground;
        }, 1000);
    }
};



// ===== MEJORAS DE EXPERIENCIA MÓVIL =====
const MobileEnhancements = {
    init() {
        this.setupMobileOptimizations();
        this.setupTouchGestures();
        this.handleOrientationChange();
    },

    setupMobileOptimizations() {
        const isMobile = this.detectMobileDevice();
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
            this.optimizeForMobile();
        }

        // Optimizar tablas para móviles
        const tables = Utils.getElements('table');
        tables.forEach(table => {
            if (window.innerWidth <= 768) {
                table.style.overflowX = 'auto';
                table.style.webkitOverflowScrolling = 'touch';
            }
        });
    },

    detectMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    },

    optimizeForMobile() {
        // Reducir animaciones para mejor rendimiento
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device * {
                animation-duration: 0.2s !important;
                transition-duration: 0.2s !important;
            }
            .mobile-device .analysis-card {
                margin-bottom: 1rem;
            }
        `;
        document.head.appendChild(style);
    },

    setupTouchGestures() {
        const interactiveElements = Utils.getElements('.toc-link, .action-btn, .analysis-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
        });
    },

    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.setupMobileOptimizations();
            }, 100);
        });
    }
};

// ===== ACCESIBILIDAD =====
const AccessibilityEnhancements = {
    init() {
        this.setupARIAAttributes();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
    },

    setupARIAAttributes() {
        // Mejorar tablas
        const tables = Utils.getElements('table');
        tables.forEach((table, index) => {
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', `Tabla de datos ${index + 1}`);
            
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                header.setAttribute('scope', 'col');
            });
        });

        // Mejorar navegación
        const nav = Utils.getElement('.table-of-contents');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Navegación del informe');
        }

        // Mejorar botones
        const buttons = Utils.getElements('button, .action-btn');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                button.setAttribute('aria-label', 'Botón de acción');
            }
        });
    },

    setupKeyboardNavigation() {
        const focusableElements = Utils.getElements(
            'a, button, [tabindex]:not([tabindex="-1"]), input, select, textarea'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (element.tagName === 'A' || element.tagName === 'BUTTON') {
                        e.preventDefault();
                        element.click();
                    }
                }
            });
        });
    },

    setupFocusManagement() {
        // Detectar navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Agregar estilos de foco
        this.addFocusStyles();
    },

    addFocusStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 3px solid #2c5aa0 !important;
                outline-offset: 2px !important;
            }
            
            .toc-link.active {
                background: #2c5aa0 !important;
                color: white !important;
                border-color: #2c5aa0 !important;
            }
        `;
        document.head.appendChild(style);
    }
};

// ===== MANEJO DE ERRORES =====
const ErrorHandler = {
    init() {
        this.setupGlobalErrorHandling();
        this.validateDOM();
    },

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Error global capturado:', e.error);
            this.logError('Error global', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada:', e.reason);
            this.logError('Promesa rechazada', e.reason);
        });
    },

    logError(type, error) {
        // En un entorno de producción, aquí se enviarían los errores a un servicio de logging
        console.group(`🚨 ${type}`);
        console.error(error);
        console.trace();
        console.groupEnd();
    },

    validateDOM() {
        const criticalElements = [
            'body',
            '.header-section, header',
            '.content-section, main'
        ];

        criticalElements.forEach(selector => {
            if (!Utils.elementExists(selector)) {
                console.warn(`⚠️ Elemento crítico no encontrado: ${selector}`);
            }
        });
    }
};

// ===== APLICACIÓN PRINCIPAL =====
class ReportApp {
    constructor() {
        this.modules = [
            SmoothNavigation,
            MobileEnhancements,
            AccessibilityEnhancements,
            ErrorHandler
        ];
        this.initialized = false;
    }

    init() {
        if (this.initialized) {
            console.warn('La aplicación ya está inicializada');
            return;
        }

        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeModules());
        } else {
            this.initializeModules();
        }
    }

    initializeModules() {
        try {
            console.log('🚀 Inicializando aplicación del informe...');
            
            this.modules.forEach(module => {
                if (module && typeof module.init === 'function') {
                    try {
                        module.init();
                        console.log(`✅ Módulo ${module.constructor.name || 'Anónimo'} inicializado`);
                    } catch (error) {
                        console.error(`❌ Error al inicializar módulo:`, error);
                    }
                }
            });

            this.initialized = true;
            console.log('✅ Aplicación inicializada correctamente');
            
            // Mostrar notificación de éxito después de un breve delay
            setTimeout(() => {
                Utils.showNotification('Informe cargado correctamente', 'success');
            }, 500);
            
        } catch (error) {
            console.error('❌ Error crítico al inicializar la aplicación:', error);
            Utils.showNotification('Error al cargar el informe', 'error');
        }
    }

    // Método para reinicializar si es necesario
    reinitialize() {
        this.initialized = false;
        this.init();
    }
}

// ===== INICIALIZACIÓN =====
// Crear instancia global de la aplicación
const reportApp = new ReportApp();

// Inicializar cuando el script se carga
reportApp.init();

// ===== EXPORTAR PARA USO GLOBAL =====
window.ReportApp = {
    app: reportApp,
    Utils,
    SmoothNavigation,
    CONFIG
};

// ===== COMPATIBILIDAD CON NAVEGADORES ANTIGUOS =====
// Polyfill para Object.assign si no existe
if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        for (let index = 1; index < arguments.length; index++) {
            const nextSource = arguments[index];
            if (nextSource != null) {
                for (const nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

console.log('📄 Script del informe cargado exitosamente');