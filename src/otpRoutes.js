// this file just handles the http side of things
// it takes the request, calls the right function from otpService
// and sends back a response, no otp rules live in this file on purpose

const express = require('express');
const router = express.Router();
const otpService = require('./otpService');

// screen 1 uses this to send a brand new otp
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await otpService.requestOtp(email);
    res.json(result);
  } catch (error) {
    console.log('error in /send', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// screen 1 also uses this when someone clicks the resend button
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await otpService.resendOtp(email);
    res.json(result);
  } catch (error) {
    console.log('error in /resend', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// screen 2 uses this to check if an email and code combo is valid
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const result = await otpService.verifyOtp(email, code);
    res.json(result);
  } catch (error) {
    console.log('error in /verify', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

module.exports = router;
