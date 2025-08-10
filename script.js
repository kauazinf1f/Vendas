// Variáveis globais
let currentProduct = '';
let currentPrice = 0;
let originalPrice = 0;
let discountApplied = false;

// Constantes
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1398803914035298335/rcFwlkQIZTDPoZOgGthllkutFpIRAIjnQI1tqv88lLAMvxDOA0REQiMX2hH6Jwr9AJ3_'; // Substituir pela URL real do webhook
const PIX_KEY = 'cfcd9c3f-ef83-4643-ab24-f96a02d1ceb2';

// Cupons de desconto disponíveis
const COUPONS = {
    'ASTRA': {
        discount: 0.10,
        description: '10% de desconto'
    },
    'VISION10': {
        discount: 0.10,
        description: '10% de desconto'
    },
    'MEGA15': {
        discount: 0.15,
        description: '15% de desconto'
    }
};

// Palavras proibidas para validação do formulário
const PROHIBITED_WORDS = [
    '@everyone',
    '@here',
    'xvideos',
    'porno',
    'putaria',
    'caralho',
    'puta',
    'vadia',
    'merda',
    'cuzão',
    'filho da puta',
    'vai se foder',
    'cu',
    'buceta',
    'pica',
    'pau',
    'dick',
    'pussy',
    'fuck',
    'bitch',
    'shit',
    'asshole'
];

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeMobileMenu();
});

// Configurar event listeners
function initializeEventListeners() {
    // Formulário de pedidos personalizados
    const customOrderForm = document.getElementById('customOrderForm');
    if (customOrderForm) {
        customOrderForm.addEventListener('submit', handleCustomOrderSubmit);
    }

    // Input de cupom - aplicar ao pressionar Enter
    const couponInput = document.getElementById('couponInput');
    if (couponInput) {
        couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyCoupon();
            }
        });
    }

    // Fechar modal ao clicar fora dele
    const checkoutOverlay = document.getElementById('checkout');
    if (checkoutOverlay) {
        checkoutOverlay.addEventListener('click', function(e) {
            if (e.target === checkoutOverlay) {
                closeCheckout();
            }
        });
    }
}

// Inicializar menu mobile
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMobile = document.getElementById('navMobile');
    
    if (hamburger && navMobile) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMobile.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link
        const mobileLinks = navMobile.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMobile.classList.remove('active');
            });
        });
    }
}

// Função para rolar suavemente para uma seção
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Abrir checkout modal
function openCheckout(productName, price) {
    currentProduct = productName;
    currentPrice = price;
    originalPrice = price;
    discountApplied = false;
    
    // Atualizar informações no modal
    document.getElementById('checkoutProductName').textContent = productName;
    document.getElementById('originalPrice').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    document.getElementById('finalPrice').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    document.getElementById('pixKey').textContent = PIX_KEY;
    
    // Resetar cupom
    document.getElementById('couponInput').value = '';
    document.getElementById('couponMessage').textContent = '';
    document.getElementById('couponMessage').className = 'coupon-message';
    document.getElementById('originalPrice').classList.add('hidden');
    
    // Mostrar modal
    document.getElementById('checkout').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar checkout modal
function closeCheckout() {
    document.getElementById('checkout').classList.remove('active');
    document.body.style.overflow = '';
}

// Aplicar cupom de desconto
function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    const couponMessage = document.getElementById('couponMessage');
    const originalPriceElement = document.getElementById('originalPrice');
    const finalPriceElement = document.getElementById('finalPrice');
    
    const couponCode = couponInput.value.trim().toUpperCase();
    
    if (!couponCode) {
        showCouponMessage('Por favor, digite um cupom.', 'error');
        return;
    }
    
    if (COUPONS[couponCode]) {
        if (discountApplied) {
            showCouponMessage('Você já aplicou um cupom de desconto.', 'error');
            return;
        }
        
        const coupon = COUPONS[couponCode];
        const discountAmount = originalPrice * coupon.discount;
        currentPrice = originalPrice - discountAmount;
        discountApplied = true;
        
        // Atualizar interface
        originalPriceElement.classList.remove('hidden');
        finalPriceElement.textContent = `R$ ${currentPrice.toFixed(2).replace('.', ',')}`;
        
        showCouponMessage(`Cupom aplicado! ${coupon.description} - Economia de R$ ${discountAmount.toFixed(2).replace('.', ',')}`, 'success');
    } else {
        showCouponMessage('Cupom inválido ou expirado.', 'error');
    }
}

// Mostrar mensagem do cupom
function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('couponMessage');
    couponMessage.textContent = message;
    couponMessage.className = `coupon-message ${type}`;
}

// Copiar chave PIX
function copyPixKey() {
    const pixKey = document.getElementById('pixKey').textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        // Método moderno
        navigator.clipboard.writeText(pixKey).then(() => {
            showNotification('Chave PIX copiada!');
        }).catch(() => {
            fallbackCopyPixKey(pixKey);
        });
    } else {
        // Fallback para navegadores mais antigos
        fallbackCopyPixKey(pixKey);
    }
}

// Método alternativo para copiar texto
function fallbackCopyPixKey(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Chave PIX copiada!');
    } catch (err) {
        showNotification('Erro ao copiar. Copie manualmente.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Processar envio do formulário de pedidos personalizados
async function handleCustomOrderSubmit(e) {
    e.preventDefault();
    
    const discordName = document.getElementById('discordName').value.trim();
    const siteFunctionality = document.getElementById('siteFunctionality').value.trim();
    const formMessage = document.getElementById('formMessage');
    
    // Validação básica
    if (!discordName || !siteFunctionality) {
        showFormMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    // Validação de palavras proibidas
    const combinedText = `${discordName} ${siteFunctionality}`.toLowerCase();
    const hasProhibitedWords = PROHIBITED_WORDS.some(word => 
        combinedText.includes(word.toLowerCase())
    );
    
    if (hasProhibitedWords) {
        showFormMessage('Sua mensagem contém conteúdo inapropriado. Por favor, revise e tente novamente.', 'error');
        return;
    }
    
    // Validação de menções problemáticas
    if (discordName.includes('@everyone') || discordName.includes('@here') || 
        siteFunctionality.includes('@everyone') || siteFunctionality.includes('@here')) {
        showFormMessage('Não são permitidas menções @everyone ou @here.', 'error');
        return;
    }
    
    // Desabilitar botão durante envio
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    try {
        // Preparar dados para o webhook
        const webhookData = {
            content: null,
            embeds: [{
                title: "🆕 Novo Pedido Personalizado",
                color: 15088710, // Cor vermelha em decimal
                fields: [
                    {
                        name: "👤 Nome no Discord",
                        value: discordName,
                        inline: true
                    },
                    {
                        name: "⚙️ Funcionalidade Solicitada",
                        value: siteFunctionality.length > 1024 ? 
                               siteFunctionality.substring(0, 1021) + "..." : 
                               siteFunctionality,
                        inline: false
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: "VisionMega - Sistema de Pedidos"
                }
            }]
        };
        
        // Enviar para webhook do Discord
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
        });
        
        if (response.ok) {
            showFormMessage('Pedido enviado com sucesso! Entraremos em contato em breve.', 'success');
            // Limpar formulário
            document.getElementById('customOrderForm').reset();
        } else {
            throw new Error('Erro no envio');
        }
        
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        showFormMessage('Erro ao enviar pedido. Tente novamente ou entre em contato pelo Discord.', 'error');
    } finally {
        // Reabilitar botão
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Mostrar mensagem do formulário
function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    
    // Auto-ocultar mensagem de sucesso após 5 segundos
    if (type === 'success') {
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 5000);
    }
}

// Função para mostrar notificações temporárias
function showNotification(message, type = 'success') {
    // Remover notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        font-weight: 500;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Função para formatar preço em Real brasileiro
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Função para validar email (caso seja necessário no futuro)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para escapar HTML (prevenir XSS)
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Função para debounce (otimização de performance)
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Event listener para scroll suave do header
window.addEventListener('scroll', debounce(function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
}, 10));

// Interceptar tentativas de envio de formulário se o webhook não estiver configurado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o webhook está configurado
    if (DISCORD_WEBHOOK_URL.includes('YOUR_WEBHOOK')) {
        console.warn('⚠️ Discord Webhook não configurado. Configure a URL do webhook na variável DISCORD_WEBHOOK_URL no arquivo script.js');
        
        // Substituir função de envio por uma simulação
        window.originalHandleCustomOrderSubmit = handleCustomOrderSubmit;
        window.handleCustomOrderSubmit = function(e) {
            e.preventDefault();
            showFormMessage('Demo Mode: Webhook não configurado. Configure DISCORD_WEBHOOK_URL para funcionalidade completa.', 'error');
        };
    }
});

// Prevenir comportamentos de spam
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 5000; // 5 segundos

const originalHandleSubmit = handleCustomOrderSubmit;
handleCustomOrderSubmit = function(e) {
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
        e.preventDefault();
        showFormMessage('Aguarde alguns segundos antes de enviar outro pedido.', 'error');
        return;
    }
    lastSubmitTime = now;
    return originalHandleSubmit.call(this, e);
};

// Adicionar tratamento de erro global para requisições
window.addEventListener('unhandledrejection', function(event) {
    console.error('Erro não tratado:', event.reason);
    if (event.reason.message && event.reason.message.includes('fetch')) {
        showNotification('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
    }
});
