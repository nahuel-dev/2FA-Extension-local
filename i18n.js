// Sistema de internacionalización (i18n)
const translations = {
    es: {
        // Popup principal
        appTitle: "Administrador de códigos OTP",
        addButton: "+ Agregar",
        settingsButton: "⚙️",
        noAccounts: "No hay cuentas configuradas",
        noAccountsDesc: "Agrega tu primera cuenta 2FA para comenzar",
        addFirstAccount: "Agregar cuenta",
        accountDetails: "Detalles de la cuenta",
        selectAccount: "Selecciona una cuenta para ver sus detalles",
        name: "Nombre",
        issuer: "Dominio",
        secret: "Secreto",
        copy: "Copiar",
        delete: "Eliminar",
        edit: "Editar",
        save: "Guardar",
        cancel: "Cancelar",
        verificationCode: "Código de seguridad para la verificación",
        
        // Pantalla de bloqueo
        extensionLocked: "Extensión Bloqueada",
        enterPinToAccess: "Ingresa tu PIN para acceder a tus códigos 2FA",
        enterPin: "Ingresa tu PIN",
        unlock: "Desbloquear",
        incorrectPin: "PIN incorrecto",
        forgotPin: "¿Olvidaste tu PIN?",
        confirmDeletePin: "Confirmar eliminación de PIN",
        confirmDeletePinMessage: "¿Estás seguro de que quieres eliminar el PIN? Esto también eliminará todas las cuentas guardadas por seguridad.",
        deletePin: "Eliminar PIN",
        downloadVideo: "Descargar video",
        videoNotFound: "No se encontró el video",
        downloadVideosX: "Descargar videos de X (Twitter)",
        pastePublicationLink: "Pega el enlace de la publicación para descargar el video",
        publicationLink: "Enlace de publicación",
        
        // Configuración de PIN
        setupSecurity: "Configurar Seguridad",
        setupPinDesc: "Establece un PIN de 4-6 dígitos para proteger tu extensión",
        newPin: "Nuevo PIN (4-6 dígitos)",
        confirmPin: "Confirmar PIN",
        setupPin: "Configurar PIN",
        skipForNow: "Omitir por ahora",
        
        // Modal agregar cuenta
        addAccount: "Agregar Cuenta 2FA",
        accountName: "Nombre de la cuenta",
        accountNamePlaceholder: "Ej: Gmail, Facebook, etc.",
        domainOptional: "Dominio (opcional)",
        domainPlaceholder: "Ej: binance.com, google.com",
        secretKey: "Clave secreta (TOTP)",
        secretKeyPlaceholder: "Ingresa la clave secreta",
        scanQRCode: "Escanear código QR",
        
        // Modal eliminar
        deleteAccount: "Eliminar Cuenta",
        deleteConfirm: "¿Estás seguro de que quieres eliminar esta cuenta?",
        thisActionCannot: "Esta acción no se puede deshacer.",
        
        // Settings
        configuration: "Configuración",
        back: "← Volver",
        
        // Seguridad
        pinSecurityConfig: "Seguridad de PIN y Configuración de Bloqueo",
        pinStatus: "Estado del PIN:",
        configured: "Configurado",
        notConfigured: "No configurado",
        changePin: "Cambiar PIN",
        setupPinBtn: "Configurar PIN",
        removePin: "Eliminar PIN",
        autoLockAfter: "Bloquear automáticamente después de:",
        never: "Nunca",
        oneMinute: "1 minuto",
        fiveMinutes: "5 minutos",
        fifteenMinutes: "15 minutos",
        thirtyMinutes: "30 minutos",
        resetOnFailedAttempts: "Restablecer extensión por intentos fallidos",
        resetOnFailedAttemptsDesc: "Elimina todas las cuentas y configuraciones después de un número específico de intentos fallidos de PIN.",
        decoyModeOnFailedAttempts: "Modo señuelo por intentos fallidos",
        decoyModeOnFailedAttemptsDesc: "Genera cuentas OTP falsas realistas y elimina las originales después de intentos fallidos. Medida de autodestrucción para proteger datos reales.",
        decoyBehaviorAfterActivation: "Comportamiento después de activar señuelo:",
        decoyBehaviorLocked: "Permanecer bloqueada",
        decoyBehaviorUnlocked: "Desbloquear automáticamente (ingeniería social)",
        decoyBehaviorDesc: "Si se desbloquea automáticamente, el atacante verá códigos falsos y perderá tiempo analizándolos.",
        
        // Modo camuflaje
        disguiseMode: "Modo Camuflaje",
        activateDisguiseMode: "Activar modo camuflaje:",
        disguiseModeDesc: "Disfraza la extensión como un descargador de videos de X.com. Requiere PIN para acceder a la extensión real.",
        
        // Respaldo
        backupRestore: "Respaldo y Restauración",
        exportConfig: "Exportar configuración:",
        exportConfigDesc: "Descarga todas tus cuentas OTP y configuraciones en un archivo seguro.",
        exportAll: "Exportar Todo",
        importConfig: "Importar configuración:",
        importConfigDesc: "Restaura tus cuentas OTP desde un archivo de respaldo.",
        importFile: "Importar Archivo",
        
        // Zona peligrosa
        dangerZone: "Zona Peligrosa",
        resetExtension: "Restablecer extensión:",
        resetExtensionDesc: "Elimina TODAS las cuentas, configuraciones y el PIN. Esta acción es irreversible.",
        resetAll: "Restablecer Todo",
        
        // Idioma
        language: "Idioma",
        extensionLanguage: "Idioma de la extensión:",
        selectLanguage: "Selecciona el idioma de la interfaz",
        spanish: "Español",
        english: "English",
        
        // Modales
        verifyIdentity: "Verificar identidad",
        enterPinToExport: "Ingresa tu PIN para exportar la configuración:",
        currentPin: "PIN:",
        currentPinLabel: "PIN actual (si existe):",
        currentPinPlaceholder: "Dejar vacío si no hay PIN",
        currentPinPlaceholder2: "PIN actual",
        newPinLabel: "Nuevo PIN:",
        newPinPlaceholder: "4-6 dígitos",
        confirmPinLabel: "Confirmar nuevo PIN:",
        confirmPinPlaceholder: "Repetir PIN",
        savePinBtn: "Guardar PIN",
        removePinWarning: "⚠️ Estás a punto de eliminar el PIN de seguridad. Tus cuentas OTP se mantendrán guardadas.",
        enterCurrentPinConfirm: "Ingresa tu PIN actual para confirmar:",
        continue: "Continuar",
        success: "✓ Éxito",
        error: "❌ Error",
        accept: "Aceptar",
        loading: "Cargando...",
        
        // Configurar intentos
        configureFailedAttempts: "Configurar intentos fallidos",
        howManyAttempts: "¿Después de cuántos intentos fallidos deseas restablecer la extensión?",
        numberOfAttempts: "Número de intentos (mínimo 1):",
        
        // Mensajes
        pinRequired: "⚠️ PIN requerido",
        mustConfigurePin: "Debes configurar un PIN antes de activar esta función.",
        mustConfigurePinDisguise: "Debes configurar un PIN antes de activar el modo camuflaje.",
        configUpdated: "✓ Configuración actualizada",
        disguiseModeActivated: "Modo camuflaje activado. La extensión se mostrará como un descargador de videos de X.com.",
        disguiseModeDeactivated: "Modo camuflaje desactivado. La extensión se mostrará normalmente.",
        resetActivated: "Restablecimiento por intentos fallidos activado. La extensión se restablecerá después de",
        failedAttempts: "intentos fallidos.",
        resetDeactivated: "Restablecimiento por intentos fallidos desactivado.",
        
        // Configuración bloqueada
        configurationLocked: "Configuración Bloqueada",
        enterPinToAccessConfig: "Ingresa tu PIN para acceder a la configuración",
        
        // Otros
        attemptsRemaining: "intentos restantes",
        attempt: "intento",
        attempts: "intentos",
        remaining: "restante",
        remainingPlural: "restantes",
        urlAddress: "Dirección de URL",
        floatingWindow: "Ventana flotante",
        otpDescription: "Descripción del OTP",
        
        // Modal agregar cuenta - textos de ayuda
        domainHelp: "Dominio donde se usará este código para auto-detección",
        urlAddressOptional: "Dirección de URL (opcional):",
        urlPlaceholder: "Ej: accounts.google.com/v3/signin/identifier",
        urlHelp: "URL específica donde se usará este código para auto-detección",
        alwaysActive: "Siempre activado",
        disabled: "Desactivado",
        tenMinutes: "10 minutos",
        thirtyMinutes: "30 minutos",
        fiveHours: "5 horas",
        oneDay: "1 día",
        oneWeek: "1 semana",
        oneMonth: "1 mes",
        floatingWindowHelp: "Configurar cuándo mostrar la ventana flotante después de usar el código",
        secretKeyHelp: "Puedes encontrar esta clave en el código QR o en la configuración 2FA",
        descriptionOptional: "Descripción (opcional):",
        descriptionPlaceholder: "Ej: Este OTP es para mi cuenta secundaria...",
        descriptionHelp: "Agrega una nota para identificar mejor esta cuenta",
        noDescription: "Sin descripción",
        notConfigured: "No configurado",
        copied: "¡Copiado!",
        
        // Modo camuflaje - Textos de pantalla de bloqueo
        disguiseTitle: "Descargar videos de X (Twitter)",
        disguiseDescription: "Pega el enlace de la publicación para descargar el video",
        disguisePlaceholder: "Enlace de publicación",
        disguiseButton: "Descargar video"
    },
    en: {
        // Main popup
        appTitle: "OTP Code Manager",
        addButton: "+ Add",
        settingsButton: "⚙️",
        noAccounts: "No accounts configured",
        noAccountsDesc: "Add your first 2FA account to get started",
        addFirstAccount: "Add account",
        accountDetails: "Account details",
        selectAccount: "Select an account to view its details",
        name: "Name",
        issuer: "Domain",
        secret: "Secret",
        copy: "Copy",
        delete: "Delete",
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        verificationCode: "Verification code",
        
        // Lock screen
        extensionLocked: "Extension Locked",
        enterPinToAccess: "Enter your PIN to access your 2FA codes",
        enterPin: "Enter your PIN",
        unlock: "Unlock",
        incorrectPin: "Incorrect PIN",
        forgotPin: "Forgot your PIN?",
        confirmDeletePin: "Confirm PIN deletion",
        confirmDeletePinMessage: "Are you sure you want to delete the PIN? This will also delete all saved accounts for security.",
        deletePin: "Delete PIN",
        downloadVideo: "Download video",
        videoNotFound: "Video not found",
        downloadVideosX: "Download videos from X (Twitter)",
        pastePublicationLink: "Paste the post link to download the video",
        publicationLink: "Post link",
        
        // PIN setup
        setupSecurity: "Setup Security",
        setupPinDesc: "Set a 4-6 digit PIN to protect your extension",
        newPin: "New PIN (4-6 digits)",
        confirmPin: "Confirm PIN",
        setupPin: "Setup PIN",
        skipForNow: "Skip for now",
        
        // Add account modal
        addAccount: "Add 2FA Account",
        accountName: "Account name",
        accountNamePlaceholder: "E.g: Gmail, Facebook, etc.",
        domainOptional: "Domain (optional)",
        domainPlaceholder: "E.g: binance.com, google.com",
        secretKey: "Secret key (TOTP)",
        secretKeyPlaceholder: "Enter the secret key",
        scanQRCode: "Scan QR code",
        
        // Delete modal
        deleteAccount: "Delete Account",
        deleteConfirm: "Are you sure you want to delete this account?",
        thisActionCannot: "This action cannot be undone.",
        
        // Settings
        configuration: "Settings",
        back: "← Back",
        
        // Security
        pinSecurityConfig: "PIN Security and Lock Configuration",
        pinStatus: "PIN Status:",
        configured: "Configured",
        notConfigured: "Not configured",
        changePin: "Change PIN",
        setupPinBtn: "Setup PIN",
        removePin: "Remove PIN",
        autoLockAfter: "Auto-lock after:",
        never: "Never",
        oneMinute: "1 minute",
        fiveMinutes: "5 minutes",
        fifteenMinutes: "15 minutes",
        thirtyMinutes: "30 minutes",
        resetOnFailedAttempts: "Reset extension on failed attempts",
        resetOnFailedAttemptsDesc: "Deletes all accounts and settings after a specific number of failed PIN attempts.",
        decoyModeOnFailedAttempts: "Decoy mode on failed attempts",
        decoyModeOnFailedAttemptsDesc: "Generates realistic fake OTP accounts and deletes originals after failed attempts. Self-destruct measure to protect real data.",
        decoyBehaviorAfterActivation: "Behavior after activating decoy:",
        decoyBehaviorLocked: "Keep locked",
        decoyBehaviorUnlocked: "Auto-unlock (social engineering)",
        decoyBehaviorDesc: "If auto-unlocked, the attacker will see fake codes and waste time analyzing them.",
        
        // Disguise mode
        disguiseMode: "Disguise Mode",
        activateDisguiseMode: "Activate disguise mode:",
        disguiseModeDesc: "Disguises the extension as an X.com video downloader. Requires PIN to access the real extension.",
        
        // Backup
        backupRestore: "Backup and Restore",
        exportConfig: "Export configuration:",
        exportConfigDesc: "Download all your OTP accounts and settings in a secure file.",
        exportAll: "Export All",
        importConfig: "Import configuration:",
        importConfigDesc: "Restore your OTP accounts from a backup file.",
        importFile: "Import File",
        
        // Danger zone
        dangerZone: "Danger Zone",
        resetExtension: "Reset extension:",
        resetExtensionDesc: "Deletes ALL accounts, settings and PIN. This action is irreversible.",
        resetAll: "Reset All",
        
        // Language
        language: "Language",
        extensionLanguage: "Extension language:",
        selectLanguage: "Select the interface language",
        spanish: "Español",
        english: "English",
        
        // Modals
        verifyIdentity: "Verify identity",
        enterPinToExport: "Enter your PIN to export the configuration:",
        currentPin: "PIN:",
        currentPinLabel: "Current PIN (if exists):",
        currentPinPlaceholder: "Leave empty if no PIN",
        currentPinPlaceholder2: "Current PIN",
        newPinLabel: "New PIN:",
        newPinPlaceholder: "4-6 digits",
        confirmPinLabel: "Confirm new PIN:",
        confirmPinPlaceholder: "Repeat PIN",
        savePinBtn: "Save PIN",
        removePinWarning: "⚠️ You are about to remove the security PIN. Your OTP accounts will remain saved.",
        enterCurrentPinConfirm: "Enter your current PIN to confirm:",
        continue: "Continue",
        success: "✓ Success",
        error: "❌ Error",
        accept: "Accept",
        loading: "Loading...",
        
        // Configure attempts
        configureFailedAttempts: "Configure failed attempts",
        howManyAttempts: "After how many failed attempts do you want to reset the extension?",
        numberOfAttempts: "Number of attempts (minimum 1):",
        
        // Messages
        pinRequired: "⚠️ PIN required",
        mustConfigurePin: "You must configure a PIN before activating this function.",
        mustConfigurePinDisguise: "You must configure a PIN before activating disguise mode.",
        configUpdated: "✓ Configuration updated",
        disguiseModeActivated: "Disguise mode activated. The extension will be displayed as an X.com video downloader.",
        disguiseModeDeactivated: "Disguise mode deactivated. The extension will be displayed normally.",
        resetActivated: "Reset on failed attempts activated. The extension will reset after",
        failedAttempts: "failed attempts.",
        resetDeactivated: "Reset on failed attempts deactivated.",
        
        // Configuration locked
        configurationLocked: "Settings Locked",
        enterPinToAccessConfig: "Enter your PIN to access settings",
        
        // Others
        attemptsRemaining: "attempts remaining",
        attempt: "attempt",
        attempts: "attempts",
        remaining: "remaining",
        remainingPlural: "remaining",
        urlAddress: "URL Address",
        floatingWindow: "Floating Window",
        otpDescription: "OTP Description",
        
        // Add account modal - help texts
        domainHelp: "Domain where this code will be used for auto-detection",
        urlAddressOptional: "URL Address (optional):",
        urlPlaceholder: "E.g: accounts.google.com/v3/signin/identifier",
        urlHelp: "Specific URL where this code will be used for auto-detection",
        alwaysActive: "Always active",
        disabled: "Disabled",
        tenMinutes: "10 minutes",
        thirtyMinutes: "30 minutes",
        fiveHours: "5 hours",
        oneDay: "1 day",
        oneWeek: "1 week",
        oneMonth: "1 month",
        floatingWindowHelp: "Configure when to show the floating window after using the code",
        secretKeyHelp: "You can find this key in the QR code or in the 2FA settings",
        descriptionOptional: "Description (optional):",
        descriptionPlaceholder: "E.g: This OTP is for my secondary account...",
        descriptionHelp: "Add a note to better identify this account",
        noDescription: "No description",
        notConfigured: "Not configured",
        copied: "Copied!",
        
        // Disguise mode - Lock screen texts
        disguiseTitle: "Download X (Twitter) videos",
        disguiseDescription: "Paste the post link to download the video",
        disguisePlaceholder: "Post link",
        disguiseButton: "Download video"
    }
};

// Clase para manejar traducciones
class I18n {
    constructor() {
        this.currentLanguage = 'es';
        this.init();
    }

    async init() {
        // Cargar idioma guardado
        const result = await chrome.storage.local.get(['language']);
        
        if (result.language) {
            this.currentLanguage = result.language;
        } else {
            this.currentLanguage = this.detectBrowserLanguage();
            await chrome.storage.local.set({ language: this.currentLanguage });
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (browserLang.startsWith('es')) {
            return 'es';
        } else if (browserLang.startsWith('en')) {
            return 'en';
        }
        
        return 'es';
    }

    async setLanguage(lang) {
        this.currentLanguage = lang;
        await chrome.storage.local.set({ language: lang });
    }

    t(key) {
        return translations[this.currentLanguage][key] || key;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Instancia global
window.i18n = new I18n();
