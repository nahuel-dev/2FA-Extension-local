
class SecurityTester {
    constructor() {
        this.testResults = [];
    }

    async testEncryptedStorage() {
        console.log('🔍 Test 1: Verificando cifrado en storage...');
        
        try {
            const result = await chrome.storage.local.get(['accounts']);
            const accounts = result.accounts || [];
            
            let allEncrypted = true;
            let foundSecrets = 0;
            
            accounts.forEach(account => {
                if (account.secret) {
                    foundSecrets++;
                    const isBase32 = /^[A-Z2-7]+=*$/.test(account.secret);
                    const isBase64Encrypted = /^[A-Za-z0-9+/]+=*$/.test(account.secret) && account.secret.length > 50;
                    
                    if (isBase32 && !isBase64Encrypted) {
                        allEncrypted = false;
                        console.warn(`❌ Secreto sin cifrar encontrado en cuenta: ${account.name}`);
                    } else if (isBase64Encrypted) {
                        console.log(`✅ Secreto cifrado encontrado en cuenta: ${account.name}`);
                    }
                }
            });
            
            const result_test = {
                test: 'Cifrado en Storage',
                passed: allEncrypted && foundSecrets > 0,
                details: `${foundSecrets} secretos encontrados, todos cifrados: ${allEncrypted}`
            };
            
            this.testResults.push(result_test);
            return result_test;
            
        } catch (error) {
            console.error('Error en test de storage:', error);
            return { test: 'Cifrado en Storage', passed: false, details: error.message };
        }
    }

    async testDecryptionWithoutPin() {
        console.log('🔍 Test 2: Intentando descifrar sin PIN...');
        
        try {
            const result = await chrome.storage.local.get(['accounts']);
            const accounts = result.accounts || [];
            
            let decryptionFailed = true;
            
            for (const account of accounts) {
                if (account.encrypted && account.secret) {
                    try {
                        const fakeKey = await crypto.subtle.generateKey(
                            { name: 'AES-GCM', length: 256 },
                            false,
                            ['encrypt', 'decrypt']
                        );
                        
                        await window.securityManager.decryptData(account.secret, fakeKey);
                        decryptionFailed = false;
                        console.warn(`❌ Pudo descifrar sin PIN correcto: ${account.name}`);
                    } catch (error) {
                        console.log(`✅ Descifrado falló correctamente para: ${account.name}`);
                    }
                }
            }
            
            const result_test = {
                test: 'Protección sin PIN',
                passed: decryptionFailed,
                details: decryptionFailed ? 'No se pudo descifrar sin PIN correcto' : 'VULNERABILIDAD: Se pudo descifrar sin PIN'
            };
            
            this.testResults.push(result_test);
            return result_test;
            
        } catch (error) {
            console.error('Error en test de descifrado:', error);
            return { test: 'Protección sin PIN', passed: false, details: error.message };
        }
    }

    async testRandomSalt() {
        console.log('🔍 Test 3: Verificando salt aleatorio...');
        
        try {
            const result = await chrome.storage.local.get(['userSalt']);
            const salt = result.userSalt;
            
            if (!salt || salt.length !== 32) {
                const result_test = {
                    test: 'Salt Aleatorio',
                    passed: false,
                    details: 'Salt no encontrado o tamaño incorrecto'
                };
                this.testResults.push(result_test);
                return result_test;
            }
            
            const isRandom = salt.some((byte, index) => byte !== index);
            
            const result_test = {
                test: 'Salt Aleatorio',
                passed: isRandom,
                details: isRandom ? 'Salt parece aleatorio' : 'Salt parece predecible'
            };
            
            this.testResults.push(result_test);
            return result_test;
            
        } catch (error) {
            console.error('Error en test de salt:', error);
            return { test: 'Salt Aleatorio', passed: false, details: error.message };
        }
    }

    async testBruteForceResistance() {
        console.log('🔍 Test 4: Simulando ataque de fuerza bruta...');
        
        const startTime = performance.now();
        let attempts = 0;
        const maxAttempts = 100; // Limitado para no bloquear el navegador
        
        try {
            for (let i = 0; i < maxAttempts; i++) {
                const fakePin = String(i).padStart(4, '0');
                try {
                    await window.securityManager.verifyPin(fakePin);
                    console.warn(`❌ PIN débil encontrado: ${fakePin}`);
                    break;
                } catch (error) {
                    attempts++;
                }
            }
            
            const endTime = performance.now();
            const timePerAttempt = (endTime - startTime) / attempts;
            
            const result_test = {
                test: 'Resistencia Fuerza Bruta',
                passed: timePerAttempt > 10, // Más de 10ms por intento es bueno
                details: `${attempts} intentos, ${timePerAttempt.toFixed(2)}ms por intento`
            };
            
            this.testResults.push(result_test);
            return result_test;
            
        } catch (error) {
            console.error('Error en test de fuerza bruta:', error);
            return { test: 'Resistencia Fuerza Bruta', passed: false, details: error.message };
        }
    }

    async testMemoryCleanup() {
        console.log('🔍 Test 5: Verificando limpieza de memoria...');
        
        try {
            const hadKey = window.securityManager.encryptionKey !== null;
            
            window.securityManager.lock();
            
            const keyCleared = window.securityManager.encryptionKey === null;
            
            const result_test = {
                test: 'Limpieza de Memoria',
                passed: keyCleared,
                details: keyCleared ? 'Clave eliminada correctamente al bloquear' : 'VULNERABILIDAD: Clave permanece en memoria'
            };
            
            this.testResults.push(result_test);
            return result_test;
            
        } catch (error) {
            console.error('Error en test de limpieza:', error);
            return { test: 'Limpieza de Memoria', passed: false, details: error.message };
        }
    }

    async runAllTests() {
        console.log('🚀 Iniciando tests de seguridad...\n');
        
        await this.testEncryptedStorage();
        await this.testDecryptionWithoutPin();
        await this.testRandomSalt();
        await this.testBruteForceResistance();
        await this.testMemoryCleanup();
        
        console.log('\n📊 Resultados de los tests:');
        console.table(this.testResults);
        
        const passed = this.testResults.filter(t => t.passed).length;
        const total = this.testResults.length;
        
        console.log(`\n🎯 Puntuación de seguridad: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
        
        if (passed === total) {
            console.log('🛡️ ¡Excelente! Todos los tests de seguridad pasaron.');
        } else {
            console.warn('⚠️ Algunas vulnerabilidades encontradas. Revisar resultados.');
        }
        
        return this.testResults;
    }
}

class ForensicAnalysis {
    
    static async extractStorageData() {
        console.log('🕵️ Simulando extracción forense de datos...');
        
        const allData = await chrome.storage.local.get(null);
        
        console.log('📁 Datos encontrados en chrome.storage.local:');
        console.log(JSON.stringify(allData, null, 2));
        
        const analysis = {
            pinHash: allData.pinHash ? 'ENCONTRADO (hasheado)' : 'No encontrado',
            userSalt: allData.userSalt ? 'ENCONTRADO (32 bytes)' : 'No encontrado',
            accounts: allData.accounts ? `${allData.accounts.length} cuentas` : 'No encontradas',
            encryptedSecrets: 0,
            plaintextSecrets: 0,
            exposedMetadata: []
        };
        
        if (allData.accounts) {
            allData.accounts.forEach(account => {
                if (account.secret) {
                    if (account.encrypted) {
                        analysis.encryptedSecrets++;
                    } else {
                        analysis.plaintextSecrets++;
                    }
                }
                
                if (account.name) analysis.exposedMetadata.push(`Nombre: ${account.name}`);
                if (account.domain) analysis.exposedMetadata.push(`Dominio: ${account.domain}`);
                if (account.url) analysis.exposedMetadata.push(`URL: ${account.url}`);
            });
        }
        
        console.log('🔍 Análisis forense:');
        console.table(analysis);
        
        return analysis;
    }
    
    static async attemptCommonAttacks() {
        console.log('⚔️ Intentando ataques comunes...');
        
        const attacks = [
            {
                name: 'PIN por defecto',
                method: async () => {
                    const commonPins = ['0000', '1234', '1111', '0123', '9999'];
                    for (const pin of commonPins) {
                        try {
                            await window.securityManager.verifyPin(pin);
                            return `VULNERABLE: PIN común ${pin}`;
                        } catch (e) {}
                    }
                    return 'Resistente a PINs comunes';
                }
            },
            {
                name: 'Manipulación de storage',
                method: async () => {
                    try {
                        await chrome.storage.local.set({ pinConfigured: false });
                        return 'VULNERABLE: Puede saltarse configuración PIN';
                    } catch (e) {
                        return 'Protegido contra manipulación de storage';
                    }
                }
            }
        ];
        
        const results = [];
        for (const attack of attacks) {
            const result = await attack.method();
            results.push({ attack: attack.name, result });
            console.log(`${attack.name}: ${result}`);
        }
        
        return results;
    }
}

console.log(`
🔐 HERRAMIENTAS DE TESTING DE SEGURIDAD
=====================================

Para probar la seguridad de tu extensión 2FA:

1. Ejecutar tests automáticos:
   const tester = new SecurityTester();
   await tester.runAllTests();

2. Análisis forense:
   await ForensicAnalysis.extractStorageData();

3. Ataques comunes:
   await ForensicAnalysis.attemptCommonAttacks();

4. Test manual de cifrado:
   chrome.storage.local.get(['accounts'], console.log);

⚠️ IMPORTANTE: Estos tests son para verificar la seguridad.
   Úsalos solo en tu propia extensión para encontrar vulnerabilidades.
`);

window.SecurityTester = SecurityTester;
window.ForensicAnalysis = ForensicAnalysis;
