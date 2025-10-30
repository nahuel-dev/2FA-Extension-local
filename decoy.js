class DecoyManager {
    constructor() {
        this.decoyAccounts = [
            { name: "Binance", domain: "binance.com" },
            { name: "Google", domain: "google.com" },
            { name: "Facebook", domain: "facebook.com" },
            { name: "Amazon", domain: "amazon.com" },
            { name: "Microsoft", domain: "microsoft.com" },
            { name: "Apple ID", domain: "apple.com" },
            { name: "GitHub", domain: "github.com" },
            { name: "Twitter", domain: "twitter.com" },
            { name: "Instagram", domain: "instagram.com" },
            { name: "LinkedIn", domain: "linkedin.com" },
            { name: "PayPal", domain: "paypal.com" },
            { name: "Coinbase", domain: "coinbase.com" },
            { name: "Kraken", domain: "kraken.com" },
            { name: "Dropbox", domain: "dropbox.com" },
            { name: "Spotify", domain: "spotify.com" },
            { name: "Netflix", domain: "netflix.com" },
            { name: "Discord", domain: "discord.com" },
            { name: "Slack", domain: "slack.com" },
            { name: "Twitch", domain: "twitch.tv" },
            { name: "Reddit", domain: "reddit.com" },
            { name: "Steam", domain: "steampowered.com" },
            { name: "Epic Games", domain: "epicgames.com" },
            { name: "Adobe", domain: "adobe.com" },
            { name: "Zoom", domain: "zoom.us" },
            { name: "WhatsApp", domain: "whatsapp.com" },
            { name: "Telegram", domain: "telegram.org" },
            { name: "Bitfinex", domain: "bitfinex.com" },
            { name: "Bitstamp", domain: "bitstamp.net" },
            { name: "Gemini", domain: "gemini.com" },
            { name: "AWS", domain: "aws.amazon.com" }
        ];
    }

    generateRandomSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    async generateDecoyAccounts(count = 30) {
        const shuffled = this.shuffleArray(this.decoyAccounts);
        const selected = shuffled.slice(0, count);
        
        const decoyAccounts = selected.map((template, index) => {
            return {
                id: `decoy_${Date.now()}_${index}`,
                name: template.name,
                domain: template.domain,
                url: null,
                floatingWindowDelay: 'always',
                description: null,
                secret: this.generateRandomSecret(),
                createdAt: new Date().toISOString(),
                isDecoy: true
            };
        });

        return decoyAccounts;
    }

    async activateDecoyMode() {
        console.log('Activando modo señuelo - Generando cuentas falsas...');
        
        const decoyAccounts = await this.generateDecoyAccounts(30);
        
        await chrome.storage.local.set({ 
            accounts: decoyAccounts,
            decoyModeActivated: true,
            originalAccountsDestroyed: true
        });
        
        console.log('Modo señuelo activado - 30 cuentas falsas generadas');
        console.log('Cuentas originales eliminadas permanentemente');
        
        return true;
    }

    async isDecoyModeEnabled() {
        const result = await chrome.storage.local.get(['decoyModeEnabled']);
        return result.decoyModeEnabled || false;
    }

    async setDecoyModeEnabled(enabled) {
        await chrome.storage.local.set({ decoyModeEnabled: enabled });
    }
}

window.decoyManager = new DecoyManager();
