const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./utils/auth');
const cookieParser = require('cookie-parser');
const fs = require('fs'); // Add this line to require the 'fs' module

const app = express();
const PORT = process.env.PORT || 3000;

// Function to save users to a JSON file
function saveUsersToFile(users) {
  const usersFilePath = path.join(__dirname, 'users.json'); // Specify the file path
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.set('view engine', 'ejs');

// In-memory data store
const users = [];

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/secured', auth, (req, res) => {
  res.render('secured');
});

// Logout route
app.get('/logout', (req, res) => {
    // Clear the token from the cookie
    res.clearCookie('token');
    res.redirect('/login');
  });

// User registration
app.post('/register', async (req, res) => {
  const { name, username, password, email, mobile } = req.body;
  // Check if the username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).send('Username already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user object
  const newUser = { name, username, password: hashedPassword, email, mobile };
  users.push(newUser);

  // Save the updated users array to the JSON file
  saveUsersToFile(users);

  res.redirect('/login');
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Find the user with the given username
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(401).send('Invalid username or password');
  }

  // Compare the provided password with the hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send('Invalid username or password');
  }

  // Generate a JSON Web Token
  const token = jwt.sign({ username: user.username }, 'your_secret_key', { expiresIn: '1h' });

  // Set the token in a cookie
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/secured');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});