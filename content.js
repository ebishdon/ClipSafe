(function () {
  let attachedElements = new Set();

  function attachSanitizer(element) {
    if (attachedElements.has(element)) return;
    
    attachedElements.add(element);
    console.log("✅ Secure paste sanitizer attached to:", element.tagName, element.className);

    element.addEventListener('paste', (e) => {
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
      element.innerHTML = '';
      element.textContent = sanitizedText;
      
      if (sanitizedText !== pastedText) {
        console.log("🔒 Sanitized content inserted: Keys, emails, and passwords replaced with random values");
      }
    });
  }

  function findAndAttachToInputs() {
    // Try multiple selectors for different platforms
    const selectors = [
      '[contenteditable="true"]',
      '[contenteditable]',
      'textarea',
      'input[type="text"]',
      '.ProseMirror', // For some rich text editors
      '[role="textbox"]',
      '[data-testid="text-input"]',
      '[data-testid="chat-input"]',
      '[aria-label*="chat"]',
      '[aria-label*="message"]',
      '[placeholder*="chat"]',
      '[placeholder*="message"]',
      '[data-testid="composer"]', // For some chat platforms
      '[data-testid="input"]',
      '[data-testid="textarea"]',
      // ChatGPT specific selectors
      '[data-id="root"] [contenteditable]',
      '[data-id="root"] textarea',
      '[data-testid="send-button"] + div [contenteditable]',
      '[data-testid="send-button"] ~ div [contenteditable]',
      '[data-testid="send-button"] + * [contenteditable]',
      '[data-testid="send-button"] ~ * [contenteditable]',
      // More generic selectors
      'div[contenteditable]',
      'div[role="textbox"]',
      'div[aria-label*="message"]',
      'div[aria-label*="chat"]',
      'div[placeholder*="message"]',
      'div[placeholder*="chat"]',
      // Additional ChatGPT selectors
      '[data-testid="conversation-turn-2"] [contenteditable]',
      '[data-testid="conversation-turn-3"] [contenteditable]',
      '[data-testid="conversation-turn-4"] [contenteditable]',
      '[data-testid="conversation-turn-5"] [contenteditable]',
      '[data-testid="conversation-turn-6"] [contenteditable]',
      '[data-testid="conversation-turn-7"] [contenteditable]',
      '[data-testid="conversation-turn-8"] [contenteditable]',
      '[data-testid="conversation-turn-9"] [contenteditable]',
      '[data-testid="conversation-turn-10"] [contenteditable]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && !attachedElements.has(element)) {
          console.log("🔍 Found potential input element:", selector, element.tagName, element.className);
          attachSanitizer(element);
        }
      });
    });
  }

  // Initial scan
  findAndAttachToInputs();

  // Watch for new elements being added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        findAndAttachToInputs();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also check periodically for dynamic content
  setInterval(findAndAttachToInputs, 2000);
})();
