const nodemailer = require('nodemailer'); 
const dotenv = require("dotenv");
dotenv.config("../.env");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port:465,
    secure:true,
    auth: {
      user: 'vibeversedipesh@gmail.com',
      pass: 'feqpoosfymaiflqf', 
    },
  });
  
const sendmail = async (name , to , otp) => {
  console.log(process.env.PASSWORD);
    try {
      const mailOptions = {
        from: 'Dipesh Yadav',
        to: `${to}`,
        subject: 'VibeVerse Verification',
        text: '',
        html: `<p>Thanks, <strong>${name}</strong> for creating account on VibeVerse. Your OTP is <strong>${otp}</strong>.<br></br> <br>If you ever have questions, encounter any issues, or just want to chat, I am here to assist you. Feel free to reach out anytime at <strong>yadavdipesh331@gmail.com</strong>.</br> <br></br><br>Warm Regards,</br><br>Dipesh Yadav</br></p>`
      };
  
      const info = await transporter.sendMail(mailOptions); 

    } catch (e) {
        console.log(e.message);
    }
};


module.exports = {
    sendmail
}
