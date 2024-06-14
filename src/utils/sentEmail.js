
const nodemailer = require('nodemailer');

const myEmail = process.env.MY_EMAIL;

const myPass = process.env.MY_PASS;

const emailorders = (email, otp) => {
    console.log(email);
    console.log(myEmail)
    console.log(myPass);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: myEmail,
            pass: myPass,
        },
    });

    const mailOptions = {
        from: myEmail,
        to: email,
        subject: "otp",
        text: "Your verification otp is " + otp
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("email sent : " + info.response);
        }
    });
};

module.exports = emailorders;
