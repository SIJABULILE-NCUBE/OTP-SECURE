// this file holds all the actual otp rules from the spec
// the routes file will call these functions, it will not contain any logic itself
// i tried to keep the "what happens" separate from the "how the api responds"

const supabase = require('./supabaseClient');
const config = require('./config');

// makes a random 6 digit code as a string
// padStart makes sure short numbers still come out as 6 digits
// example: 613 becomes 000613
function makeSixDigitCode() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  return String(randomNumber).padStart(6, '0');
}

// checks how many otps this email has requested in the last hour
// this is used for the hourly request limit rule
async function countRequestsInLastHour(email) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('otps')
    .select('id')
    .eq('email', email)
    .gte('created_at', oneHourAgo);

  if (error) {
    throw error;
  }

  return data.length;
}

// checks if this exact code has already been sent to this email
// in the last 24 hours, this is used so we never repeat a code
// without the user knowing it happened
async function wasCodeUsedInLast24Hours(email, code) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('otps')
    .select('id')
    .eq('email', email)
    .eq('code', code)
    .gte('created_at', oneDayAgo);

  if (error) {
    throw error;
  }

  return data.length > 0;
}

// grabs the newest otp row for this email
// since only the latest otp is ever valid, this is the row we care about
// for both resending and verifying
async function getLatestOtp(email) {
  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  // if there are no rows yet, data will just be an empty array
  return data[0] || null;
}

// this is the main function that runs when someone asks for a new otp
async function requestOtp(email) {
  // rule: cannot request more than X per hour
  const requestsThisHour = await countRequestsInLastHour(email);
  if (requestsThisHour >= config.MAX_OTP_REQUESTS_PER_HOUR) {
    return {
      success: false,
      message: 'You have requested too many otps this hour, please try again later'
    };
  }

  // rule: cannot get the same code twice within 24 hours
  // we keep generating a new one until it does not clash
  // the user is never told this is happening, it just quietly works
  let code = makeSixDigitCode();
  let alreadyUsedRecently = await wasCodeUsedInLast24Hours(email, code);

  while (alreadyUsedRecently) {
    code = makeSixDigitCode();
    alreadyUsedRecently = await wasCodeUsedInLast24Hours(email, code);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.OTP_EXPIRY_SECONDS * 1000);

  const { error } = await supabase.from('otps').insert({
    email: email,
    code: code,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    resend_count: 0,
    used: false
  });

  if (error) {
    throw error;
  }

  // in a real project this is where we would actually email the code
  // for now i am just logging it to the terminal so i can test everything
  console.log(`sending otp ${code} to ${email}`);

  return {
    success: true,
    message: 'Otp has been sent'
  };
}

// this runs when someone clicks resend on the send otp screen
async function resendOtp(email) {
  const latestOtp = await getLatestOtp(email);

  // if this email has never requested an otp, there is nothing to resend
  if (!latestOtp) {
    return {
      success: false,
      message: 'No otp found for this email, please request one first'
    };
  }

  // if the latest otp was already used successfully, there is nothing valid to resend
  if (latestOtp.used) {
    return {
      success: false,
      message: 'That otp has already been used, please request a new one'
    };
  }

  const now = new Date();
  const createdAt = new Date(latestOtp.created_at);
  const minutesSinceCreated = (now - createdAt) / (60 * 1000);

  // rule: resending outside the resend window is not covered by the spec directly
  // i decided that if the window has passed, we just generate a brand new otp
  // this felt like the safest choice instead of resending something old
  if (minutesSinceCreated > config.RESEND_WINDOW_MINUTES) {
    return requestOtp(email);
  }

  // rule: cannot resend more than X times
  if (latestOtp.resend_count >= config.MAX_RESENDS) {
    return {
      success: false,
      message: 'This otp has already been resent the maximum number of times'
    };
  }

  // still inside the window and under the resend limit
  // so we resend the exact same code and just push the expiry forward
  const newExpiresAt = new Date(now.getTime() + config.OTP_EXPIRY_SECONDS * 1000);

  const { error } = await supabase
    .from('otps')
    .update({
      expires_at: newExpiresAt.toISOString(),
      resend_count: latestOtp.resend_count + 1
    })
    .eq('id', latestOtp.id);

  if (error) {
    throw error;
  }

  console.log(`resending otp ${latestOtp.code} to ${email}`);

  return {
    success: true,
    message: 'Otp has been resent'
  };
}

// this runs when someone submits the verify otp screen
async function verifyOtp(email, code) {
  const latestOtp = await getLatestOtp(email);

  if (!latestOtp) {
    return {
      success: false,
      message: 'No otp found for this email'
    };
  }

  // rule: an otp cannot be used more than once
  if (latestOtp.used) {
    return {
      success: false,
      message: 'This otp has already been used'
    };
  }

  // rule: an otp expires after X seconds
  const now = new Date();
  const expiresAt = new Date(latestOtp.expires_at);
  if (now > expiresAt) {
    return {
      success: false,
      message: 'This otp has expired'
    };
  }

  // rule: only the latest otp is valid, which is already true here
  // since we only ever fetched the newest row for this email
  if (latestOtp.code !== code) {
    return {
      success: false,
      message: 'Incorrect otp'
    };
  }

  // everything checks out, mark it as used so it cannot be reused
  const { error } = await supabase
    .from('otps')
    .update({ used: true })
    .eq('id', latestOtp.id);

  if (error) {
    throw error;
  }

  return {
    success: true,
    message: 'Otp verified successfully'
  };
}

module.exports = {
  requestOtp,
  resendOtp,
  verifyOtp
};
