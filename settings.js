class SettingsManager {
    constructor() {
        this.init();
    }

    async init() {
        await window.i18n.init();
        await this.checkSecurityStatus();
        await this.loadSettings();
        this.setupEventListeners();
        this.startSessionCheck();
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

        const lockScreen = document.getElementById('settingsLockScreen');
        if (lockScreen && lockScreen.style.display === 'none') {
            return;
        }

        const lastUnlock = await this.getLastUnlockTime();
        const autoLockTime = await window.securityManager.getAutoLockTime();
        const now = Date.now();

        if (autoLockTime === 0 || (lastUnlock && (now - lastUnlock) < (autoLockTime * 1000))) {
            this.showSettingsContent();
        }
    }

    startSessionCheck() {
        this.sessionCheckInterval = setInterval(() => {
            this.checkSessionExpiration();
        }, 5000);
    }

    async checkSessionExpiration() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        
        if (!isPinConfigured) {
            return;
        }

        const lockScreen = document.getElementById('settingsLockScreen');
        if (lockScreen && lockScreen.style.display === 'flex') {
            return;
        }

        const lastUnlock = await this.getLastUnlockTime();
        const autoLockTime = await window.securityManager.getAutoLockTime();
        const now = Date.now();

        if (autoLockTime > 0 && lastUnlock && (now - lastUnlock) >= (autoLockTime * 1000)) {
            this.showSettingsLockScreen();
        }
    }

    async checkSecurityStatus() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        
        if (!isPinConfigured) {
            this.showSettingsContent();
        } else {
            const lastUnlock = await this.getLastUnlockTime();
            const autoLockTime = await window.securityManager.getAutoLockTime();
            const now = Date.now();
            
            if (autoLockTime === 0 || (lastUnlock && (now - lastUnlock) < (autoLockTime * 1000))) {
                this.showSettingsContent();
            } else {
                this.showSettingsLockScreen();
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

    showSettingsLockScreen() {
        document.getElementById('settingsLockScreen').style.display = 'flex';
        document.getElementById('settingsMainContent').style.display = 'none';
        document.getElementById('settingsPinInput').focus();
    }

    showSettingsContent() {
        document.getElementById('settingsLockScreen').style.display = 'none';
        document.getElementById('settingsMainContent').style.display = 'block';
    }

    async loadSettings() {
        try {
            const isPinConfigured = await window.securityManager.isPinConfigured();
            const autoLockTime = await window.securityManager.getAutoLockTime();

            const pinStatus = document.getElementById('pinStatus');
            const removePinBtn = document.getElementById('removePinBtn');
            const changePinBtn = document.getElementById('changePinBtn');

            if (isPinConfigured) {
                pinStatus.textContent = window.i18n.t('configured');
                pinStatus.className = 'pin-status configured';
                removePinBtn.style.display = 'inline-block';
                changePinBtn.textContent = window.i18n.t('changePin');
            } else {
                pinStatus.textContent = window.i18n.t('notConfigured');
                pinStatus.className = 'pin-status not-configured';
                removePinBtn.style.display = 'none';
                changePinBtn.textContent = window.i18n.t('setupPinBtn');
            }

            const autoLockSelect = document.getElementById('autoLockSelect');
            if (autoLockSelect) {
                autoLockSelect.value = autoLockTime;
            }

            const result = await chrome.storage.local.get(['disguiseMode', 'resetOnFailedAttempts']);
            const disguiseModeToggle = document.getElementById('disguiseModeToggle');
            if (disguiseModeToggle) {
                disguiseModeToggle.checked = result.disguiseMode || false;
            }

            const resetOnFailedAttemptsToggle = document.getElementById('resetOnFailedAttemptsToggle');
            if (resetOnFailedAttemptsToggle) {
                resetOnFailedAttemptsToggle.checked = result.resetOnFailedAttempts || false;
            }

            const decoyModeToggle = document.getElementById('decoyModeToggle');
            if (decoyModeToggle) {
                decoyModeToggle.checked = result.decoyModeEnabled || false;
            }

            const decoyBehaviorSetting = document.getElementById('decoyBehaviorSetting');
            const decoyBehaviorSelect = document.getElementById('decoyBehaviorSelect');
            if (decoyBehaviorSetting && decoyBehaviorSelect) {
                if (result.decoyModeEnabled) {
                    decoyBehaviorSetting.style.display = 'block';
                } else {
                    decoyBehaviorSetting.style.display = 'none';
                }
                decoyBehaviorSelect.value = result.decoyBehavior || 'locked';
            }

            const maxAttempts = result.maxFailedAttempts || 5;
            const description = document.getElementById('resetAttemptsDescription');
            if (description && result.resetOnFailedAttempts) {
                description.textContent = `Elimina todas las cuentas y configuraciones después de ${maxAttempts} intentos fallidos de PIN.`;
            }

        } catch (error) {
            console.error('Error cargando configuraciones:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('backBtn').addEventListener('click', () => {
            window.close();
        });

        document.getElementById('changePinBtn').addEventListener('click', () => {
            this.showChangePinModal();
        });

        document.getElementById('removePinBtn').addEventListener('click', () => {
            this.showRemovePinModal();
        });

        document.getElementById('autoLockSelect').addEventListener('change', (e) => {
            this.handleAutoLockChange(e.target.value);
        });

        document.getElementById('resetExtensionBtn').addEventListener('click', () => {
            this.handleResetExtension();
        });

        document.getElementById('disguiseModeToggle').addEventListener('change', (e) => {
            this.handleDisguiseModeToggle(e.target.checked);
        });

        document.getElementById('resetOnFailedAttemptsToggle').addEventListener('change', (e) => {
            this.handleResetOnFailedAttemptsToggle(e.target.checked);
        });

        document.getElementById('decoyModeToggle').addEventListener('change', (e) => {
            this.handleDecoyModeToggle(e.target.checked);
        });

        document.getElementById('decoyBehaviorSelect').addEventListener('change', async (e) => {
            await chrome.storage.local.set({ decoyBehavior: e.target.value });
            const message = window.i18n.getCurrentLanguage() === 'es' ?
                (e.target.value === 'unlocked' ? 
                    'Configurado para desbloquear automáticamente. El atacante verá códigos falsos.' :
                    'Configurado para permanecer bloqueada. El atacante no podrá acceder.') :
                (e.target.value === 'unlocked' ?
                    'Set to auto-unlock. Attacker will see fake codes.' :
                    'Set to keep locked. Attacker cannot access.');
            this.showSuccessModal(window.i18n.t('configUpdated'), message);
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.initiateExport();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.handleImport(e);
        });

        document.getElementById('closeChangePinModal').addEventListener('click', () => {
            this.hideChangePinModal();
        });

        document.getElementById('cancelChangePinBtn').addEventListener('click', () => {
            this.hideChangePinModal();
        });

        document.getElementById('changePinForm').addEventListener('submit', (e) => {
            this.handleChangePinSubmit(e);
        });

        document.getElementById('closeRemovePinModal').addEventListener('click', () => {
            this.hideRemovePinModal();
        });

        document.getElementById('cancelRemovePinBtn').addEventListener('click', () => {
            this.hideRemovePinModal();
        });

        document.getElementById('removePinForm').addEventListener('submit', (e) => {
            this.handleRemovePinSubmit(e);
        });

        document.getElementById('closeExportPinModal').addEventListener('click', () => {
            this.hideExportPinModal();
        });

        document.getElementById('cancelExportPinBtn').addEventListener('click', () => {
            this.hideExportPinModal();
        });

        document.getElementById('exportPinForm').addEventListener('submit', (e) => {
            this.handleExportPinSubmit(e);
        });

        document.getElementById('closeSuccessModal').addEventListener('click', () => {
            this.hideSuccessModal();
        });

        document.getElementById('acceptSuccessBtn').addEventListener('click', () => {
            this.hideSuccessModal();
        });

        document.getElementById('closeAttemptsConfigModal').addEventListener('click', () => {
            this.hideAttemptsConfigModal();
        });

        document.getElementById('cancelAttemptsConfigBtn').addEventListener('click', () => {
            this.hideAttemptsConfigModal();
        });

        document.getElementById('attemptsConfigForm').addEventListener('submit', (e) => {
            this.handleAttemptsConfigSubmit(e);
        });

        document.getElementById('increaseAttempts').addEventListener('click', () => {
            this.adjustAttempts(1);
        });

        document.getElementById('decreaseAttempts').addEventListener('click', () => {
            this.adjustAttempts(-1);
        });

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = window.i18n.getCurrentLanguage();
            languageSelect.addEventListener('change', async (e) => {
                await this.handleLanguageChange(e.target.value);
            });
        }

        const settingsUnlockForm = document.getElementById('settingsUnlockForm');
        if (settingsUnlockForm) {
            settingsUnlockForm.addEventListener('submit', (e) => {
                this.handleSettingsUnlock(e);
            });
        }

        document.getElementById('changePinModal').addEventListener('click', (e) => {
            if (e.target.id === 'changePinModal') {
                this.hideChangePinModal();
            }
        });

        document.getElementById('removePinModal').addEventListener('click', (e) => {
            if (e.target.id === 'removePinModal') {
                this.hideRemovePinModal();
            }
        });

        document.getElementById('exportPinModal').addEventListener('click', (e) => {
            if (e.target.id === 'exportPinModal') {
                this.hideExportPinModal();
            }
        });

        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target.id === 'successModal') {
                this.hideSuccessModal();
            }
        });

        document.getElementById('attemptsConfigModal').addEventListener('click', (e) => {
            if (e.target.id === 'attemptsConfigModal') {
                this.hideAttemptsConfigModal();
            }
        });
    }

    showChangePinModal() {
        const modal = document.getElementById('changePinModal');
        const title = document.getElementById('changePinTitle');
        const currentPinGroup = document.querySelector('#currentPin').parentElement;
        
        window.securityManager.isPinConfigured().then(isPinConfigured => {
            if (isPinConfigured) {
                title.textContent = window.i18n.translate('changePin');
                currentPinGroup.style.display = 'block';
                document.getElementById('currentPin').required = true;
            } else {
                title.textContent = window.i18n.translate('setupPinBtn');
                currentPinGroup.style.display = 'none';
                document.getElementById('currentPin').required = false;
            }
        });

        modal.style.display = 'flex';
        document.getElementById('newPin').focus();
    }

    hideChangePinModal() {
        document.getElementById('changePinModal').style.display = 'none';
        document.getElementById('changePinForm').reset();
        document.getElementById('changePinError').style.display = 'none';
    }

    async handleChangePinSubmit(e) {
        e.preventDefault();
        
        const currentPin = document.getElementById('currentPin').value;
        const newPin = document.getElementById('newPin').value;
        const confirmNewPin = document.getElementById('confirmNewPin').value;
        const errorElement = document.getElementById('changePinError');

        if (newPin !== confirmNewPin) {
            this.showError('Los PINs no coinciden');
            return;
        }

        if (newPin.length < 4 || newPin.length > 6) {
            this.showError('El PIN debe tener entre 4 y 6 dígitos');
            return;
        }

        if (!/^\d+$/.test(newPin)) {
            this.showError('El PIN solo puede contener números');
            return;
        }

        try {
            const isPinConfigured = await window.securityManager.isPinConfigured();
            
            if (isPinConfigured) {
                const isCurrentValid = await window.securityManager.verifyPin(currentPin);
                if (!isCurrentValid) {
                    this.showError('PIN actual incorrecto');
                    return;
                }
                
                await window.securityManager.changePin(currentPin, newPin);
            } else {
                await window.securityManager.setupPin(newPin);
            }

            this.hideChangePinModal();
            await this.loadSettings(); // Recargar configuraciones
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    showRemovePinModal() {
        document.getElementById('removePinModal').style.display = 'flex';
        document.getElementById('removePinCurrent').focus();
    }

    hideRemovePinModal() {
        document.getElementById('removePinModal').style.display = 'none';
        document.getElementById('removePinForm').reset();
        document.getElementById('removePinError').style.display = 'none';
    }

    async handleRemovePinSubmit(e) {
        e.preventDefault();
        
        const currentPin = document.getElementById('removePinCurrent').value;
        const errorElement = document.getElementById('removePinError');

        if (!currentPin) {
            this.showRemovePinError('Debes ingresar tu PIN actual');
            return;
        }

        try {
            const isValid = await window.securityManager.verifyPin(currentPin);
            if (!isValid) {
                this.showRemovePinError(window.i18n.t('incorrectPin'));
                return;
            }

            const confirmed = confirm('¿Estás seguro de que quieres eliminar el PIN? Tus cuentas OTP se mantendrán guardadas.');
            
            if (confirmed) {
                await window.securityManager.removePin();
                await this.loadSettings();
                this.hideRemovePinModal();
                alert('PIN eliminado exitosamente. Tus cuentas OTP se han mantenido guardadas.');
            }
            
        } catch (error) {
            this.showRemovePinError('Error al eliminar PIN: ' + error.message);
        }
    }

    showRemovePinError(message) {
        const errorElement = document.getElementById('removePinError');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    async handleAutoLockChange(value) {
        try {
            await window.securityManager.setAutoLockTime(parseInt(value));
        } catch (error) {
            console.error('Error configurando auto-lock:', error);
            alert('Error al configurar auto-bloqueo');
        }
    }

    async handleDisguiseModeToggle(enabled) {
        try {
            const isPinConfigured = await window.securityManager.isPinConfigured();
            
            if (enabled && !isPinConfigured) {
                document.getElementById('disguiseModeToggle').checked = false;
                this.showSuccessModal('⚠️ PIN requerido', 'Debes configurar un PIN antes de activar el modo camuflaje.');
                return;
            }

            const isDisguised = await chrome.storage.local.get('disguiseMode');
            await chrome.storage.local.set({ disguiseMode: enabled });
            
            const message = window.i18n.getCurrentLanguage() === 'es' ?
                (isDisguised ? 
                    'Modo camuflaje activado. La extensión se mostrará como un descargador de videos de X.com.' :
                    'Modo camuflaje desactivado. La extensión se mostrará normalmente.') :
                (isDisguised ? 
                    'Disguise mode activated. The extension will be displayed as an X.com video downloader.' :
                    'Disguise mode deactivated. The extension will be displayed normally.');
            
            this.showSuccessModal(window.i18n.t('configUpdated'), message);
            
        } catch (error) {
            console.error('Error configurando modo camuflaje:', error);
            this.showSuccessModal('❌ Error', 'Error al configurar modo camuflaje: ' + error.message);
        }
    }

    async handleResetOnFailedAttemptsToggle(enabled) {
        try {
            const isPinConfigured = await window.securityManager.isPinConfigured();
            
            if (enabled && !isPinConfigured) {
                document.getElementById('resetOnFailedAttemptsToggle').checked = false;
                this.showSuccessModal('⚠️ PIN requerido', 'Debes configurar un PIN antes de activar esta función.');
                return;
            }

            const result = await chrome.storage.local.get(['decoyModeEnabled']);
            if (enabled && result.decoyModeEnabled) {
                document.getElementById('resetOnFailedAttemptsToggle').checked = false;
                const message = window.i18n.getCurrentLanguage() === 'es' ?
                    'No puedes activar ambos modos al mismo tiempo. El modo señuelo ya está activo. Desactívalo primero si deseas usar el restablecimiento completo.' :
                    'You cannot activate both modes at the same time. Decoy mode is already active. Deactivate it first if you want to use full reset.';
                this.showSuccessModal('⚠️ Conflicto de configuración', message);
                return;
            }

            if (enabled) {
                this.showAttemptsConfigModal();
            } else {
                await chrome.storage.local.set({ resetOnFailedAttempts: false });
                const message = window.i18n.getCurrentLanguage() === 'es' ?
                    'Restablecimiento por intentos fallidos desactivado.' :
                    'Reset on failed attempts deactivated.';
                this.showSuccessModal(window.i18n.t('configUpdated'), message);
                await this.loadSettings();
            }
            
        } catch (error) {
            console.error('Error configurando restablecimiento por intentos fallidos:', error);
            this.showSuccessModal('❌ Error', 'Error al configurar: ' + error.message);
        }
    }

    async handleDecoyModeToggle(enabled) {
        try {
            const isPinConfigured = await window.securityManager.isPinConfigured();
            
            if (enabled && !isPinConfigured) {
                document.getElementById('decoyModeToggle').checked = false;
                this.showSuccessModal('⚠️ PIN requerido', 'Debes configurar un PIN antes de activar el modo señuelo.');
                return;
            }

            const result = await chrome.storage.local.get(['resetOnFailedAttempts']);
            if (enabled && result.resetOnFailedAttempts) {
                document.getElementById('decoyModeToggle').checked = false;
                const message = window.i18n.getCurrentLanguage() === 'es' ?
                    'No puedes activar ambos modos al mismo tiempo. El restablecimiento completo ya está activo. Desactívalo primero si deseas usar el modo señuelo.' :
                    'You cannot activate both modes at the same time. Full reset is already active. Deactivate it first if you want to use decoy mode.';
                this.showSuccessModal('⚠️ Conflicto de configuración', message);
                return;
            }

            if (enabled) {
                this.showAttemptsConfigModal();
            } else {
                await chrome.storage.local.set({ decoyModeEnabled: false });
                document.getElementById('decoyBehaviorSetting').style.display = 'none';
                const message = window.i18n.getCurrentLanguage() === 'es' ?
                    'Modo señuelo desactivado.' :
                    'Decoy mode deactivated.';
                this.showSuccessModal(window.i18n.t('configUpdated'), message);
                await this.loadSettings();
            }
            
        } catch (error) {
            console.error('Error configurando modo señuelo:', error);
            this.showSuccessModal('❌ Error', 'Error al configurar: ' + error.message);
        }
    }

    adjustAttempts(delta) {
        const input = document.getElementById('maxAttemptsInput');
        const currentValue = parseInt(input.value) || 5;
        const newValue = Math.max(1, currentValue + delta);
        input.value = newValue;
        this.updateAttemptsButtons();
    }

    updateAttemptsButtons() {
        const input = document.getElementById('maxAttemptsInput');
        const value = parseInt(input.value) || 5;
        const decreaseBtn = document.getElementById('decreaseAttempts');
        const increaseBtn = document.getElementById('increaseAttempts');
        
        decreaseBtn.disabled = value <= 1;
        increaseBtn.disabled = false;
    }

    showAttemptsConfigModal() {
        const modal = document.getElementById('attemptsConfigModal');
        const input = document.getElementById('maxAttemptsInput');
        
        chrome.storage.local.get(['maxFailedAttempts']).then(result => {
            input.value = result.maxFailedAttempts || 5;
            this.updateAttemptsButtons();
        });
        
        input.addEventListener('input', () => {
            this.updateAttemptsButtons();
        });
        
        modal.style.display = 'flex';
        input.focus();
    }

    hideAttemptsConfigModal() {
        const modal = document.getElementById('attemptsConfigModal');
        modal.style.display = 'none';
        document.getElementById('attemptsConfigForm').reset();
        document.getElementById('attemptsConfigError').style.display = 'none';
    }

    async handleSettingsUnlock(e) {
        e.preventDefault();
        const pin = document.getElementById('settingsPinInput').value;
        const errorElement = document.getElementById('settingsPinError');

        try {
            const isValid = await window.securityManager.verifyPin(pin);
            if (isValid) {
                await this.saveLastUnlockTime();
                this.showSettingsContent();
                document.getElementById('settingsPinInput').value = '';
                errorElement.style.display = 'none';
            } else {
                errorElement.textContent = window.i18n.t('incorrectPin');
                errorElement.style.display = 'block';
                document.getElementById('settingsPinInput').value = '';
                document.getElementById('settingsPinInput').focus();
            }
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    }

    async handleLanguageChange(lang) {
        await window.i18n.setLanguage(lang);
        this.updateLanguage();
        
        const isPinConfigured = await window.securityManager.isPinConfigured();
        const pinStatus = document.getElementById('pinStatus');
        const changePinBtn = document.getElementById('changePinBtn');
        
        if (isPinConfigured) {
            pinStatus.textContent = window.i18n.t('configured');
            changePinBtn.textContent = window.i18n.t('changePin');
        } else {
            pinStatus.textContent = window.i18n.t('notConfigured');
            changePinBtn.textContent = window.i18n.t('setupPinBtn');
        }
        
        this.showSuccessModal(window.i18n.t('configUpdated'), 
            lang === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English');
    }

    async handleAttemptsConfigSubmit(e) {
        e.preventDefault();
        
        const maxAttempts = parseInt(document.getElementById('maxAttemptsInput').value);
        const errorElement = document.getElementById('attemptsConfigError');

        if (maxAttempts < 1 || isNaN(maxAttempts)) {
            errorElement.textContent = window.i18n.getCurrentLanguage() === 'es' ? 
                'El número de intentos debe ser al menos 1' :
                'The number of attempts must be at least 1';
            errorElement.style.display = 'block';
            return;
        }

        try {
            const resetToggle = document.getElementById('resetOnFailedAttemptsToggle').checked;
            const decoyToggle = document.getElementById('decoyModeToggle').checked;
            
            await chrome.storage.local.set({ 
                resetOnFailedAttempts: resetToggle,
                decoyModeEnabled: decoyToggle,
                maxFailedAttempts: maxAttempts
            });
            
            this.hideAttemptsConfigModal();
            
            let message = '';
            if (decoyToggle) {
                message = window.i18n.getCurrentLanguage() === 'es' ?
                    `Modo señuelo activado. Después de ${maxAttempts} intentos fallidos, se generarán 30 cuentas OTP falsas y se eliminarán las originales.` :
                    `Decoy mode activated. After ${maxAttempts} failed attempts, 30 fake OTP accounts will be generated and originals deleted.`;
            } else if (resetToggle) {
                message = window.i18n.getCurrentLanguage() === 'es' ?
                    `Restablecimiento activado. La extensión se restablecerá después de ${maxAttempts} intentos fallidos.` :
                    `Reset activated. The extension will reset after ${maxAttempts} failed attempts.`;
            }
            
            this.showSuccessModal(window.i18n.t('configUpdated'), message);
            
            document.getElementById('resetOnFailedAttemptsToggle').checked = resetToggle;
            document.getElementById('decoyModeToggle').checked = decoyToggle;
            
            const decoyBehaviorSetting = document.getElementById('decoyBehaviorSetting');
            if (decoyBehaviorSetting) {
                if (decoyToggle) {
                    decoyBehaviorSetting.style.display = 'block';
                } else {
                    decoyBehaviorSetting.style.display = 'none';
                }
            }
            
            const description = document.getElementById('resetAttemptsDescription');
            if (description && (resetToggle || decoyToggle)) {
                const baseText = window.i18n.t('resetOnFailedAttemptsDesc');
                description.textContent = baseText.replace(/\d+/, maxAttempts);
            }
            
        } catch (error) {
            const errorMsg = window.i18n.getCurrentLanguage() === 'es' ?
                'Error al guardar configuración: ' :
                'Error saving configuration: ';
            errorElement.textContent = errorMsg + error.message;
            errorElement.style.display = 'block';
        }
    }

    async handleResetExtension() {
        const confirmed = confirm('¿Estás seguro de que quieres restablecer toda la extensión? Esto eliminará TODAS las cuentas, configuraciones y el PIN. Esta acción no se puede deshacer.');
        
        if (confirmed) {
            const doubleConfirm = confirm('Esta es tu última oportunidad. ¿Realmente quieres eliminar TODO?');
            
            if (doubleConfirm) {
                try {
                    await chrome.storage.local.clear();
                    alert('Extensión restablecida exitosamente. Se cerrará la configuración.');
                    window.close();
                } catch (error) {
                    alert('Error al restablecer: ' + error.message);
                }
            }
        }
    }

    showError(message) {
        const errorElement = document.getElementById('changePinError');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    async initiateExport() {
        const isPinConfigured = await window.securityManager.isPinConfigured();
        
        if (isPinConfigured) {
            this.showExportPinModal();
        } else {
            await this.handleExport();
        }
    }

    showExportPinModal() {
        document.getElementById('exportPinModal').style.display = 'flex';
        document.getElementById('exportPinInput').focus();
    }

    hideExportPinModal() {
        document.getElementById('exportPinModal').style.display = 'none';
        document.getElementById('exportPinForm').reset();
        document.getElementById('exportPinError').style.display = 'none';
    }

    async handleExportPinSubmit(e) {
        e.preventDefault();
        
        const pin = document.getElementById('exportPinInput').value;
        const errorElement = document.getElementById('exportPinError');

        if (!pin) {
            errorElement.textContent = 'Debes ingresar tu PIN';
            errorElement.style.display = 'block';
            return;
        }

        try {
            const isValid = await window.securityManager.verifyPin(pin);
            if (!isValid) {
                errorElement.textContent = window.i18n.t('incorrectPin');
                errorElement.style.display = 'block';
                return;
            }

            this.hideExportPinModal();
            await this.handleExport();
            
        } catch (error) {
            errorElement.textContent = 'Error al verificar PIN: ' + error.message;
            errorElement.style.display = 'block';
        }
    }

    showSuccessModal(title, message) {
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;
        document.getElementById('successModal').style.display = 'flex';
    }

    hideSuccessModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    async handleExport() {
        try {
            const result = await chrome.storage.local.get(['accounts', 'autoLockTime', 'lastActivity']);
            const accounts = result.accounts || [];
            
            if (accounts.length === 0) {
                this.showSuccessModal('⚠️ Sin cuentas', 'No hay cuentas para exportar.');
                return;
            }

            const exportData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                accounts: accounts,
                settings: {
                    autoLockTime: result.autoLockTime || 900
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mivida2fa-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.showSuccessModal('✓ Exportación completada', `${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''} exportada${accounts.length !== 1 ? 's' : ''} exitosamente.`);
            
        } catch (error) {
            console.error('Error exportando:', error);
            this.showSuccessModal('❌ Error', 'Error al exportar: ' + error.message);
        }
    }

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.version || !importData.accounts || !Array.isArray(importData.accounts)) {
                throw new Error('Archivo de respaldo inválido. Formato no reconocido.');
            }

            for (const account of importData.accounts) {
                if (!account.id || !account.name || !account.secret) {
                    throw new Error('Archivo de respaldo inválido. Estructura de cuenta incorrecta.');
                }
            }

            const confirmed = confirm(`¿Quieres importar ${importData.accounts.length} cuentas? Esto reemplazará todas las cuentas actuales.`);
            
            if (confirmed) {
                await chrome.storage.local.set({ 
                    accounts: importData.accounts,
                    autoLockTime: importData.settings?.autoLockTime || 900
                });
                
                await this.loadSettings();
                
                this.showSuccessModal('✓ Importación completada', `${importData.accounts.length} cuenta${importData.accounts.length !== 1 ? 's' : ''} importada${importData.accounts.length !== 1 ? 's' : ''} exitosamente.`);
            }
            
        } catch (error) {
            console.error('Error importando:', error);
            this.showSuccessModal('❌ Error', 'Error al importar: ' + error.message);
        } finally {
            event.target.value = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
