require("dotenv").config();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendEmail(email, password) {
  const msg = {
    to: email,
    from: "erik@travelingdisc.com",
    subject: "Your password has been reset!",
    text: `Hello, 
        
    It looks like you have forgotten your password, no worries! Your password has been reset to: ${password}
        
    Have a great day,
        
    Erik`,
  };
  sgMail
    .send(msg)
    .then(response => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch(err => {
      console.error(err);
    });
}

module.exports = { sendEmail };
