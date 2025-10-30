class TOTP {
    constructor() {
        this.digits = 6;
        this.period = 30;
    }

    base32ToBytes(base32) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let bytes = [];

        base32 = base32.replace(/\s/g, '').toUpperCase();

        for (let i = 0; i < base32.length; i++) {
            const char = base32[i];
            const index = alphabet.indexOf(char);
            if (index === -1) {
                throw new Error(`Carácter inválido en base32: ${char}`);
            }
            bits += index.toString(2).padStart(5, '0');
        }

        for (let i = 0; i < bits.length; i += 8) {
            const byte = bits.substr(i, 8);
            if (byte.length === 8) {
                bytes.push(parseInt(byte, 2));
            }
        }

        return new Uint8Array(bytes);
    }

    async hmacSha1(key, message) {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
        return new Uint8Array(signature);
    }

    numberToBytes(num, length = 8) {
        const bytes = new Uint8Array(length);
        for (let i = length - 1; i >= 0; i--) {
            bytes[i] = num & 0xff;
            num = num >> 8;
        }
        return bytes;
    }

    async generateTOTP(secret, timestamp = null) {
        try {
            if (timestamp === null) {
                timestamp = Math.floor(Date.now() / 1000);
            }

            const counter = Math.floor(timestamp / this.period);

            const secretBytes = this.base32ToBytes(secret);

            const counterBytes = this.numberToBytes(counter);

            const hmac = await this.hmacSha1(secretBytes, counterBytes);

            const offset = hmac[hmac.length - 1] & 0x0f;
            const code = (
                ((hmac[offset] & 0x7f) << 24) |
                ((hmac[offset + 1] & 0xff) << 16) |
                ((hmac[offset + 2] & 0xff) << 8) |
                (hmac[offset + 3] & 0xff)
            ) % Math.pow(10, this.digits);

            return code.toString().padStart(this.digits, '0');
        } catch (error) {
            console.error('Error generando TOTP:', error);
            throw new Error('Error al generar código TOTP');
        }
    }

    getTimeRemaining() {
        const now = Math.floor(Date.now() / 1000);
        const timeInPeriod = now % this.period;
        return this.period - timeInPeriod;
    }

    validateSecret(secret) {
        try {
            this.base32ToBytes(secret);
            return true;
        } catch (error) {
            return false;
        }
    }

    formatCode(code) {
        if (code.length === 6) {
            return `${code.substr(0, 3)} ${code.substr(3, 3)}`;
        }
        return code;
    }
}

window.totpGenerator = new TOTP();
