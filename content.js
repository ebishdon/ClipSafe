(function () {
  const waitForInputBox = setInterval(() => {
    const inputBox = document.querySelector('[contenteditable="true"]');
    if (inputBox) {
      clearInterval(waitForInputBox);
      console.log("✅ Secure paste sanitizer attached.");

      inputBox.addEventListener('paste', (e) => {
        e.preventDefault();

        const clipboardData = e.clipboardData || window.clipboardData;
        let pastedText = clipboardData.getData('text');

        function randomString(length) {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        }

        function generateRandomPassword() {
          const lowercase = 'abcdefghijklmnopqrstuvwxyz';
          const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const numbers = '0123456789';
          const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
          
          let password = '';
          // Ensure at least one of each type
          password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
          password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
          password += numbers.charAt(Math.floor(Math.random() * numbers.length));
          password += special.charAt(Math.floor(Math.random() * special.length));
          
          // Fill the rest randomly
          const allChars = lowercase + uppercase + numbers + special;
          for (let i = 4; i < 12; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
          }
          
          // Shuffle the password
          return password.split('').sort(() => Math.random() - 0.5).join('');
        }

        function generateRandomEmail() {
          const domains = ['mail.com', 'example.com', 'test.com', 'demo.com'];
          const domain = domains[Math.floor(Math.random() * domains.length)];
          const randomNum = Math.floor(Math.random() * 999) + 1;
          return `example${randomNum}@${domain}`;
        }

        // Replace all sensitive data in the entire text
        let sanitizedText = pastedText;
        
        // Replace API keys and tokens
        sanitizedText = sanitizedText.replace(/sk-[a-zA-Z0-9]{32,}(DUMMY_SECRET)?/g, () => `Openapikey_${randomString(10)}`);
        sanitizedText = sanitizedText.replace(/ghp_[a-zA-Z0-9]{36}/g, () => `Githubtoken_${randomString(10)}`);
        sanitizedText = sanitizedText.replace(/AIza[0-9A-Za-z-_]{35}/g, () => `Googleapikey_${randomString(10)}`);
        sanitizedText = sanitizedText.replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, () => `JWT_${randomString(10)}`);
        
        // Replace email addresses
        sanitizedText = sanitizedText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, () => generateRandomEmail());
        
        // Replace password fields
        sanitizedText = sanitizedText.replace(/password\s*[:=]\s*[^\s\n\r]+/gi, () => `password: ${generateRandomPassword()}`);
        sanitizedText = sanitizedText.replace(/passwd\s*[:=]\s*[^\s\n\r]+/gi, () => `passwd: ${generateRandomPassword()}`);
        sanitizedText = sanitizedText.replace(/pwd\s*[:=]\s*[^\s\n\r]+/gi, () => `pwd: ${generateRandomPassword()}`);

        // Clear the contenteditable field and insert only the sanitized text
        inputBox.innerHTML = '';
        inputBox.textContent = sanitizedText;
        
        if (sanitizedText !== pastedText) {
          console.log("🔒 Sanitized content inserted: Keys, emails, and passwords replaced with random values");
        }
      });
    }
  }, 300);
})();
