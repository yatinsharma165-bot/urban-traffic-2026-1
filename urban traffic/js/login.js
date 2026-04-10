/* ===== Login Page Logic ===== */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');

  // Add input animation
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Basic validation
    if (!email) {
      shakeInput(emailInput);
      return;
    }
    if (!password) {
      shakeInput(passwordInput);
      return;
    }

    // Simulate login
    loginBtn.innerHTML = `
      <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Signing in...
    `;
    loginBtn.disabled = true;

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });

  function shakeInput(input) {
    input.style.animation = 'shake 0.4s ease';
    input.style.borderColor = 'var(--color-red)';
    setTimeout(() => {
      input.style.animation = '';
      input.style.borderColor = '';
    }, 500);
  }

  // Add shake animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      50% { transform: translateX(6px); }
      75% { transform: translateX(-4px); }
    }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
});
