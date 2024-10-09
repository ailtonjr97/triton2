const nodemailer = require('nodemailer');

async function sendEmailCadastro(to, subject, text) {
    const transporter = nodemailer.createTransport({
        host: 'outlook.maiex13.com.br',
        port: 587,
        secure: false,
        auth: {
            user: 'aux.adm@fibracem.com',
            pass: process.env.EMAIL_SENHA_CADASTRO
        }
    });

    let mailOptions = {
        from: 'aux.adm@fibracem.com',
        to: to,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        throw new Error('Email not sent');
    }
}

module.exports = { sendEmailCadastro };
