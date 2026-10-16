const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sainivishal78271@gmail.com', // Aapka email
    pass: 'gtmketrsvuurwdpq' // File 851e062b-7040-45ea-aa4b-3c2d0f0baa60 se liya gaya bina space ka password
  }
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  try {
    await transporter.sendMail({
      from: '"My App" <sainivishal78271@gmail.com>', // Sender email ko bhi update kar diya gaya hai
      to: email,
      subject: 'लॉगिन कोड',
      text: `आपका OTP: ${otp}. यह 5 मिनट तक मान्य है।`
    });
    res.status(200).send({ message: 'OTP भेजा गया' });
  } catch (error) {
    res.status(500).send({ message: 'एरर' });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record || Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).send({ message: 'OTP एक्सपायर हो गया' });
  }

  if (record.otp === otp) {
    otpStore.delete(email);
    return res.status(200).send({ message: 'लॉगिन सक्सेसफुल' });
  } else {
    return res.status(400).send({ message: 'गलत OTP' });
  }
});

// क्लाउड सर्वर के लिए प्रोसेस पोर्ट ज़रूरी है
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
