// netlify/functions/send-email.js

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  try {
    // Parse the JSON body sent from the form
    const data = JSON.parse(event.body);
    const { name, email, message } = data;
    
    // Compose the email
    const msg = {
      to: 'your-email@example.com', // Replace with your email address
      from: 'verified-sender@example.com', // Must be a verified sender with SendGrid
      subject: `New message from ${name}`,
      text: `Email: ${email}\n\nMessage:\n${message}`,
    };
    
    // Send the email via SendGrid
    await sgMail.send(msg);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};
