/**
 * Contact Form Handler with EmailJS Integration
 * 
 * This module handles contact form submissions using EmailJS service
 * Features:
 * - Form validation
 * - EmailJS integration
 * - Loading states
 * - Success/Error feedback
 * - Basic rate limiting
 * - Modern JavaScript practices
 */

class ContactFormHandler {
    constructor(options = {}) {
        // EmailJS configuration (these need to be set up in EmailJS dashboard)
        // Try to use global config first, then options, then fallback to placeholders
        const globalConfig = (typeof window !== 'undefined' && window.EMAILJS_CONFIG) || {};
        
        this.emailjsConfig = {
            serviceId: options.serviceId || globalConfig.serviceId || 'YOUR_EMAILJS_SERVICE_ID',
            templateId: options.templateId || globalConfig.templateId || 'YOUR_EMAILJS_TEMPLATE_ID',
            publicKey: options.publicKey || globalConfig.publicKey || 'YOUR_EMAILJS_PUBLIC_KEY'
        };
        
        // Rate limiting configuration
        this.rateLimiting = {
            maxSubmissions: 3,
            timeWindow: 5 * 60 * 1000, // 5 minutes in milliseconds
            storageKey: 'contact_form_submissions'
        };
        
        // DOM elements
        this.form = null;
        this.submitButton = null;
        this.messageContainer = null;
        
        // State
        this.isSubmitting = false;
        
        this.init();
    }
    
    /**
     * Initialize the contact form handler
     */
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupForm());
        } else {
            this.setupForm();
        }
    }
    
    /**
     * Set up the contact form
     */
    setupForm() {
        this.form = document.querySelector('.contact-form');
        
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }
        
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.createMessageContainer();
        this.bindEvents();
        this.setupValidation();
        
        console.log('Contact form initialized successfully');
    }
    
    /**
     * Create message container for feedback
     */
    createMessageContainer() {
        this.messageContainer = document.createElement('div');
        this.messageContainer.className = 'form-message';
        this.messageContainer.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            display: none;
        `;
        
        // Insert after the submit button
        this.submitButton.parentNode.insertBefore(this.messageContainer, this.submitButton.nextSibling);
    }
    
    /**
     * Bind form events
     */
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    /**
     * Set up form validation styles
     */
    setupValidation() {
        // Add validation styles to head
        if (!document.querySelector('#contact-form-styles')) {
            const style = document.createElement('style');
            style.id = 'contact-form-styles';
            style.textContent = `
                .form-control.invalid {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
                }
                
                .form-control.valid {
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
                }
                
                .field-error {
                    color: #ef4444;
                    font-size: 0.75rem;
                    margin-top: 0.25rem;
                    display: block;
                }
                
                .form-message.success {
                    background-color: #dcfce7;
                    border: 1px solid #22c55e;
                    color: #15803d;
                    display: block;
                }
                
                .form-message.error {
                    background-color: #fef2f2;
                    border: 1px solid #ef4444;
                    color: #dc2626;
                    display: block;
                }
                
                .form-message.info {
                    background-color: #dbeafe;
                    border: 1px solid #3b82f6;
                    color: #1d4ed8;
                    display: block;
                }
                
                .btn-loading {
                    position: relative;
                    color: transparent !important;
                }
                
                .btn-loading::after {
                    content: "";
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    margin: auto;
                    border: 2px solid transparent;
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: button-loading-spinner 1s ease infinite;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                }
                
                @keyframes button-loading-spinner {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }
        
        // Check rate limiting
        if (!this.checkRateLimit()) {
            this.showMessage('You have reached the submission limit. Please try again later.', 'error');
            return;
        }
        
        // Validate all fields
        if (!this.validateForm()) {
            this.showMessage('Please fix the errors below and try again.', 'error');
            return;
        }
        
        this.setLoadingState(true);
        
        try {
            const formData = this.getFormData();
            await this.sendEmail(formData);
            this.handleSubmissionSuccess();
        } catch (error) {
            console.error('Form submission error:', error);
            this.handleSubmissionError(error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    /**
     * Check rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        const submissions = this.getStoredSubmissions();
        
        // Filter out old submissions
        const recentSubmissions = submissions.filter(
            timestamp => now - timestamp < this.rateLimiting.timeWindow
        );
        
        if (recentSubmissions.length >= this.rateLimiting.maxSubmissions) {
            return false;
        }
        
        // Add current submission
        recentSubmissions.push(now);
        localStorage.setItem(this.rateLimiting.storageKey, JSON.stringify(recentSubmissions));
        
        return true;
    }
    
    /**
     * Get stored submissions from localStorage
     */
    getStoredSubmissions() {
        try {
            const stored = localStorage.getItem(this.rateLimiting.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading stored submissions:', error);
            return [];
        }
    }
    
    /**
     * Validate the entire form
     */
    validateForm() {
        const inputs = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Validate individual field
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.placeholder?.toLowerCase() || 'field';
        let isValid = true;
        let errorMessage = '';
        
        // Clear previous error
        this.clearFieldError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${fieldName} is required.`;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }
        
        // Name validation (no numbers or special characters)
        if (fieldName.toLowerCase().includes('name') && value) {
            const nameRegex = /^[a-zA-Z\s'-]+$/;
            if (!nameRegex.test(value)) {
                isValid = false;
                errorMessage = 'Name should only contain letters, spaces, hyphens, and apostrophes.';
            }
        }
        
        // Message length validation
        if (field.tagName === 'TEXTAREA' && value) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message should be at least 10 characters long.';
            } else if (value.length > 1000) {
                isValid = false;
                errorMessage = 'Message should be less than 1000 characters.';
            }
        }
        
        // Update field appearance
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    /**
     * Clear field error
     */
    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.classList.remove('invalid');
    }
    
    /**
     * Show field error
     */
    showFieldError(field, message) {
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
    
    /**
     * Get form data
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Get data with fallback to input names/placeholders
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            const key = input.name || input.placeholder?.toLowerCase().replace(/\s+/g, '_') || 'field';
            data[key] = input.value.trim();
        });
        
        // Ensure we have the required fields for EmailJS
        return {
            from_name: data.your_name || data.name || '',
            from_email: data.your_email || data.email || '',
            subject: data.subject || '',
            message: data.your_message || data.message || '',
            to_name: 'Portfolio Owner', // This will be your name
        };
    }
    
    /**
     * Send email using EmailJS
     */
    async sendEmail(formData) {
        // Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded. Please include EmailJS script in your HTML.');
        }
        
        // Check configuration
        if (this.emailjsConfig.serviceId === 'YOUR_EMAILJS_SERVICE_ID' ||
            this.emailjsConfig.templateId === 'YOUR_EMAILJS_TEMPLATE_ID' ||
            this.emailjsConfig.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
            throw new Error('EmailJS configuration not set. Please update the configuration with your actual EmailJS credentials.');
        }
        
        try {
            const response = await emailjs.send(
                this.emailjsConfig.serviceId,
                this.emailjsConfig.templateId,
                formData,
                this.emailjsConfig.publicKey
            );
            
            if (response.status !== 200) {
                throw new Error(`EmailJS returned status ${response.status}: ${response.text}`);
            }
            
            return response;
        } catch (error) {
            // Handle specific EmailJS errors
            if (error.status === 400) {
                throw new Error('Bad request. Please check your EmailJS configuration.');
            } else if (error.status === 401) {
                throw new Error('Unauthorized. Please check your EmailJS public key.');
            } else if (error.status === 403) {
                throw new Error('Forbidden. Please check your EmailJS service configuration.');
            } else if (error.status === 404) {
                throw new Error('Not found. Please check your EmailJS service and template IDs.');
            } else {
                throw error;
            }
        }
    }
    
    /**
     * Handle successful submission
     */
    handleSubmissionSuccess() {
        this.showMessage(
            '✅ Thank you for your message! I will get back to you as soon as possible.',
            'success'
        );
        this.form.reset();
        this.clearAllFieldStates();
    }
    
    /**
     * Handle submission error
     */
    handleSubmissionError(error) {
        let errorMessage = '❌ Sorry, there was an error sending your message. Please try again later.';
        
        if (error.message.includes('configuration')) {
            errorMessage = '⚙️ The contact form is not properly configured. Please contact the site owner.';
        } else if (error.message.includes('EmailJS library')) {
            errorMessage = '📧 Email service is temporarily unavailable. Please try again later.';
        }
        
        this.showMessage(errorMessage, 'error');
    }
    
    /**
     * Set loading state
     */
    setLoadingState(isLoading) {
        this.isSubmitting = isLoading;
        
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.classList.add('btn-loading');
            this.submitButton.setAttribute('data-original-text', this.submitButton.innerHTML);
        } else {
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('btn-loading');
            const originalText = this.submitButton.getAttribute('data-original-text');
            if (originalText) {
                this.submitButton.innerHTML = originalText;
            }
        }
    }
    
    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        this.messageContainer.className = `form-message ${type}`;
        this.messageContainer.innerHTML = message;
        this.messageContainer.style.display = 'block';
        
        // Scroll message into view
        this.messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }
    
    /**
     * Hide message
     */
    hideMessage() {
        this.messageContainer.style.display = 'none';
    }
    
    /**
     * Clear all field validation states
     */
    clearAllFieldStates() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
            this.clearFieldError(input);
        });
    }
    
    /**
     * Update EmailJS configuration
     */
    updateConfig(config) {
        this.emailjsConfig = { ...this.emailjsConfig, ...config };
    }
}

// Initialize the contact form handler when the script loads
// You can also customize the configuration here
const contactFormHandler = new ContactFormHandler({
    // Uncomment and update these when you have your EmailJS credentials
    // serviceId: 'your_service_id',
    // templateId: 'your_template_id', 
    // publicKey: 'your_public_key'
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactFormHandler;
} else if (typeof window !== 'undefined') {
    window.ContactFormHandler = ContactFormHandler;
}