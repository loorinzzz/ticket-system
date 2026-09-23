document.getElementById('ticketForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const priority = document.getElementById('priority').value;
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, category, priority })
  });
  const data = await res.json();
  if (res.ok) {
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('errorMsg').textContent = data.error;
  }
});
