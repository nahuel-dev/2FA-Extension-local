# 2FA Manager Local Extension

I was a long-time user of KeePassXC and Protonpass, but based on my experience as a user, I wanted something a little more flexible, easier to use, secure, and with local privacy features that didn't rely on any servers. That's why I decided to create a simple extension adapted to the Chromium and Firefox browsers to easily manage OTP codes. You can configure the privacy level by adding a PIN to unlock the extension. This PIN is stored in the cache in encrypted form with a final salt based on SHA-256 with the PBKDF2 algorithm. 

There are other higher levels of privacy, such as camouflaging the extension as if it were an extension for downloading videos from x.com (Twitter), adding a limit on failed attempts and configuring a response to this, such as resetting the extension and adding 30 random and realistic OTP accounts as a counterintelligence method. This is a security method to prevent brute force attempts and other attacks from a potential attacker.

![Add 2FA Account](images/Captura%20de%20pantalla%202025-10-30%20131546.png)
![Floating Window](images/Captura%20de%20pantalla%202025-10-30%20132758.png)

## Local installation based on the source code on GitHub: 

### Chromium Browsers (Chrome, Edge, Brave)

1. Download or clone this repository
2. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/` for Edge)
3. Enable developer mode using the toggle in the top right corner
4. Click "Load unpacked" button
5. Select the folder containing the extension files
6. The extension will appear in your toolbar

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the extension folder and select the `manifest.json` file
5. The extension will be loaded temporarily (note: it will be removed when Firefox restarts)

**For permanent installation in Firefox:**
1. Package the extension as a `.xpi` file or submit it to Firefox Add-ons
2. Alternatively, use Firefox Developer Edition or Nightly for persistent temporary extensions

### Chrome Web Store / Firefox Add-ons (Coming Soon)

The extension will be available on official stores soon.

## Usage

### Adding a 2FA Account

1. **Click** on the extension icon
2. **Click "Add"** or "Add account"
3. **Enter the account name** (e.g., "Google", "GitHub")
4. **Enter the secret key** (the string that appears in the QR code)
5. **Click "Add"**

### Getting Codes

1. **Click** on the extension icon
2. **View** the automatically generated codes
3. **Click "Copy"** to copy a code to the clipboard
4. **Codes refresh** automatically every 30 seconds

### Deleting an Account

1. **Click** the "Delete" button next to the account
2. **Confirm** the deletion in the modal

## Configuration

### Obtaining the Secret Key

When setting up 2FA on a service:

1. **Scan the QR code** with any 2FA app to get the key
2. **Or look for the option** "Can't scan the QR code" or "Manual setup"
3. **Copy the secret key** (a string like: `JBSWY3DPEHPK3PXP`)
4. **Use it in the extension**

### Compatible Services

This extension is compatible with any service that uses TOTP (Time-based One-Time Password):

- Google/Gmail
- GitHub
- Microsoft
- Facebook
- Twitter/X
- Discord
- Dropbox
- And many more...

## Security

- **Local Storage**: Secrets are stored only in your browser
- **No Internet Connection**: The extension works completely offline
- **Open Source**: You can review all the source code
- **No Telemetry**: No data is sent to external servers
- **PIN Protection**: Lock the extension with a security PIN
- **Auto-lock**: Automatic locking after inactivity
- **Decoy Mode**: Protection against unauthorized access attempts

## Development

### Project Structure

```
mividaextension/
├── manifest.json       # Extension configuration
├── popup.html         # Main interface
├── popup.css          # Styles
├── popup.js           # Interface logic
├── totp.js            # TOTP code generator
├── background.js      # Service worker
├── icons/             # Extension icons
└── README.md          # This file
```

### Technologies Used

- **Manifest V3**: The latest version of Chrome extensions
- **Vanilla JavaScript**: No external dependencies
- **CSS Grid/Flexbox**: For responsive layouts
- **Web Crypto API**: For secure HMAC-SHA1 code generation

### Contributing

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/new-feature`)
3. **Commit** your changes (`git commit -am 'Add new feature'`)
4. **Push** to the branch (`git push origin feature/new-feature`)
5. **Create a Pull Request**

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.