# EmailJS Setup Guide for Portfolio Contact Form

This guide will walk you through setting up EmailJS for your portfolio contact form, which allows the static website to send emails without requiring a backend server.

## Table of Contents
1. [EmailJS Account Setup](#emailjs-account-setup)
2. [Email Service Configuration](#email-service-configuration)
3. [Email Template Setup](#email-template-setup)
4. [JavaScript Configuration](#javascript-configuration)
5. [Testing the Contact Form](#testing-the-contact-form)
6. [Troubleshooting](#troubleshooting)

## EmailJS Account Setup

### Step 1: Create an EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address
4. Log in to your EmailJS dashboard

### Step 2: Get Your Public Key
1. In your EmailJS dashboard, go to "Account" → "General"
2. Find your "Public Key" (this will look like a random string)
3. Copy this key - you'll need it for the JavaScript configuration

## Email Service Configuration

### Step 1: Add an Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (recommended options):
   - **Gmail** - Easy to set up, works well for personal portfolios
   - **Outlook/Hotmail** - Good alternative to Gmail
   - **SendGrid** - More professional for business use

### Step 2: Configure Gmail Service (Recommended)
If you choose Gmail:
1. Select "Gmail" from the list
2. Click "Connect Account"
3. Sign in with your Gmail account
4. Give EmailJS permission to send emails on your behalf
5. Your service will be created with a Service ID (e.g., "service_abc123")
6. Copy the Service ID - you'll need it later

### Important Notes:
- For Gmail, you might need to enable "Less secure app access" or use App Passwords if you have 2FA enabled
- The free tier allows 200 emails per month, which is usually sufficient for portfolio sites

## Email Template Setup

### Step 1: Create an Email Template
1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Give your template a name (e.g., "Portfolio Contact Form")

### Step 2: Configure Template Content
Use this template structure:

**Subject Line:**
```
New Contact Form Message: {{subject}}
```

**Email Body:**
```
Hello,

You have received a new message through your portfolio contact form.

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
This message was sent via your portfolio website contact form.
```

**Template Variables:**
Make sure these variables are available in your template:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{subject}}` - Message subject
- `{{message}}` - Message content
- `{{to_name}}` - Your name (recipient)

### Step 3: Configure Template Settings
1. Set the "To Email" to your email address where you want to receive messages
2. Set the "From Email" to your verified email address
3. Set the "From Name" to something like "Portfolio Contact Form"
4. Save the template and copy the Template ID

## JavaScript Configuration

### Step 1: Update Contact Form Configuration
Open `/js/contact-form.js` and update the configuration at the top of the `ContactFormHandler` constructor:

```javascript
// Replace these with your actual EmailJS credentials
this.emailjsConfig = {
    serviceId: 'service_your_service_id',      // Replace with your Service ID
    templateId: 'template_your_template_id',   // Replace with your Template ID  
    publicKey: 'your_public_key_here'          // Replace with your Public Key
};
```

### Step 2: Alternative Configuration Method
You can also update the configuration when initializing the contact form handler at the bottom of the file:

```javascript
const contactFormHandler = new ContactFormHandler({
    serviceId: 'service_your_service_id',
    templateId: 'template_your_template_id', 
    publicKey: 'your_public_key_here'
});
```

## Testing the Contact Form

### Step 1: Test Locally
1. Open your `index.html` file in a web browser
2. Navigate to the contact section
3. Fill out the contact form with test data
4. Submit the form
5. Check for success/error messages

### Step 2: Verify Email Delivery
1. Check your email inbox for the test message
2. Verify all form data appears correctly in the email
3. Test with different email addresses to ensure validation works

### Step 3: Test Form Validation
Try submitting the form with:
- Empty required fields
- Invalid email formats
- Very short messages
- Very long messages

The form should show appropriate error messages for each case.

## Features Included

### ✅ Form Validation
- Required field validation
- Email format validation  
- Name format validation (letters, spaces, hyphens, apostrophes only)
- Message length validation (10-1000 characters)

### ✅ User Experience
- Loading states during submission
- Success/error feedback messages
- Real-time field validation
- Form reset after successful submission

### ✅ Security Features
- Rate limiting (3 submissions per 5 minutes)
- Client-side input sanitization
- Spam prevention measures

### ✅ Professional Design
- Consistent styling with your portfolio theme
- Responsive design
- Smooth animations and transitions
- Clear error states

## Troubleshooting

### Common Issues:

**"EmailJS library not loaded" Error:**
- Make sure the EmailJS script is included in your HTML before the contact-form.js script
- Check browser console for script loading errors

**"Configuration not set" Error:**
- Verify you've updated the ServiceID, TemplateID, and PublicKey in the JavaScript
- Double-check these values match exactly what's in your EmailJS dashboard

**Emails Not Being Received:**
- Check your spam/junk folder
- Verify the "To Email" is set correctly in your EmailJS template
- Test with different email addresses

**Form Validation Not Working:**
- Check browser console for JavaScript errors
- Ensure form fields have the correct `name` attributes
- Verify the form has the class `contact-form`

**Rate Limiting Issues:**
- Clear browser localStorage to reset the rate limiting counter
- Wait 5 minutes between multiple test submissions

### Browser Console Debugging:
Open browser developer tools (F12) and check the Console tab for error messages. Common errors and solutions:

1. **CORS errors:** Use a local server (like Live Server in VS Code) instead of opening HTML files directly
2. **EmailJS errors:** Check your service configuration and API limits
3. **Validation errors:** Verify form field names match the JavaScript expectations

## Free Tier Limitations

EmailJS free tier includes:
- 200 emails per month
- 2 email services
- 1 user
- EmailJS branding in emails

For a portfolio website, these limitations are usually sufficient. If you need more, consider upgrading to a paid plan.

## Security Considerations

1. **API Keys:** The EmailJS public key is safe to expose in client-side code
2. **Rate Limiting:** The built-in rate limiting helps prevent spam
3. **Validation:** Server-side validation is always recommended for production use
4. **Domain Restrictions:** Consider setting domain restrictions in EmailJS dashboard

## Next Steps

1. Set up your EmailJS account and configure the service
2. Create your email template
3. Update the JavaScript configuration
4. Test thoroughly
5. Deploy your portfolio with the working contact form
6. Monitor your EmailJS usage in the dashboard

Your contact form should now be fully functional and ready for production use!