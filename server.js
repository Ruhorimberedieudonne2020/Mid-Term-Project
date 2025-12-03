const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const users = [];

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// =====================
// Page routes
// =====================
app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/index', (req, res) => {
  res.render('index.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/paid', (req, res) => {
  res.render('paid.ejs');
});

app.get('/unpaid', (req, res) => {
  res.render('unpaid.ejs');
});

app.get('/declarations', (req, res) => {
  res.render('declarations.ejs');
});

app.get('/insert', (req, res) => {
  res.render('insert.ejs');
});

app.get('/insertPaid', (req, res) => {
  res.render('insertPaid.ejs');
});

app.get('/insertUnpaid', (req, res) => {
  res.render('insertUnPaid');
});

// =====================
// Demo login
// =====================
app.post('/login', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.username,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch {
    res.redirect('/index');
  }
  console.log(users);
});

// =====================
// In-memory storage
// =====================

// declarations page
let declarationsAll = [];

// paid page
let paidRows = [];

// unpaid page
let unpaidRows = [];

// simple id generator
let nextId = 1;
function makeId() {
  return nextId++;
}

// =====================
// Unified insert API (CREATE)
// =====================
app.post('/api/insert', (req, res) => {
  const {
    page,
    date,
    company,
    owner,
    supposedPaid,
    paidAmount,
    fromDocument,
    fromWarehouse,
    unpaid,
    amount,
    status
  } = req.body;

  console.log('INSERT BODY:', req.body);

  if (page === 'declarations') {
    const supposed = parseFloat(supposedPaid);
    const paid = parseFloat(paidAmount);
    const balance = supposed - paid;

    declarationsAll.push({
      id: makeId(),
      date,
      company,
      owner,
      supposedPaid: `$${supposed.toLocaleString()}`,
      paidAmount: `$${paid.toLocaleString()}`,
      balance: `$${balance.toLocaleString()}`
    });

  } else if (page === 'paid') {
    const doc = parseFloat(fromDocument);
    const wh  = parseFloat(fromWarehouse);

    paidRows.push({
      id: makeId(),
      date,
      owner,
      fromDocument: `$${doc.toLocaleString()}`,
      fromWarehouse: `$${wh.toLocaleString()}`,
      status
    });

  } else if (page === 'unpaid') {
    const unpaidNum = parseFloat(unpaid);
    const amountNum = amount !== undefined ? parseFloat(amount) : NaN;

    unpaidRows.push({
      id: makeId(),
      date,
      owner,
      unpaid: `$${unpaidNum.toLocaleString()}`,
      amount: isNaN(amountNum) ? '' : `$${amountNum.toLocaleString()}`,
      status
    });
  } else {
    return res.json({ success: false, message: 'Unknown page type' });
  }

  res.json({ success: true });
});

// =====================
// Per-page data APIs (READ)
// =====================
app.get('/api/declarations', (req, res) => {
  res.json(declarationsAll);
});

app.get('/api/paid', (req, res) => {
  res.json(paidRows);
});

app.get('/api/unpaid', (req, res) => {
  res.json(unpaidRows);
});

// =====================
// Update APIs (UPDATE)
// =====================
app.put('/api/declarations/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = declarationsAll.find(r => r.id === id);
  if (!row) return res.status(404).json({ success: false });

  const { date, company, owner, supposedPaid, paidAmount } = req.body;
  const supposed = parseFloat(supposedPaid);
  const paid = parseFloat(paidAmount);
  const balance = supposed - paid;

  row.date = date;
  row.company = company;
  row.owner = owner;
  row.supposedPaid = `$${supposed.toLocaleString()}`;
  row.paidAmount = `$${paid.toLocaleString()}`;
  row.balance = `$${balance.toLocaleString()}`;

  res.json({ success: true });
});

app.put('/api/paid/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = paidRows.find(r => r.id === id);
  if (!row) return res.status(404).json({ success: false });

  const { date, owner, fromDocument, fromWarehouse, status } = req.body;
  const doc = parseFloat(fromDocument);
  const wh  = parseFloat(fromWarehouse);

  row.date = date;
  row.owner = owner;
  row.fromDocument = `$${doc.toLocaleString()}`;
  row.fromWarehouse = `$${wh.toLocaleString()}`;
  row.status = status;

  res.json({ success: true });
});

app.put('/api/unpaid/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = unpaidRows.find(r => r.id === id);
  if (!row) return res.status(404).json({ success: false });

  const { date, owner, unpaid, amount, status } = req.body;
  const unpaidNum = parseFloat(unpaid);
  const amountNum = amount !== undefined ? parseFloat(amount) : NaN;

  row.date = date;
  row.owner = owner;
  row.unpaid = `$${unpaidNum.toLocaleString()}`;
  row.amount = isNaN(amountNum) ? '' : `$${amountNum.toLocaleString()}`;
  row.status = status;

  res.json({ success: true });
});

// =====================
// Delete APIs (DELETE)
// =====================
app.delete('/api/declarations/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  declarationsAll = declarationsAll.filter(r => r.id !== id);
  res.json({ success: true });
});

app.delete('/api/paid/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  paidRows = paidRows.filter(r => r.id !== id);
  res.json({ success: true });
});

app.delete('/api/unpaid/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  unpaidRows = unpaidRows.filter(r => r.id !== id);
  res.json({ success: true });
});
