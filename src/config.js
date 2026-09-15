// this file holds al the settings that the spec calls "X"
// keeping them here means i can change any rule from one place
// instead of hunting through the whole project for a number

module.exports = {
  // how many new otps a single email is allowed to request in one hour
  MAX_OTP_REQUESTS_PER_HOUR: 3,

  // how many seconds an otp stays valid for after it gets made
  OTP_EXPIRY_SECONDS: 30,

  // if someone hits resend within this many minutes of the otp being made
  // we send back the same code instead of making a brand new one
  RESEND_WINDOW_MINUTES: 5,

  // the most times one single otp is allowed to be resent
  MAX_RESENDS: 3
};
