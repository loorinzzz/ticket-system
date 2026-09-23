let currentUser = null;
let developers = [];

async function loadUser() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = await res.json();
}

async function loadDevelopers() {
  if (currentUser.role !== 'admin') return;
  const res = await fetch('/api/tickets/developers');
  if (res.ok) developers = await res.json();
}

async function loadTickets() {
  const res = await fetch('/api/tickets');
  if (!res.ok) {
    window.location.href = 'login.html';
    return;
  }
  const tickets = await res.json();
  const body = document.getElementById('ticketBody');
  body.innerHTML = '';

  if (currentUser.role === 'admin') {
    document.getElementById('assignHeader').style.display = '';
    document.getElementById('createUserLink').style.display = '';
  }
  if (currentUser.role === 'admin' || currentUser.role === 'developer') {
    document.getElementById('statusHeader').style.display = '';
  }

  tickets.forEach(t => {
    const row = document.createElement('tr');
    let assignCell = '';
    let statusCell = '';

    if (currentUser.role === 'admin') {
      const options = developers.map(d =>
        `<option value="${d.id}" ${t.assigned_to === d.id ? 'selected' : ''}>${d.name}</option>`
      ).join('');
      assignCell = `
        <td>
          <select id="assign-${t.id}">
            <option value="">Unassigned</option>
            ${options}
          </select>
          <button type="button" data-id="${t.id}" class="assignBtn">Assign</button>
        </td>
      `;
    }

    if (currentUser.role === 'admin' || currentUser.role === 'developer') {
      const statuses = ['Open', 'In Progress', 'Resolved'];
      const statusOptions = statuses.map(s =>
        `<option value="${s}" ${t.status === s ? 'selected' : ''}>${s}</option>`
      ).join('');
      statusCell = `
        <td>
          <select id="status-${t.id}">
            ${statusOptions}
          </select>
          <button type="button" data-id="${t.id}" class="statusBtn">Update</button>
        </td>
      `;
    }

    row.innerHTML = `
      <td>${t.id}</td>
      <td>${t.title}</td>
      <td>${t.category}</td>
      <td>${t.priority}</td>
      <td class="status-${t.status.replace(' ', '.')}">${t.status}</td>
      ${assignCell}
      ${statusCell}
    `;
    body.appendChild(row);
  });

  document.querySelectorAll('.statusBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ticketId = btn.getAttribute('data-id');
      const select = document.getElementById(`status-${ticketId}`);
      const status = select.value;
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert('Status updated');
        loadTickets();
      } else {
        alert('Could not update status');
      }
    });
  });

  document.querySelectorAll('.assignBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ticketId = btn.getAttribute('data-id');
      const select = document.getElementById(`assign-${ticketId}`);
      const developerId = select.value;
      if (!developerId) {
        alert('Pick a developer first');
        return;
      }
      const res = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerId })
      });
      if (res.ok) {
        alert('Ticket assigned');
        loadTickets();
      } else {
        alert('Could not assign ticket');
      }
    });
  });
}

async function init() {
  await loadUser();
  await loadDevelopers();
  await loadTickets();
}

document.getElementById('logoutLink').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'login.html';
});

init();
