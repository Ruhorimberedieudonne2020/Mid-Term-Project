const teamData = [
  {
    img: 'images/chantal.png',
    name: 'Nyiramasomo Angelique ',
    role: 'Executive Officer',
    desc: 'Visionary leader, driving company strategy and growth.',
    socialLinks: [
      { name: "facebook", url: '#' },
      { name: "twitter", url: '#' },
      { name: "instagram", url: '#' }
    ]
  },
  {
    img: 'images/bucura2.png',
    name: 'UMUTONI Grace ',
    role: 'Chief of Teams on field',
    desc: 'Coordinates field operations and ensures team success and growth.',
    socialLinks: [
      { name: "facebook", url: '#' },
      { name: "twitter", url: '#' },
      { name: "instagram", url: '#' }
    ]
  },
  {
    img: 'images/jolie.png',
    name: 'BUTOTO Chantal',
    role: 'Accountant',
    desc: 'Ensures financial transparency and sustainable growth.',
    socialLinks: [
      { name: "facebook", url: '#' },
      { name: "twitter", url: '#' },
      { name: "instagram", url: '#' }
    ]
  }
];

// Track selected rows
let selectedRow = {
  declarations: null,
  paid: null,
  unpaid: null
};

// =========================
// Simple front-end login
// =========================
let loginButton = document.getElementById('login');
if (loginButton) {
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  loginButton.onclick = function () {
    const validUsername = 'admin';
    const validPassword = 'masomo@123';
    if (username.value === validUsername && password.value === validPassword) {
      alert('Login successful!');
      localStorage.setItem('loggedUser', username.value);

      let redirectPage = localStorage.getItem("redirectAfterLogin");
      localStorage.removeItem("redirectAfterLogin");

      if (!redirectPage || redirectPage === "/login") {
        redirectPage = "/declarations"; // or "/index" if you prefer
      }

      window.location.href = redirectPage;
    } else {
      alert('Invalid username or password. Please try again.');
    }
  };
}


// =========================
// Modal: Insert / Update
// =========================
(function () {
  const modal = document.getElementById("myModal");
  const insertBtn = document.getElementById("insertBtn");
  const span = document.querySelector(".close");
  const iframe = document.querySelector(".modal-content iframe");

  if (!modal || !insertBtn || !span || !iframe) return;

  insertBtn.onclick = function () {
    // open in "create" mode
    modal.style.display = "block";
    iframe.contentWindow.postMessage({ mode: 'create' }, '*');
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
})();

// =====================
// Highlight Active Menu Link
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const menuLinks = document.querySelectorAll(".menu a");

  menuLinks.forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage || (linkPage === "/index" && currentPage === "")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});

// =========================
// Page Access Control
// =========================
document.addEventListener("DOMContentLoaded", function () {
const path = window.location.pathname; // e.g. "/declarations", "/login", "/"
const loggedUser = localStorage.getItem("loggedUser");

const isPublic =
path === "/" ||
path === "/index" ||
path === "/login";

if (!isPublic && !loggedUser) {
window.location.href = "/login";
}
});

// =========================
// Login / Logout Link Toggle
// =========================
document.addEventListener("DOMContentLoaded", function () {
  const authLink = document.getElementById("authLink");
  const loggedUser = localStorage.getItem("loggedUser");

  if (!authLink) return;

  if (loggedUser) {
    authLink.textContent = "Logout";
    authLink.href = "#";
    authLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("loggedUser");
      alert('You have been logged out.');
      window.location.href = "/login";
    });
  } else {
    authLink.textContent = "Sign In";
    authLink.href = "/login";
  }
});

// =========================
// Remember target page before login
// =========================
document.addEventListener("DOMContentLoaded", function () {
  const menuLinks = document.querySelectorAll(".menu a");

  menuLinks.forEach(link => {
    const href = link.getAttribute("href");
    const isProtected =
      href === "/declarations" ||
      href === "/paid" ||
      href === "/unpaid";

    if (isProtected) {
      link.addEventListener("click", function (e) {
        const loggedUser = localStorage.getItem("loggedUser"); // read at click time
        if (!loggedUser) {
          e.preventDefault();
          localStorage.setItem("redirectAfterLogin", href);
          window.location.href = "/login";
        }
      });
    }
  });
});


// =========================
// Inactivity logout
// =========================
let inactivityTime = function () {
  let time;
  window.onload = resetTimer;
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;

  function logout() {
    alert("You are now logged out due to inactivity.");
    localStorage.removeItem("loggedUser");
    window.location.href = "/login";
  }

  function resetTimer() {
    clearTimeout(time);
    time = setTimeout(logout, 1800000);  // 30 minutes
  }
};
inactivityTime();

// =========================
// Table Balance Calculation (declarations only)
// =========================
window.addEventListener('DOMContentLoaded', function () {
  const table = document.getElementById('declarationsTable');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  for (let row of tbody.rows) {
    let supposedPaid = row.cells[3].textContent.replace(/[^0-9.-]+/g, "");
    let paidAmount = row.cells[4].textContent.replace(/[^0-9.-]+/g, "");
    let balance = parseFloat(supposedPaid) - parseFloat(paidAmount);
    balance = isNaN(balance) ? '' : `$${balance.toLocaleString()}`;
    row.cells[5].textContent = balance;
  }
});

// =========================
// Insert / Update forms (inside iframes)
// =========================

// Declarations
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('declarationsForm');
  if (!form) return;

  // Listen for edit data
  window.addEventListener('message', function (event) {
    const data = event.data;
    if (!data) return;

    if (data.mode === 'create') {
      form.reset();
      delete form.dataset.id;
      return;
    }
    if (data.mode === 'edit' && data.page === 'declarations') {
      const row = data.row;
      form.dataset.id = row.id;
      form.date.value = row.date;
      form.company.value = row.company;
      form.owner.value = row.owner;
      form.supposedPaid.value = row.supposedPaid.replace(/[^0-9.-]+/g, '');
      form.paidAmount.value = row.paidAmount.replace(/[^0-9.-]+/g, '');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = form.dataset.id;

    const body = {
      date: form.date.value,
      company: form.company.value,
      owner: form.owner.value,
      supposedPaid: form.supposedPaid.value,
      paidAmount: form.paidAmount.value
    };

    if (id) {
      // UPDATE
      fetch(`/api/declarations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(resp => {
          if (resp.success) {
            form.reset();
            delete form.dataset.id;
            window.parent.postMessage({ inserted: true, page: 'declarations' }, '*');
          }
        });
    } else {
      // CREATE
      const data = { page: 'declarations', ...body };
      fetch('/api/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            form.reset();
            window.parent.postMessage({ inserted: true, page: 'declarations' }, '*');
          }
        });
    }
  });
});

// Paid
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('paidForm');
  if (!form) return;

  window.addEventListener('message', function (event) {
    const data = event.data;
    if (!data) return;

    if (data.mode === 'create') {
      form.reset();
      delete form.dataset.id;
      return;
    }
    if (data.mode === 'edit' && data.page === 'paid') {
      const row = data.row;
      form.dataset.id = row.id;
      form.date.value = row.date;
      form.owner.value = row.owner;
      form.fromDocument.value = row.fromDocument.replace(/[^0-9.-]+/g, '');
      form.fromWarehouse.value = row.fromWarehouse.replace(/[^0-9.-]+/g, '');
      form.status.value = row.status;
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = form.dataset.id;

    const body = {
      date: form.date.value,
      owner: form.owner.value,
      fromDocument: form.fromDocument.value,
      fromWarehouse: form.fromWarehouse.value,
      status: form.status.value
    };

    if (id) {
      // UPDATE
      fetch(`/api/paid/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(resp => {
          if (resp.success) {
            form.reset();
            delete form.dataset.id;
            window.parent.postMessage({ inserted: true, page: 'paid' }, '*');
          }
        });
    } else {
      // CREATE
      const data = { page: 'paid', ...body };
      fetch('/api/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            form.reset();
            window.parent.postMessage({ inserted: true, page: 'paid' }, '*');
          }
        });
    }
  });
});

// Unpaid
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('unpaidForm');
  if (!form) return;

  window.addEventListener('message', function (event) {
    const data = event.data;
    if (!data) return;

    if (data.mode === 'create') {
      form.reset();
      delete form.dataset.id;
      return;
    }
    if (data.mode === 'edit' && data.page === 'unpaid') {
      const row = data.row;
      form.dataset.id = row.id;
      form.date.value = row.date;
      form.owner.value = row.owner;
      form.unpaid.value = row.unpaid.replace(/[^0-9.-]+/g, '');
      form.status.value = row.status;
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = form.dataset.id;

    const body = {
      date: form.date.value,
      owner: form.owner.value,
      unpaid: form.unpaid.value,
      status: form.status.value
    };

    if (id) {
      // UPDATE
      fetch(`/api/unpaid/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(resp => {
          if (resp.success) {
            form.reset();
            delete form.dataset.id;
            window.parent.postMessage({ inserted: true, page: 'unpaid' }, '*');
          }
        });
    } else {
      // CREATE
      const data = { page: 'unpaid', ...body };
      fetch('/api/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            form.reset();
            window.parent.postMessage({ inserted: true, page: 'unpaid' }, '*');
          }
        });
    }
  });
});

// =========================
// Load tables for each page (with row selection)
// =========================
function loadDeclarationsTable() {
  const table = document.getElementById('declarationsTable');
  if (!table) return;

  fetch('/api/declarations')
    .then(res => res.json())
    .then(rows => {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      rows.forEach(row => {
        const tr = tbody.insertRow();
        tr.dataset.id = row.id;
        tr.insertCell(0).textContent = row.date;
        tr.insertCell(1).textContent = row.company;
        tr.insertCell(2).textContent = row.owner;
        tr.insertCell(3).textContent = row.supposedPaid;
        tr.insertCell(4).textContent = row.paidAmount;
        tr.insertCell(5).textContent = row.balance;

        tr.addEventListener('click', () => {
          Array.from(tbody.rows).forEach(r => r.classList.remove('selected'));
          tr.classList.add('selected');
          selectedRow.declarations = row;
        });
      });
    });
}

function loadPaidTable() {
  const table = document.getElementById('paidTable');
  if (!table) return;

  fetch('/api/paid')
    .then(res => res.json())
    .then(rows => {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      rows.forEach(row => {
        const tr = tbody.insertRow();
        tr.dataset.id = row.id;
        tr.insertCell(0).textContent = row.date;
        tr.insertCell(1).textContent = row.owner;
        tr.insertCell(2).textContent = row.fromDocument;
        tr.insertCell(3).textContent = row.fromWarehouse;
        tr.insertCell(4).textContent = row.status;

        tr.addEventListener('click', () => {
          Array.from(tbody.rows).forEach(r => r.classList.remove('selected'));
          tr.classList.add('selected');
          selectedRow.paid = row;
        });
      });
    });
}

function loadUnpaidTable() {
  const table = document.getElementById('unpaidTable');
  if (!table) return;

  fetch('/api/unpaid')
    .then(res => res.json())
    .then(rows => {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      rows.forEach(row => {
        const tr = tbody.insertRow();
        tr.dataset.id = row.id;
        tr.insertCell(0).textContent = row.date;
        tr.insertCell(1).textContent = row.owner;
        tr.insertCell(2).textContent = row.unpaid;
        tr.insertCell(3).textContent = row.status;

        tr.addEventListener('click', () => {
          Array.from(tbody.rows).forEach(r => r.classList.remove('selected'));
          tr.classList.add('selected');
          selectedRow.unpaid = row;
        });
      });
    });
}

// =========================
// Client-side search (declarations page)
// =========================
function setupDeclarationsSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const table = document.getElementById('declarationsTable');
  if (!searchInput || !table) return;

  const tbody = table.querySelector('tbody');

  function applyFilter() {
    const query = searchInput.value.toLowerCase().trim();
    Array.from(tbody.rows).forEach(row => {
      const rowText = Array.from(row.cells)
        .map(td => td.textContent.toLowerCase())
        .join(' ');
      row.style.display = rowText.includes(query) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', applyFilter);
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilter);
  }
}

// Load tables and search on page load
window.addEventListener('DOMContentLoaded', function () {
  loadDeclarationsTable();
  loadPaidTable();
  loadUnpaidTable();
  setupDeclarationsSearch();
});

// =========================
// Update / Delete buttons
// =========================
window.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname.split('/').pop();
  const updateBtn = document.getElementById('updateBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const modal = document.getElementById('myModal');
  const iframe = document.querySelector('.modal-content iframe');

  if (!updateBtn || !deleteBtn || !modal || !iframe) return;

  if (path === 'declarations') {
    updateBtn.addEventListener('click', () => {
      const row = selectedRow.declarations;
      if (!row) {
        alert('Please select a row to update.');
        return;
      }
      modal.style.display = "block";
      iframe.contentWindow.postMessage({ mode: 'edit', page: 'declarations', row }, '*');
    });

    deleteBtn.addEventListener('click', () => {
      const row = selectedRow.declarations;
      if (!row) {
        alert('Please select a row to delete.');
        return;
      }
      if (!confirm('Delete this record?')) return;

      fetch(`/api/declarations/${row.id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          selectedRow.declarations = null;
          loadDeclarationsTable();
        });
    });

  } else if (path === 'paid') {
    updateBtn.addEventListener('click', () => {
      const row = selectedRow.paid;
      if (!row) {
        alert('Please select a row to update.');
        return;
      }
      modal.style.display = "block";
      iframe.contentWindow.postMessage({ mode: 'edit', page: 'paid', row }, '*');
    });

    deleteBtn.addEventListener('click', () => {
      const row = selectedRow.paid;
      if (!row) {
        alert('Please select a row to delete.');
        return;
      }
      if (!confirm('Delete this record?')) return;

      fetch(`/api/paid/${row.id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          selectedRow.paid = null;
          loadPaidTable();
        });
    });

  } else if (path === 'unpaid') {
    updateBtn.addEventListener('click', () => {
      const row = selectedRow.unpaid;
      if (!row) {
        alert('Please select a row to update.');
        return;
      }
      modal.style.display = "block";
      iframe.contentWindow.postMessage({ mode: 'edit', page: 'unpaid', row }, '*');
    });

    deleteBtn.addEventListener('click', () => {
      const row = selectedRow.unpaid;
      if (!row) {
        alert('Please select a row to delete.');
        return;
      }
      if (!confirm('Delete this record?')) return;

      fetch(`/api/unpaid/${row.id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          selectedRow.unpaid = null;
          loadUnpaidTable();
        });
    });
  }
});

// Search functionality for unpaid and paid pages 
// Search for Paid page
function setupPaidSearch() {
  const searchInput = document.getElementById('searchPaidInput');
  const searchBtn = document.getElementById('searchPaidBtn');
  const table = document.getElementById('paidTable');
  if (!searchInput || !table) return;

  const tbody = table.querySelector('tbody');

  function applyFilter() {
    const query = searchInput.value.toLowerCase().trim();
    Array.from(tbody.rows).forEach(row => {
      const rowText = Array.from(row.cells)
        .map(td => td.textContent.toLowerCase())
        .join(' ');
      row.style.display = rowText.includes(query) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', applyFilter);
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilter);
  }
}

// Search for Unpaid page
function setupUnpaidSearch() {
  const searchInput = document.getElementById('searchUnpaidInput');
  const searchBtn = document.getElementById('searchUnpaidBtn');
  const table = document.getElementById('unpaidTable');
  if (!searchInput || !table) return;

  const tbody = table.querySelector('tbody');

  function applyFilter() {
    const query = searchInput.value.toLowerCase().trim();
    Array.from(tbody.rows).forEach(row => {
      const rowText = Array.from(row.cells)
        .map(td => td.textContent.toLowerCase())
        .join(' ');
      row.style.display = rowText.includes(query) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', applyFilter);
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilter);
  }
}

window.addEventListener('DOMContentLoaded', function () {
  loadDeclarationsTable();
  loadPaidTable();
  loadUnpaidTable();
  setupDeclarationsSearch();
  setupPaidSearch();
  setupUnpaidSearch();
});
// =========================

// Refresh tables after insert/update and close modal
window.addEventListener('message', function (event) {
  if (event.data && event.data.inserted) {
    if (event.data.page === 'paid') {
      loadPaidTable();
    } else if (event.data.page === 'unpaid') {
      loadUnpaidTable();
    } else {
      loadDeclarationsTable();
    }
    const modal = document.getElementById('myModal');
    if (modal) modal.style.display = 'none';
  }
});
