// this file handles clicks on the send otp screen
// it talks to our backend using fetch, nothing fancy

const emailInput = document.getElementById('email');
const sendBtn = document.getElementById('sendBtn');
const resendBtn = document.getElementById('resendBtn');
const messageEl = document.getElementById('message');

// small helper so i am not repeating the same fetch code twice
async function callOtpApi(endpoint, email) {
  const response = await fetch(`/api/otp/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  return response.json();
}

sendBtn.addEventListener('click', async () => {
  const email = emailInput.value;

  if (!email) {
    messageEl.textContent = 'Please enter an email first';
    return;
  }

  messageEl.textContent = 'Sending...';

  try {
    const result = await callOtpApi('send', email);
    messageEl.textContent = result.message;
  } catch (error) {
    messageEl.textContent = 'Something went wrong, please try again';
  }
});

resendBtn.addEventListener('click', async () => {
  const email = emailInput.value;

  if (!email) {
    messageEl.textContent = 'Please enter an email first';
    return;
  }

  messageEl.textContent = 'Resending...';

  try {
    const result = await callOtpApi('resend', email);
    messageEl.textContent = result.message;
  } catch (error) {
    messageEl.textContent = 'Something went wrong, please try again';
  }
});
