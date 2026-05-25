'use strict';

const { Router } = require('express');
const router = Router();

let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: new Date().toISOString() },
  { id: 2, name: 'Bob',   email: 'bob@example.com',   createdAt: new Date().toISOString() },
];
let nextId = 3;

// GET /api/v1/users — return all users
router.get('/', (req, res) => {
  res.json({ data: users, count: users.length });
});

// GET /api/v1/users/:id — return one user by id
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id, 10));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ data: user });
});

// POST /api/v1/users — create a new user
router.post('/', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const newUser = {
    id: nextId++,
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.status(201).json({ data: newUser });
});

// DELETE /api/v1/users/:id — remove a user
router.delete('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id, 10));

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(index, 1);
  res.sendStatus(204);
});

module.exports = router;