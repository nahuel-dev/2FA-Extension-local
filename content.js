// Content script para detectar páginas web y mostrar ventana flotante de 2FA
class TotpFloatingWindow {
    constructor() {
        this.currentDomain = this.getCurrentDomain();
        this.floatingWindow = null;
        this.accounts = [];
        this.isVisible = false;
        
        this.init();
    }

    getCurrentDomain() {
        return window.location.hostname.replace('www.', '');
    }

    async init() {
        console.log('TOTP Floating Window iniciando en:', this.currentDomain);
        console.log('URL completa:', window.location.href);
        
        await this.loadLanguage();
        await this.loadAccounts();
        console.log('Cuentas cargadas:', this.accounts.length, this.accounts);
        
        // Buscar cuentas que coincidan con el dominio actual
        this.matchingAccounts = this.findMatchingAccounts();
        console.log('Cuentas coincidentes:', this.matchingAccounts.length, this.matchingAccounts);
        
        if (this.matchingAccounts.length > 0) {
            console.log('Mostrando ventana flotante...');
            this.createFloatingWindow(this.matchingAccounts);
            console.log('Ventana flotante mostrada');
        } else {
            console.log('No hay cuentas para este dominio o todas están filtradas por configuración de tiempo');
        }
    }

    async loadLanguage() {
        try {
            const result = await chrome.storage.local.get(['language']);
            this.currentLanguage = result.language || 'es';
        } catch (error) {
            console.error('Error cargando idioma:', error);
            this.currentLanguage = 'es';
        }
    }

    async loadAccounts() {
        try {
            const result = await chrome.storage.local.get(['accounts']);
            this.accounts = result.accounts || [];
        } catch (error) {
            console.error('Error cargando cuentas:', error);
        }
    }

    t(key) {
        const translations = {
            es: {
                verificationCode: 'Código de seguridad para la verificación',
                copy: 'Copiar'
            },
            en: {
                verificationCode: 'Verification code',
                copy: 'Copy'
            }
        };
        return translations[this.currentLanguage]?.[key] || key;
    }

    findMatchingAccounts() {
        console.log('Iniciando búsqueda de cuentas coincidentes...');
        console.log('URL actual:', window.location.href);
        console.log('Dominio actual:', this.currentDomain);
        
        const matchingAccounts = this.accounts.filter(account => {
            console.log(`Revisando cuenta: ${account.name}, dominio: ${account.domain}, URL: ${account.url}`);
            
            let matches = false;
            
            // Verificar coincidencia por URL si está configurada
            if (account.url && account.url.trim()) {
                const currentUrl = window.location.href.toLowerCase();
                const accountUrl = account.url.toLowerCase().trim();
                
                console.log(`Comparando URL: "${currentUrl}" contiene "${accountUrl}"`);
                
                // Verificar si la URL actual contiene la URL configurada
                matches = currentUrl.includes(accountUrl) || accountUrl.includes(currentUrl);
                
                console.log(`¿Coincide URL? ${matches}`);
                
                if (matches) return matches;
            }
            
            // Si no hay coincidencia por URL, verificar por dominio
            if (account.domain && account.domain.trim()) {
                // Normalizar dominios para comparación
                const accountDomain = account.domain.toLowerCase().replace('www.', '').trim();
                const currentDomain = this.currentDomain.toLowerCase();
                
                console.log(`Comparando dominio: "${currentDomain}" con "${accountDomain}"`);
                
                // Coincidencia exacta o subdominio
                matches = currentDomain === accountDomain || 
                         currentDomain.endsWith('.' + accountDomain) ||
                         accountDomain.endsWith('.' + currentDomain);
                
                console.log(`¿Coincide dominio? ${matches}`);
            }
            
            return matches;
        });

        console.log('Cuentas que coinciden:', matchingAccounts.length, matchingAccounts);

        // Ahora filtrar por configuración de tiempo
        const filteredByTime = matchingAccounts.filter(account => {
            const shouldShow = this.shouldShowWindow(account);
            console.log(`Filtro de tiempo para ${account.name}: ${shouldShow}`);
            return shouldShow;
        });

        console.log('Cuentas después del filtro de tiempo:', filteredByTime.length, filteredByTime);
        return filteredByTime;
    }

    // Verificar si se debe mostrar la ventana según configuración de tiempo
    shouldShowWindow(account) {
        const delay = account.floatingWindowDelay || 'always';
        
        console.log(`Verificando ventana para ${account.name}: configuración = ${delay}`);
        
        // Si está desactivado, no mostrar
        if (delay === 'disabled') {
            console.log(`Ventana desactivada para ${account.name}`);
            return false;
        }
        
        // Si está en "siempre activado", mostrar siempre
        if (delay === 'always') {
            console.log(`Ventana siempre activada para ${account.name}`);
            return true;
        }
        
        // Si no hay timestamp de última copia, mostrar
        if (!account.lastCopyTime) {
            console.log(`Sin timestamp previo para ${account.name}, mostrando ventana`);
            return true;
        }
        
        // Calcular tiempo transcurrido desde la última copia
        const now = Date.now();
        const timeSinceLastCopy = now - account.lastCopyTime;
        const delayMinutes = parseInt(delay);
        const delayMs = delayMinutes * 60 * 1000; // Convertir minutos a milisegundos
        
        console.log(`Cuenta ${account.name}: ${timeSinceLastCopy}ms desde última copia, delay: ${delayMs}ms`);
        
        // Mostrar si ha pasado el tiempo configurado
        const shouldShow = timeSinceLastCopy >= delayMs;
        console.log(`¿Mostrar ventana para ${account.name}? ${shouldShow}`);
        return shouldShow;
    }

    createFloatingWindow(accounts) {
        if (this.floatingWindow) {
            this.floatingWindow.remove();
        }

        // Crear contenedor principal
        this.floatingWindow = document.createElement('div');
        this.floatingWindow.id = 'totp-floating-window';
        this.floatingWindow.className = 'totp-floating-window';

        // Crear contenido para cada cuenta
        const content = accounts.map(account => this.createAccountCard(account)).join('');

        this.floatingWindow.innerHTML = `
            <div class="totp-header">
                <div class="totp-title">
                    <div class="totp-icon">🔒</div>
                    <span>${this.t('verificationCode')}</span>
                </div>
                <div class="totp-actions">
                    <button class="totp-close-btn">×</button>
                </div>
            </div>
            <div class="totp-content">
                ${content}
            </div>
        `;

        // Agregar event listeners
        this.addEventListeners();

        // Insertar en la página
        document.body.appendChild(this.floatingWindow);
        
        // Mostrar con animación
        setTimeout(() => {
            this.floatingWindow.classList.add('totp-visible');
            this.isVisible = true;
        }, 100);
    }

    createAccountCard(account) {
        const favicon = this.getFavicon();
        const avatarContent = favicon ? 
            `<img src="${favicon}" alt="${account.name}" class="totp-favicon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="totp-fallback-avatar" style="display:none;">${account.name.charAt(0).toUpperCase()}</div>` :
            `<div class="totp-fallback-avatar">${account.name.charAt(0).toUpperCase()}</div>`;
        
        const descriptionHtml = account.description ? 
            `<div class="totp-account-description">${account.description}</div>` : '';
            
        return `
            <div class="totp-account-card" data-account-id="${account.id}">
                <div class="totp-account-info">
                    <div class="totp-account-avatar">${avatarContent}</div>
                    <div class="totp-account-details">
                        <div class="totp-account-name">${account.name}</div>
                        <div class="totp-account-domain">${account.domain || this.currentDomain}</div>
                        ${descriptionHtml}
                    </div>
                </div>
                <div class="totp-code-section">
                    <div class="totp-code" id="totp-code-${account.id}">Loading...</div>
                    <div class="totp-timer" id="totp-timer-${account.id}">30</div>
                </div>
                <button class="totp-copy-btn" data-account-id="${account.id}">${this.t('copy')}</button>
            </div>
        `;
    }

    addEventListeners() {
        // Cerrar ventana
        const closeBtn = this.floatingWindow.querySelector('.totp-close-btn');
        closeBtn.addEventListener('click', () => this.hideWindow());

        // Botones de copiar
        const copyBtns = this.floatingWindow.querySelectorAll('.totp-copy-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const accountId = e.target.getAttribute('data-account-id');
                this.copyCode(accountId);
            });
        });

        // Generar códigos iniciales
        this.generateCodes();
        
        // Actualizar códigos cada segundo
        this.startTimer();
    }

    async generateCodes() {
        const matchingAccounts = this.findMatchingAccounts();
        
        for (const account of matchingAccounts) {
            try {
                // Importar la lógica TOTP desde la extensión
                const code = await this.generateTOTP(account.secret);
                const codeElement = document.getElementById(`totp-code-${account.id}`);
                if (codeElement) {
                    codeElement.textContent = this.formatCode(code);
                }
            } catch (error) {
                console.error('Error generando código:', error);
                const codeElement = document.getElementById(`totp-code-${account.id}`);
                if (codeElement) {
                    codeElement.textContent = 'ERROR';
                }
            }
        }
    }

    startTimer() {
        setInterval(() => {
            const timeRemaining = this.getTimeRemaining();
            
            // Actualizar timers visuales
            const timerElements = this.floatingWindow.querySelectorAll('.totp-timer');
            timerElements.forEach(timer => {
                timer.textContent = timeRemaining;
                
                // Cambiar color según tiempo restante
                timer.className = 'totp-timer';
                if (timeRemaining <= 5) {
                    timer.classList.add('totp-timer-critical');
                } else if (timeRemaining <= 10) {
                    timer.classList.add('totp-timer-warning');
                }
            });

            // Regenerar códigos cuando llegue a 0
            if (timeRemaining === 30) {
                this.generateCodes();
            }
        }, 1000);
    }

    async copyCode(accountId) {
        const codeElement = document.getElementById(`totp-code-${accountId}`);
        if (!codeElement) return;

        const code = codeElement.textContent.replace(/\s/g, '');
        
        try {
            await navigator.clipboard.writeText(code);
            
            // Cambiar botón a "Copiado" en verde
            const copyBtn = this.floatingWindow.querySelector(`[data-account-id="${accountId}"]`);
            if (copyBtn) {
                copyBtn.textContent = 'Copiado';
                copyBtn.classList.add('totp-copied');
                
                // Guardar timestamp de copia para esta cuenta
                const account = this.accounts.find(acc => acc.id === accountId);
                if (account) {
                    account.lastCopyTime = Date.now();
                    chrome.storage.local.set({ accounts: this.accounts });
                }
                
                // Ocultar ventana después de 3 segundos
                setTimeout(() => {
                    this.hideWindow();
                }, 3000);
            }
            
        } catch (error) {
            console.error('Error copiando código:', error);
        }
    }


    hideWindow() {
        if (this.floatingWindow) {
            this.floatingWindow.classList.remove('totp-visible');
            setTimeout(() => {
                if (this.floatingWindow) {
                    this.floatingWindow.remove();
                    this.floatingWindow = null;
                    this.isVisible = false;
                }
            }, 300);
        }
    }

    // Funciones TOTP simplificadas (copiadas de totp.js)
    async generateTOTP(secret, timeStep = 30, digits = 6) {
        const key = this.base32ToBytes(secret);
        const time = Math.floor(Date.now() / 1000 / timeStep);
        const timeBytes = new ArrayBuffer(8);
        const timeView = new DataView(timeBytes);
        timeView.setUint32(4, time, false);

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, timeBytes);
        const signatureArray = new Uint8Array(signature);
        
        const offset = signatureArray[19] & 0xf;
        const code = ((signatureArray[offset] & 0x7f) << 24) |
                    ((signatureArray[offset + 1] & 0xff) << 16) |
                    ((signatureArray[offset + 2] & 0xff) << 8) |
                    (signatureArray[offset + 3] & 0xff);

        return (code % Math.pow(10, digits)).toString().padStart(digits, '0');
    }

    base32ToBytes(base32) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        
        for (let i = 0; i < base32.length; i++) {
            const char = base32.charAt(i).toUpperCase();
            const index = alphabet.indexOf(char);
            if (index === -1) continue;
            bits += index.toString(2).padStart(5, '0');
        }

        const bytes = new Uint8Array(Math.floor(bits.length / 8));
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
        }

        return bytes;
    }

    formatCode(code) {
        return code.replace(/(\d{3})(\d{3})/, '$1 $2');
    }

    getTimeRemaining() {
        return 30 - (Math.floor(Date.now() / 1000) % 30);
    }

    getFavicon() {
        // Intentar obtener favicon de diferentes fuentes
        let favicon = null;
        
        // 1. Buscar link rel="icon" o rel="shortcut icon"
        const iconLinks = document.querySelectorAll('link[rel*="icon"]');
        if (iconLinks.length > 0) {
            // Priorizar favicon de mayor resolución
            const sortedIcons = Array.from(iconLinks).sort((a, b) => {
                const sizeA = a.getAttribute('sizes') || '16x16';
                const sizeB = b.getAttribute('sizes') || '16x16';
                const numA = parseInt(sizeA.split('x')[0]) || 16;
                const numB = parseInt(sizeB.split('x')[0]) || 16;
                return numB - numA;
            });
            favicon = sortedIcons[0].href;
        }
        
        // 2. Fallback a favicon.ico estándar
        if (!favicon) {
            const origin = window.location.origin;
            favicon = `${origin}/favicon.ico`;
        }
        
        // 3. Verificar si la URL es válida
        try {
            new URL(favicon);
            return favicon;
        } catch {
            return null;
        }
    }
}

// Inicializar cuando la página esté lista
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TotpFloatingWindow();
    });
} else {
    new TotpFloatingWindow();
}
