/**
 * EmailJS Configuration
 * 
 * Update these values with your actual EmailJS credentials.
 * You can find these values in your EmailJS dashboard:
 * - Service ID: Email Services section
 * - Template ID: Email Templates section  
 * - Public Key: Account → General section
 */

// EmailJS Configuration Object
const EMAILJS_CONFIG = {
    // Replace 'YOUR_EMAILJS_SERVICE_ID' with your actual Service ID from EmailJS dashboard
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    
    // Replace 'YOUR_EMAILJS_TEMPLATE_ID' with your actual Template ID from EmailJS dashboard
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
    
    // Replace 'YOUR_EMAILJS_PUBLIC_KEY' with your actual Public Key from EmailJS dashboard
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
};

// Make configuration available globally
if (typeof window !== 'undefined') {
    window.EMAILJS_CONFIG = EMAILJS_CONFIG;
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EMAILJS_CONFIG;
}

/**
 * Quick Setup Instructions:
 * 
 * 1. Go to https://www.emailjs.com/ and create an account
 * 2. Set up an email service (Gmail recommended for simplicity)
 * 3. Create an email template with these variables:
 *    - {{from_name}} - sender's name
 *    - {{from_email}} - sender's email  
 *    - {{subject}} - message subject
 *    - {{message}} - message content
 *    - {{to_name}} - your name (recipient)
 * 4. Copy your Service ID, Template ID, and Public Key
 * 5. Replace the placeholder values above with your actual credentials
 * 6. Save this file and test your contact form
 * 
 * For detailed setup instructions, see EMAILJS_SETUP.md
 */