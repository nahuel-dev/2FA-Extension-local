# Mi Vida 2FA Manager

Una extensión segura y fácil de usar para administrar códigos 2FA/TOTP en navegadores Chromium (Chrome, Edge, Brave, etc.).

## 📸 Capturas de pantalla

<div align="center">

<!-- Carrusel de imágenes -->
<div style="position: relative; max-width: 800px; margin: 0 auto;">
  <div id="carousel" style="position: relative; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
    <img src="images/Captura de pantalla 2025-10-30 130048.png" alt="Configuración de seguridad" style="width: 100%; display: block;" id="carousel-img">
  </div>
  
  <!-- Controles de navegación -->
  <div style="text-align: center; margin-top: 20px;">
    <button onclick="changeSlide(-1)" style="background: #333; color: white; border: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px; cursor: pointer; font-size: 18px;">❮</button>
    <span style="display: inline-block; margin: 0 15px;">
      <span onclick="currentSlide(1)" style="cursor: pointer; height: 12px; width: 12px; margin: 0 5px; background-color: #333; border-radius: 50%; display: inline-block;" id="dot1"></span>
      <span onclick="currentSlide(2)" style="cursor: pointer; height: 12px; width: 12px; margin: 0 5px; background-color: #bbb; border-radius: 50%; display: inline-block;" id="dot2"></span>
      <span onclick="currentSlide(3)" style="cursor: pointer; height: 12px; width: 12px; margin: 0 5px; background-color: #bbb; border-radius: 50%; display: inline-block;" id="dot3"></span>
    </span>
    <button onclick="changeSlide(1)" style="background: #333; color: white; border: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px; cursor: pointer; font-size: 18px;">❯</button>
  </div>
  
  <!-- Descripción de la imagen actual -->
  <p style="text-align: center; margin-top: 15px; font-style: italic; color: #666;" id="carousel-caption">
    Configuración de seguridad con PIN y opciones de bloqueo automático
  </p>
</div>

<script>
let slideIndex = 1;
const images = [
  {
    src: "images/Captura de pantalla 2025-10-30 130048.png",
    caption: "Configuración de seguridad con PIN y opciones de bloqueo automático"
  },
  {
    src: "images/Captura de pantalla 2025-10-30 131546.png",
    caption: "Agregar nueva cuenta 2FA con nombre, dominio y clave secreta"
  },
  {
    src: "images/Captura de pantalla 2025-10-30 132758.png",
    caption: "Ventana flotante mostrando código TOTP en GitHub"
  }
];

function changeSlide(n) {
  showSlide(slideIndex += n);
}

function currentSlide(n) {
  showSlide(slideIndex = n);
}

function showSlide(n) {
  if (n > images.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = images.length }
  
  // Actualizar imagen
  document.getElementById('carousel-img').src = images[slideIndex - 1].src;
  document.getElementById('carousel-img').alt = images[slideIndex - 1].caption;
  
  // Actualizar caption
  document.getElementById('carousel-caption').textContent = images[slideIndex - 1].caption;
  
  // Actualizar dots
  for (let i = 1; i <= images.length; i++) {
    const dot = document.getElementById('dot' + i);
    if (dot) {
      dot.style.backgroundColor = (i === slideIndex) ? '#333' : '#bbb';
    }
  }
}

// Auto-play (opcional)
setInterval(() => {
  changeSlide(1);
}, 5000);
</script>

</div>

## 🔐 Características

- **Generación de códigos TOTP**: Compatible con Google Authenticator, Authy y otros
- **Interfaz moderna**: Diseño limpio y fácil de usar
- **Almacenamiento seguro**: Los secretos se guardan localmente en tu navegador
- **Copiar al portapapeles**: Un clic para copiar códigos
- **Timer visual**: Indicador del tiempo restante para cada código
- **Múltiples cuentas**: Administra todas tus cuentas 2FA en un solo lugar

## 📦 Instalación

### Opción 1: Instalación manual (Desarrollo)

1. **Descargar o clonar** este repositorio
2. **Abrir Chrome** y navegar a `chrome://extensions/`
3. **Activar el modo desarrollador** (toggle en la esquina superior derecha)
4. **Hacer clic en "Cargar extensión sin empaquetar"**
5. **Seleccionar la carpeta** que contiene los archivos de la extensión
6. **¡Listo!** La extensión aparecerá en tu barra de herramientas

### Opción 2: Chrome Web Store (Próximamente)

La extensión estará disponible en Chrome Web Store próximamente.

## 🚀 Uso

### Agregar una cuenta 2FA

1. **Hacer clic** en el icono de la extensión
2. **Hacer clic en "Agregar"** o "Agregar cuenta"
3. **Ingresar el nombre** de la cuenta (ej: "Google", "GitHub")
4. **Ingresar la clave secreta** (la cadena que aparece en el código QR)
5. **Hacer clic en "Agregar"**

### Obtener códigos

1. **Hacer clic** en el icono de la extensión
2. **Ver los códigos** generados automáticamente
3. **Hacer clic en "Copiar"** para copiar un código al portapapeles
4. **Los códigos se actualizan** automáticamente cada 30 segundos

### Eliminar una cuenta

1. **Hacer clic** en el botón "Eliminar" junto a la cuenta
2. **Confirmar** la eliminación en el modal

## 🔧 Configuración

### Obtener la clave secreta

Cuando configures 2FA en un servicio:

1. **Escanea el código QR** con cualquier app 2FA para obtener la clave
2. **O busca la opción** "No puedo escanear el código QR" o "Configuración manual"
3. **Copia la clave secreta** (una cadena como: `JBSWY3DPEHPK3PXP`)
4. **Úsala en la extensión**

### Servicios compatibles

Esta extensión es compatible con cualquier servicio que use TOTP (Time-based One-Time Password):

- ✅ Google/Gmail
- ✅ GitHub
- ✅ Microsoft
- ✅ Facebook
- ✅ Twitter/X
- ✅ Discord
- ✅ Dropbox
- ✅ Y muchos más...

## 🔒 Seguridad

- **Almacenamiento local**: Los secretos se guardan solo en tu navegador
- **Sin conexión a internet**: La extensión funciona completamente offline
- **Código abierto**: Puedes revisar todo el código fuente
- **Sin telemetría**: No se envían datos a servidores externos
- **Protección con PIN**: Bloquea la extensión con un PIN de seguridad
- **Auto-lock**: Bloqueo automático después de inactividad
- **Modo Decoy**: Protección contra intentos de acceso no autorizados

## 🛠️ Desarrollo

### Estructura del proyecto

```
mividaextension/
├── manifest.json       # Configuración de la extensión
├── popup.html         # Interfaz principal
├── popup.css          # Estilos
├── popup.js           # Lógica de la interfaz
├── totp.js            # Generador de códigos TOTP
├── background.js      # Service worker
├── icons/             # Iconos de la extensión
└── README.md          # Este archivo
```

### Tecnologías utilizadas

- **Manifest V3**: La última versión de extensiones de Chrome
- **Vanilla JavaScript**: Sin dependencias externas
- **CSS Grid/Flexbox**: Para layouts responsivos
- **Web Crypto API**: Para generación segura de códigos HMAC-SHA1

### Contribuir

1. **Fork** el repositorio
2. **Crear una rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear un Pull Request**

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🐛 Reportar problemas

Si encuentras algún problema o tienes sugerencias:

1. **Abrir un issue** en GitHub
2. **Describir el problema** detalladamente
3. **Incluir pasos** para reproducir el error
4. **Mencionar tu navegador** y versión

## 📞 Soporte

- **GitHub Issues**: Para reportar bugs y solicitar features
- **Email**: [tu-email@ejemplo.com]

## 🎯 Roadmap

- [ ] Importación desde códigos QR
- [ ] Exportación/importación de cuentas
- [ ] Tema oscuro
- [ ] Búsqueda de cuentas
- [ ] Categorías/etiquetas
- [ ] Backup automático

---

**⚠️ Importante**: Mantén siempre un backup de tus claves secretas en un lugar seguro. Esta extensión almacena los datos localmente, por lo que si desinstalas la extensión o limpias los datos del navegador, perderás todas las cuentas configuradas.
