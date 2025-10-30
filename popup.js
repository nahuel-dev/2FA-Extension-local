class TwoFAManager {
    constructor() {
        this.accounts = [];
        this.timers = new Map();
        this.deleteAccountId = null;
        this.currentPin = null;
        this.init();
    }

    async init() {
        await window.i18n.init();
        await this.checkSecurityStatus();
        await this.loadAccounts();
        this.setupEventListeners();
        this.renderAccounts();
        this.startTimers();
        this.setupStorageListener();
        this.updateLanguage();
    }

    updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = window.i18n.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = window.i18n.t(key);
        });
    }

    setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.lastUnlockTime) {
                this.handleUnlockSync();
            }
        });
    }

    async handleUnlockSync() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        
        if (!isPinConfigured) {
            return;
        }

        if (window.securityManager.isUnlocked) {
            return;
        }

        const lastUnlock = await this.getLastUnlockTime();
        const autoLockTime = await window.securityManager.getAutoLockTime();
        const now = Date.now();

        if (autoLockTime === 0 || (lastUnlock && (now - lastUnlock) < (autoLockTime * 1000))) {
            window.securityManager.isUnlocked = true;
            this.showMainScreen();
        }
    }

    startTimers() {
        this.generateAllCodes();
        
        this.timerInterval = setInterval(() => {
            this.updateTimers();
        }, 1000);

        this.sessionCheckInterval = setInterval(() => {
            this.checkSessionExpiration();
        }, 5000);
    }

    async checkSessionExpiration() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        
        if (!isPinConfigured) {
            return;
        }

        if (!window.securityManager.isUnlocked) {
            return;
        }

        const lastUnlock = await this.getLastUnlockTime();
        const autoLockTime = await window.securityManager.getAutoLockTime();
        const now = Date.now();

        if (autoLockTime > 0 && lastUnlock && (now - lastUnlock) >= (autoLockTime * 1000)) {
            window.securityManager.isUnlocked = false;
            this.showLockScreen();
        }
    }

    async checkSecurityStatus() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        
        if (!isPinConfigured) {
            window.securityManager.isUnlocked = true;
            this.showMainScreen();
        } else {
            const lastUnlock = await this.getLastUnlockTime();
            const autoLockTime = await window.securityManager.getAutoLockTime();
            const now = Date.now();
            
            if (autoLockTime === 0 || (lastUnlock && (now - lastUnlock) < (autoLockTime * 1000))) {
                window.securityManager.isUnlocked = true;
                this.showMainScreen();
            } else {
                this.showLockScreen();
            }
        }
    }

    async getLastUnlockTime() {
        const result = await chrome.storage.local.get(['lastUnlockTime']);
        return result.lastUnlockTime || null;
    }

    async saveLastUnlockTime() {
        await chrome.storage.local.set({ lastUnlockTime: Date.now() });
    }

    async loadAccounts() {
        try {
            const result = await chrome.storage.local.get(['accounts']);
            this.accounts = result.accounts || [];
            console.log('Cuentas cargadas:', this.accounts.length);
        } catch (error) {
            console.error('Error cargando cuentas:', error);
            this.accounts = [];
        }
    }

    async saveAccounts() {
        try {
            console.log('Guardando cuentas:', this.accounts.length);
            await chrome.storage.local.set({ accounts: this.accounts });
            console.log('Cuentas guardadas exitosamente');
        } catch (error) {
            console.error('Error guardando cuentas:', error);
        }
    }

    async showLockScreen() {
        const result = await chrome.storage.local.get(['disguiseMode']);
        const isDisguised = result.disguiseMode || false;

        const lockIcon = document.getElementById('lockIcon');
        const lockTitle = document.getElementById('lockTitle');
        const lockDescription = document.getElementById('lockDescription');
        const pinInput = document.getElementById('pinInput');
        const unlockBtn = document.getElementById('unlockBtn');
        const resetBtn = document.getElementById('resetPinBtn');

        if (isDisguised) {
            lockIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
            lockTitle.textContent = window.i18n.t('disguiseTitle');
            lockDescription.textContent = window.i18n.t('disguiseDescription');
            pinInput.placeholder = window.i18n.t('disguisePlaceholder');
            pinInput.type = 'text';
            unlockBtn.textContent = window.i18n.t('disguiseButton');
            resetBtn.style.display = 'none';
        } else {
            lockIcon.textContent = '🔒';
            lockTitle.textContent = window.i18n.t('extensionLocked');
            lockDescription.textContent = window.i18n.t('enterPinToAccess');
            pinInput.placeholder = window.i18n.t('enterPin');
            pinInput.type = 'password';
            unlockBtn.textContent = window.i18n.t('unlock');
            resetBtn.style.display = 'block';
        }

        document.getElementById('lockScreen').style.display = 'flex';
        document.getElementById('setupScreen').style.display = 'none';
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('pinInput').focus();
    }

    showSetupScreen() {
        document.getElementById('lockScreen').style.display = 'none';
        document.getElementById('setupScreen').style.display = 'flex';
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('newPinInput').focus();
    }

    showMainScreen() {
        document.getElementById('lockScreen').style.display = 'none';
        document.getElementById('setupScreen').style.display = 'none';
        document.getElementById('mainScreen').style.display = 'block';
    }

    setupEventListeners() {
        const unlockForm = document.getElementById('unlockForm');
        if (unlockForm) {
            unlockForm.addEventListener('submit', (e) => {
                this.handleUnlock(e);
            });
        }

        const setupForm = document.getElementById('setupForm');
        if (setupForm) {
            setupForm.addEventListener('submit', (e) => {
                this.handleSetupPin(e);
            });
        }

        const skipSetupBtn = document.getElementById('skipSetupBtn');
        if (skipSetupBtn) {
            skipSetupBtn.addEventListener('click', () => {
                window.securityManager.isUnlocked = true;
                this.showMainScreen();
            });
        }

        const resetPinBtn = document.getElementById('resetPinBtn');
        if (resetPinBtn) {
            resetPinBtn.addEventListener('click', () => {
                this.handleResetPin();
            });
        }

        const confirmDeletePinBtn = document.getElementById('confirmDeletePinBtn');
        if (confirmDeletePinBtn) {
            confirmDeletePinBtn.addEventListener('click', () => {
                this.confirmDeletePin();
            });
        }

        const cancelDeletePinBtn = document.getElementById('cancelDeletePinBtn');
        if (cancelDeletePinBtn) {
            cancelDeletePinBtn.addEventListener('click', () => {
                this.cancelDeletePin();
            });
        }

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettingsPage();
            });
        }

        const addAccountBtn = document.getElementById('addAccountBtn');
        if (addAccountBtn) {
            addAccountBtn.addEventListener('click', () => {
                this.showAddAccountModal();
            });
        }

        const addFirstAccountBtn = document.getElementById('addFirstAccountBtn');
        if (addFirstAccountBtn) {
            addFirstAccountBtn.addEventListener('click', () => {
                this.showAddAccountModal();
            });
        }

        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideAddAccountModal();
            });
        }

        const closeDeleteModal = document.getElementById('closeDeleteModal');
        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        const closeSettingsModal = document.getElementById('closeSettingsModal');
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => {
                this.hideSettingsModal();
            });
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideAddAccountModal();
            });
        }

        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        const addAccountForm = document.getElementById('addAccountForm');
        if (addAccountForm) {
            addAccountForm.addEventListener('submit', (e) => {
                this.handleAddAccount(e);
            });
        }

        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDeleteAccount();
            });
        }

        const addAccountModal = document.getElementById('addAccountModal');
        if (addAccountModal) {
            addAccountModal.addEventListener('click', (e) => {
                if (e.target.id === 'addAccountModal') {
                    this.hideAddAccountModal();
                }
            });
        }

        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target.id === 'deleteModal') {
                    this.hideDeleteModal();
                }
            });
        }
    }

    async showAddAccountModal() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        if (isPinConfigured && !window.securityManager.isUnlocked) {
            this.showLockScreen();
            return;
        }
        
        document.getElementById('addAccountModal').style.display = 'flex';
        document.getElementById('accountName').focus();
    }

    hideAddAccountModal() {
        document.getElementById('addAccountModal').style.display = 'none';
        document.getElementById('addAccountForm').reset();
    }

    showDeleteModal(accountId) {
        this.deleteAccountId = accountId;
        document.getElementById('deleteModal').style.display = 'flex';
    }

    hideDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.deleteAccountId = null;
    }

    async updateUserActivity() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        if (isPinConfigured && window.securityManager.isUnlocked) {
            await this.saveLastUnlockTime();
        }
    }

    async handleAddAccount(e) {
        e.preventDefault();
        
        const isPinConfigured = await window.securityManager.isPinConfigured();
        if (isPinConfigured && !window.securityManager.isUnlocked) {
            this.hideAddAccountModal();
            this.showLockScreen();
            return;
        }

        const accountName = document.getElementById('accountName').value.trim();
        const domainName = document.getElementById('domainName').value.trim();
        const urlName = document.getElementById('urlName').value.trim();
        const secretKey = document.getElementById('secretKey').value.trim().replace(/\s/g, '');

        if (!accountName || !secretKey) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }


        const newAccount = {
            id: Date.now().toString(),
            name: accountName,
            domain: domainName || null,
            url: urlName || null,
            floatingWindowDelay: 'always',
            description: null,
            secret: secretKey,
            createdAt: new Date().toISOString()
        };

        this.accounts.push(newAccount);
        console.log('Cuenta agregada:', newAccount);
        console.log('Total cuentas:', this.accounts.length);
        await this.saveAccounts();
        await this.updateUserActivity(); // Actualizar actividad
        this.renderAccounts();
        this.hideAddAccountModal();
    }

    async confirmDeleteAccount() {
        if (!this.deleteAccountId) return;

        this.accounts = this.accounts.filter(account => account.id !== this.deleteAccountId);
        await this.saveAccounts();
        this.renderAccounts();
        this.hideDeleteModal();
    }

    renderAccounts() {
        console.log('Renderizando cuentas:', this.accounts.length);
        const accountsList = document.getElementById('accountsList');
        const emptyState = document.getElementById('emptyState');

        if (!accountsList) {
            console.error('Elemento accountsList no encontrado');
            return;
        }

        if (!emptyState) {
            console.error('Elemento emptyState no encontrado');
            return;
        }

        if (this.accounts.length === 0) {
            console.log('No hay cuentas, mostrando estado vacío');
            accountsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        console.log('Mostrando', this.accounts.length, 'cuentas');
        accountsList.style.display = 'block';
        emptyState.style.display = 'none';

        accountsList.innerHTML = this.accounts.map(account => `
            <div class="account-item" data-account-id="${account.id}">
                <div class="account-header">
                    <div class="account-name">${this.escapeHtml(account.name)}</div>
                    <button class="delete-btn" data-account-id="${account.id}">
                        ${window.i18n.t('delete')}
                    </button>
                </div>
                <div class="code-display">
                    <div class="code" id="code-${account.id}">000 000</div>
                    <div class="code-timer">
                        <div class="timer-circle" id="timer-${account.id}">30</div>
                        <button class="copy-btn" data-account-id="${account.id}">
                            ${window.i18n.t('copy')}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.updateLanguage();

        this.setupDynamicEventListeners();

        this.generateAllCodes();
    }

    setupDynamicEventListeners() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const accountId = btn.getAttribute('data-account-id');
                this.showDeleteModal(accountId);
            });
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const accountId = btn.getAttribute('data-account-id');
                this.copyCode(accountId);
            });
        });

        document.querySelectorAll('.account-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn') || e.target.classList.contains('copy-btn')) {
                    return;
                }
                const accountId = item.getAttribute('data-account-id');
                this.selectAccount(accountId);
            });
        });
    }

    selectAccount(accountId) {
        const account = this.accounts.find(acc => acc.id === accountId);
        if (!account) return;

        document.querySelectorAll('.account-item').forEach(item => {
            item.classList.remove('selected');
        });

        const selectedItem = document.querySelector(`[data-account-id="${accountId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        const detailsHeader = document.querySelector('.details-header');
        const detailsContent = document.getElementById('accountDetailsContent');
        const detailName = document.getElementById('detailName');
        const detailDomain = document.getElementById('detailDomain');
        const detailUrl = document.getElementById('detailUrl');
        const detailSecret = document.getElementById('detailSecret');

        const detailDescription = document.getElementById('detailDescription');

        if (detailsHeader && detailsContent && detailName && detailDomain && detailUrl && detailSecret && detailDescription) {
            detailsHeader.style.display = 'none';
            detailsContent.style.display = 'flex';

            detailName.textContent = account.name;
            detailDomain.textContent = account.domain || 'No configurado';
            detailUrl.textContent = account.url || 'No configurado';
            detailSecret.textContent = account.secret;
            detailDescription.textContent = account.description || 'Sin descripción';
            
            const floatingWindowSelect = document.getElementById('detailFloatingWindow');
            if (floatingWindowSelect) {
                floatingWindowSelect.value = account.floatingWindowDelay || 'always';
            }

            this.currentEditingAccountId = accountId;

            this.setupEditListeners();
        }
    }

    setupEditListeners() {
        const nameField = document.getElementById('detailName');
        const domainField = document.getElementById('detailDomain');
        const urlField = document.getElementById('detailUrl');
        const descriptionField = document.getElementById('detailDescription');
        const floatingWindowSelect = document.getElementById('detailFloatingWindow');

        if (nameField) {
            nameField.onclick = () => this.startEdit('name');
        }
        if (domainField) {
            domainField.onclick = () => this.startEdit('domain');
        }
        if (urlField) {
            urlField.onclick = () => this.startEdit('url');
        }
        if (descriptionField) {
            descriptionField.onclick = () => this.startEdit('description');
        }
        if (floatingWindowSelect) {
            floatingWindowSelect.onchange = () => this.updateFloatingWindowDelay();
        }
    }

    async updateFloatingWindowDelay() {
        if (!this.currentEditingAccountId) return;

        const account = this.accounts.find(acc => acc.id === this.currentEditingAccountId);
        if (!account) return;

        const floatingWindowSelect = document.getElementById('detailFloatingWindow');
        if (floatingWindowSelect) {
            account.floatingWindowDelay = floatingWindowSelect.value;
            
            try {
                await chrome.storage.local.set({ accounts: this.accounts });
                console.log('Configuración de ventana flotante actualizada:', floatingWindowSelect.value);
            } catch (error) {
                console.error('Error guardando configuración:', error);
            }
        }
    }

    startEdit(field) {
        const valueElement = document.getElementById(`detail${field.charAt(0).toUpperCase() + field.slice(1)}`);
        const inputElement = document.getElementById(`detail${field.charAt(0).toUpperCase() + field.slice(1)}Input`);

        if (valueElement && inputElement) {
            valueElement.style.display = 'none';
            inputElement.style.display = 'block';
            
            let currentValue = valueElement.textContent;
            if (currentValue === 'No configurado' || currentValue === 'Sin descripción') {
                inputElement.value = '';
            } else {
                inputElement.value = currentValue;
            }
            
            inputElement.focus();

            this.setupAutoSave(inputElement, field);

            this.isEditing = true;
        }
    }

    setupAutoSave(inputElement, field) {
        let saveTimeout;
        
        const autoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.autoSaveField(field, inputElement.value);
            }, 1000);
        };

        inputElement.onkeyup = null;
        inputElement.onblur = null;

        inputElement.onkeyup = autoSave;
        inputElement.onblur = () => {
            clearTimeout(saveTimeout);
            this.autoSaveField(field, inputElement.value);
        };
    }

    async autoSaveField(field, value) {
        if (!this.currentEditingAccountId) return;

        const account = this.accounts.find(acc => acc.id === this.currentEditingAccountId);
        if (!account) return;

        if (field === 'name') {
            account.name = value.trim() || account.name;
        } else if (field === 'domain') {
            account.domain = value.trim();
        } else if (field === 'url') {
            account.url = value.trim();
        } else if (field === 'description') {
            account.description = value.trim();
        }

        try {
            await chrome.storage.local.set({ accounts: this.accounts });
            
            const valueElement = document.getElementById(`detail${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (valueElement) {
                if (field === 'description') {
                    valueElement.textContent = value.trim() || 'Sin descripción';
                } else {
                    valueElement.textContent = value.trim() || 'No configurado';
                }
            }
            
            this.finishEdit(field);

            console.log(`Campo ${field} actualizado automáticamente`);
        } catch (error) {
            console.error('Error guardando cambios:', error);
        }
    }

    finishEdit(field) {
        const valueElement = document.getElementById(`detail${field.charAt(0).toUpperCase() + field.slice(1)}`);
        const inputElement = document.getElementById(`detail${field.charAt(0).toUpperCase() + field.slice(1)}Input`);

        if (valueElement && inputElement) {
            valueElement.style.display = 'block';
            inputElement.style.display = 'none';
        }

        this.isEditing = false;
    }



    async generateAllCodes() {
        if (!this.accounts || this.accounts.length === 0) {
            console.log('No hay cuentas para generar códigos');
            return;
        }

        for (const account of this.accounts) {
            try {
                const code = await window.totpGenerator.generateTOTP(account.secret);
                const codeElement = document.getElementById(`code-${account.id}`);
                if (codeElement) {
                    codeElement.textContent = window.totpGenerator.formatCode(code);
                } else {
                    console.warn(`Elemento code-${account.id} no encontrado`);
                }
            } catch (error) {
                console.error(`Error generando código para ${account.name}:`, error);
                const codeElement = document.getElementById(`code-${account.id}`);
                if (codeElement) {
                    codeElement.textContent = 'ERROR';
                }
            }
        }
    }

    async copyCode(accountId) {
        console.log('Intentando copiar código para:', accountId);
        const codeElement = document.getElementById(`code-${accountId}`);
        if (!codeElement) {
            console.error('Elemento de código no encontrado:', accountId);
            return;
        }

        const code = codeElement.textContent.replace(/\s/g, '');
        console.log('Código a copiar:', code);
        
        if (!code || code === '------' || code === 'ERROR') {
            console.error('Código no válido:', code);
            alert('El código no está disponible aún');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(code);
            console.log('Código copiado exitosamente');
            
            const copyBtn = codeElement.parentElement.querySelector('.copy-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = window.i18n.t('copied');
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }
        } catch (error) {
            console.error('Error copiando al portapapeles:', error);
            this.fallbackCopyTextToClipboard(code);
        }
    }

    fallbackCopyTextToClipboard(text) {
        console.log('Usando fallback para copiar:', text);
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('Fallback: Código copiado exitosamente');
                const copyBtns = document.querySelectorAll('.copy-btn');
                copyBtns.forEach(btn => {
                    const copyText = window.i18n.t('copy');
                    if (btn.textContent.trim() === copyText || btn.textContent === 'Copiar' || btn.textContent === 'Copy') {
                        btn.textContent = window.i18n.t('copied');
                        btn.classList.add('copied');
                        setTimeout(() => {
                            btn.textContent = copyText;
                            btn.classList.remove('copied');
                        }, 2000);
                    }
                });
            } else {
                console.error('Fallback: No se pudo copiar');
                alert('No se pudo copiar el código');
            }
        } catch (err) {
            console.error('Fallback: Error al copiar', err);
            alert('Error al copiar: ' + err.message);
        }
        
        document.body.removeChild(textArea);
    }

    updateTimers() {
        if (!this.accounts || this.accounts.length === 0) return;

        const timeRemaining = window.totpGenerator.getTimeRemaining();
        
        let primaryColor = '#10b981'; // Verde por defecto
        let shadowColor = 'rgba(16, 185, 129, 0.3)';
        
        if (timeRemaining <= 5) {
            primaryColor = '#ef4444'; // Rojo crítico
            shadowColor = 'rgba(239, 68, 68, 0.4)';
        } else if (timeRemaining <= 10) {
            primaryColor = '#f59e0b'; // Amarillo advertencia
            shadowColor = 'rgba(245, 158, 11, 0.4)';
        }

        this.accounts.forEach(account => {
            const timerElement = document.getElementById(`timer-${account.id}`);
            if (timerElement) {
                timerElement.textContent = timeRemaining;
                
                const progress = (30 - timeRemaining) / 30;
                const degrees = progress * 360;
                
                timerElement.style.background = `conic-gradient(${primaryColor} ${degrees}deg, #1f2937 ${degrees}deg)`;
                timerElement.style.boxShadow = `0 4px 12px ${shadowColor}`;
                timerElement.style.color = '#ffffff';
                timerElement.style.borderColor = primaryColor;
                
                if (timeRemaining <= 5) {
                    timerElement.style.animation = 'pulse 1s infinite';
                } else {
                    timerElement.style.animation = 'none';
                }
            }
        });
        
        if (timeRemaining === 30) {
            this.generateAllCodes();
        }
    }

    async handleUnlock(e) {
        e.preventDefault();
        const pin = document.getElementById('pinInput').value;
        const errorElement = document.getElementById('pinError');

        const result = await chrome.storage.local.get(['disguiseMode', 'resetOnFailedAttempts', 'decoyModeActivated', 'failedAttempts', 'maxFailedAttempts']);
        const isDisguised = result.disguiseMode || false;
        const resetOnFailedAttempts = result.resetOnFailedAttempts || false;
        const decoyModeActivated = result.decoyModeActivated || false;
        const maxFailedAttempts = result.maxFailedAttempts || 5;
        let failedAttempts = result.failedAttempts || 0;

        if (decoyModeActivated) {
            this.currentPin = pin;
            await this.saveLastUnlockTime();
            await this.loadAccounts();
            this.showMainScreen();
            this.renderAccounts();
            this.startTimers();
            document.getElementById('pinInput').value = '';
            errorElement.style.display = 'none';
            return;
        }

        try {
            const isValid = await window.securityManager.verifyPin(pin);
            if (isValid) {
                this.currentPin = pin;
                await this.saveLastUnlockTime();
                await chrome.storage.local.set({ failedAttempts: 0 });
                this.showMainScreen();
                document.getElementById('pinInput').value = '';
                errorElement.style.display = 'none';
            } else {
                failedAttempts++;
                await chrome.storage.local.set({ failedAttempts: failedAttempts });

                if (resetOnFailedAttempts && failedAttempts >= maxFailedAttempts) {
                    await chrome.storage.local.clear();
                    window.location.reload();
                    return;
                }

                if (isDisguised) {
                    errorElement.textContent = window.i18n.t('videoNotFound');
                } else {
                    const attemptsLeft = resetOnFailedAttempts ? (maxFailedAttempts - failedAttempts) : null;
                    if (attemptsLeft !== null && attemptsLeft > 0) {
                        const lang = window.i18n.getCurrentLanguage();
                        if (lang === 'es') {
                            errorElement.textContent = `PIN incorrecto (${attemptsLeft} intento${attemptsLeft !== 1 ? 's' : ''} restante${attemptsLeft !== 1 ? 's' : ''})`;
                        } else {
                            errorElement.textContent = `Incorrect PIN (${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining)`;
                        }
                    } else {
                        errorElement.textContent = window.i18n.t('incorrectPin');
                    }
                }
                errorElement.style.display = 'block';
                document.getElementById('pinInput').value = '';
                document.getElementById('pinInput').focus();
            }
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    }

    async handleSetupPin(e) {
        e.preventDefault();
        const newPin = document.getElementById('newPinInput').value;
        const confirmPin = document.getElementById('confirmPinInput').value;
        const errorElement = document.getElementById('setupError');

        if (newPin !== confirmPin) {
            errorElement.textContent = 'Los PINs no coinciden';
            errorElement.style.display = 'block';
            return;
        }

        try {
            await window.securityManager.setupPin(newPin);
            this.currentPin = newPin;
            await this.saveLastUnlockTime(); // Guardar tiempo de configuración
            this.showMainScreen();
            document.getElementById('setupForm').reset();
            errorElement.style.display = 'none';
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    }

    async handleResetPin() {
        document.getElementById('confirmDeletePinModal').style.display = 'flex';
    }

    async confirmDeletePin() {
        await window.securityManager.removePin();
        this.accounts = [];
        await this.saveAccounts();
        document.getElementById('confirmDeletePinModal').style.display = 'none';
        this.showSetupScreen();
    }

    cancelDeletePin() {
        document.getElementById('confirmDeletePinModal').style.display = 'none';
    }

    openSettingsPage() {
        chrome.tabs.create({
            url: chrome.runtime.getURL('settings.html')
        });
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    setupSettingsListeners() {
        document.getElementById('changePinBtn').addEventListener('click', () => {
            this.hideSettingsModal();
            this.showSetupScreen();
        });

        document.getElementById('removePinBtn').addEventListener('click', async () => {
            const confirmed = confirm('¿Estás seguro de que quieres eliminar el PIN?');
            if (confirmed) {
                await window.securityManager.removePin();
                this.hideSettingsModal();
                this.showSettingsModal(); // Refresh
            }
        });

        document.getElementById('autoLockSelect').addEventListener('change', async (e) => {
            const seconds = parseInt(e.target.value);
            await window.securityManager.setAutoLockTime(seconds);
        });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.manager = new TwoFAManager();
});
