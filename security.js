class SecurityManager {
    constructor() {
        this.isUnlocked = false;
        this.lockTimeout = null;
        this.autoLockTime = 0;
    }

    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async hashPin(pin, salt) {
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(pin);
        
        const saltData = new Uint8Array(salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordData,
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltData,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );
        
        const hashArray = Array.from(new Uint8Array(derivedBits));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async setupPin(pin) {
        if (pin.length < 4 || pin.length > 6) {
            throw new Error('El PIN debe tener entre 4 y 6 dígitos');
        }
        
        if (!/^\d+$/.test(pin)) {
            throw new Error('El PIN solo puede contener números');
        }

        const salt = this.generateSalt();
        const hashedPin = await this.hashPin(pin, salt);
        await chrome.storage.local.set({ 
            pinHash: hashedPin,
            pinSalt: salt,
            pinConfigured: true,
            autoLockTime: 900 // 15 minutos por defecto
        });
        
        this.isUnlocked = true;
    }

    async verifyPin(pin) {
        const result = await chrome.storage.local.get(['pinHash', 'pinSalt', 'failedAttempts', 'maxFailedAttempts', 'resetOnFailedAttempts', 'decoyModeEnabled']);
        if (!result.pinHash || !result.pinSalt) {
            throw new Error('PIN no configurado');
        }

        const hashedPin = await this.hashPin(pin, result.pinSalt);
        const isValid = hashedPin === result.pinHash;
        
        if (isValid) {
            this.isUnlocked = true;
            await chrome.storage.local.set({ failedAttempts: 0 });
        } else {
            const failedAttempts = (result.failedAttempts || 0) + 1;
            await chrome.storage.local.set({ failedAttempts });
            
            const maxAttempts = result.maxFailedAttempts || 5;
            
            if (failedAttempts >= maxAttempts) {
                if (result.decoyModeEnabled) {
                    await window.decoyManager.activateDecoyMode();
                    
                    const decoyBehaviorResult = await chrome.storage.local.get(['decoyBehavior']);
                    if (decoyBehaviorResult.decoyBehavior === 'unlocked') {
                        this.isUnlocked = true;
                        await chrome.storage.local.set({ 
                            failedAttempts: 0,
                            decoyModeActivated: true 
                        });
                    }
                } else if (result.resetOnFailedAttempts) {
                    await this.resetExtension();
                }
            }
        }
        
        return isValid;
    }

    async resetExtension() {
        await chrome.storage.local.clear();
        console.log('Extensión restablecida por intentos fallidos');
    }

    async isPinConfigured() {
        const result = await chrome.storage.local.get(['pinConfigured']);
        return result.pinConfigured || false;
    }

    async removePin() {
        await chrome.storage.local.remove(['pinHash', 'pinSalt', 'pinConfigured']);
        this.isUnlocked = true;
        this.clearAutoLockTimer();
    }

    lock() {
        this.isUnlocked = false;
        this.clearAutoLockTimer();
    }

    async setAutoLockTime(seconds) {
        this.autoLockTime = seconds;
        await chrome.storage.local.set({ autoLockTime: seconds });
        
        if (this.isUnlocked) {
            this.startAutoLockTimer();
        }
    }

    async getAutoLockTime() {
        const result = await chrome.storage.local.get(['autoLockTime']);
        this.autoLockTime = result.autoLockTime || 0;
        return this.autoLockTime;
    }

    startAutoLockTimer() {
        this.clearAutoLockTimer();
        
        if (this.autoLockTime > 0) {
            this.lockTimeout = setTimeout(() => {
                this.lock();
                if (window.manager) {
                    window.manager.showLockScreen();
                }
            }, this.autoLockTime * 1000);
        }
    }

    clearAutoLockTimer() {
        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout);
            this.lockTimeout = null;
        }
    }

    resetAutoLockTimer() {
        if (this.isUnlocked && this.autoLockTime > 0) {
            this.startAutoLockTimer();
        }
    }
}

window.securityManager = new SecurityManager();
