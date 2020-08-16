const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendgridAPIKey)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bonilla.esteban@hotmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.` 
    })
}


const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bonilla.esteban@hotmail.com',
        subject: 'Good bye from Task App!',
        text: `We are sorry to see you go ${name}. Let us know how we could had done it better.` 
    })
}


//Export an object, as we need to export multiple things
module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}