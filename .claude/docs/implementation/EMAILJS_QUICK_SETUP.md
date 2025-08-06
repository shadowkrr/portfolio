# EmailJS Quick Setup - 5 Minutes

## 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email

## 2. Set Up Gmail Service
1. In EmailJS dashboard, click "Email Services" → "Add New Service"
2. Choose "Gmail"
3. Click "Connect Account" and sign in with your Gmail
4. Copy the **Service ID** (looks like: `service_abc123`)

## 3. Create Email Template
1. Go to "Email Templates" → "Create New Template"
2. Set these fields:
   - **To Email**: Your email address (where you want to receive messages)
   - **Subject**: `New Contact: {{subject}}`
   - **Body**: 
   ```
   From: {{from_name}}
   Email: {{from_email}}
   Subject: {{subject}}
   
   Message:
   {{message}}
   ```
3. Save and copy the **Template ID** (looks like: `template_xyz789`)

## 4. Get Your Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key** (looks like: `AbCdEfGhIjKlMnOp`)

## 5. Update Configuration
Edit `/js/emailjs-config.js` and replace the placeholders:

```javascript
const EMAILJS_CONFIG = {
    serviceId: 'service_abc123',     // Your Service ID
    templateId: 'template_xyz789',   // Your Template ID
    publicKey: 'AbCdEfGhIjKlMnOp'   // Your Public Key
};
```

## 6. Test It!
1. Open your portfolio in a browser
2. Go to the Contact section
3. Fill out the form and submit
4. Check your email!

That's it! Your contact form is now working. 🎉

## Troubleshooting
- Not receiving emails? Check your spam folder
- Getting errors? Check browser console (F12) for details
- Need help? See the full guide in `EMAILJS_SETUP.md`