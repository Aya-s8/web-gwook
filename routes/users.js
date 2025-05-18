const express = require('express');
const router = express.Router();

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const db = new Low(new JSONFile('users.json'), { users: [] });

// 注册
router.post('/register', async (req, res) => {
  await db.read();
  const { username, password } = req.body;
  const exists = db.data.users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  db.data.users.push({ username, password });
  await db.write();
  res.json({ message: 'Registration successful!' });
});

// 登录
router.post('/login', async (req, res) => {
  await db.read();
  const { username, password } = req.body;
  const user = db.data.users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Username or password incorrect' });
  }
  req.session.user = { username };
  res.json({ message: 'Login successful!', username });
});

// 登出
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// 查询当前登录用户
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

module.exports = router;
