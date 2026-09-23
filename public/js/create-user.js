async function checkAdmin() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    window.location.href = 'login.html';
    return;
  }
  const user = await res.json();
  if (user.role !== 'admin') {
    window.location.href = 'dashboard.html';
  }
}

checkAdmin();

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await res.json();
  if (res.ok) {
    alert('User created');
    document.getElementById('signupForm').reset();
  } else {
    document.getElementById('errorMsg').textContent = data.error;
  }
});
