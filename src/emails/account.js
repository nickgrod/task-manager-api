const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'nrodriguez@learn4life.org',
//     from:'nrodriguez@gmail.com',
//     subject:'here is an email',
//     text:'Let\'s see if this goes through'
// })

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'noreply@myapp.com',
        subject: 'Thanks for joining the program.',
        //use the backtick quotes `` to directly inject a variable
        text: `Welcome to the app, ${name}.`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'noreply@myapp.com',
        subject: 'We are sorry to see you go.',
        text: `We will be sad to see you go, ${name}!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}