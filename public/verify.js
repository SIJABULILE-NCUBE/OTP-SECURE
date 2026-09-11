// this file handles the verify screen
// it sends the email and code to our backend and shows whether it was valid

const emailInput = document.getElementById('email');
const codeInput = document.getElementById('code');
const verifyBtn = document.getElementById('verifyBtn');
const messageEl = document.getElementById('message');

verifyBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const code = codeInput.value;

  if (!email || !code) {
    messageEl.textContent = 'Please fill in both fields';
    return;
  }

  messageEl.textContent = 'Checking...';

  try {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });

    const result = await response.json();
    messageEl.textContent = result.message;
  } catch (error) {
    messageEl.textContent = 'Something went wrong, please try again';
  }
});
