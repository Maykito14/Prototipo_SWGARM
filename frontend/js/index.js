// Página Principal - Corazón de Trapo
const metricasPublicas = {
    'vidas-salvo': 0,
    'familias-felices': 0,
    'solicitudes-recibidas': 0,
};

document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
    loadPublicMetrics().finally(() => {
        initStatsAnimation();
    });
});

// Funcionalidad del slideshow
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function initSlideshow() {
    // Auto-avance de slides cada 8 segundos
    setInterval(nextSlide, 8000);
    
    // Agregar eventos a los indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => currentSlide(index + 1));
    });
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    showSlide(currentSlideIndex);
}

function currentSlide(n) {
    currentSlideIndex = n - 1;
    showSlide(currentSlideIndex);
}

function showSlide(index) {
    // Ocultar todos los slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Mostrar el slide actual
    slides[index].classList.add('active');
    
    // Actualizar indicadores
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    indicators[index].classList.add('active');
}

// Animación de estadísticas
function initStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStat(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateStat(element) {
    const finalValue = metricasPublicas[element.id] ?? 0;
    const duration = 2000; // 2 segundos
    const increment = finalValue / (duration / 16); // 60 FPS
    let current = 0;
    
    element.classList.add('animate');
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
            current = finalValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

async function loadPublicMetrics() {
    try {
        const response = await fetch(`${window.location.origin}/api/dashboard/public-metrics`);
        if (!response.ok) {
            throw new Error('No se pudieron obtener las métricas públicas');
        }
        const data = await response.json();
        metricasPublicas['vidas-salvo'] = data.animalesRegistrados ?? 0;
        metricasPublicas['familias-felices'] = data.adopcionesActivas ?? 0;
        metricasPublicas['solicitudes-recibidas'] = data.solicitudesTotales ?? 0;
    } catch (error) {
        console.error('Error al cargar métricas públicas:', error);
    }
}

// Efectos de hover para botones
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-large');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
