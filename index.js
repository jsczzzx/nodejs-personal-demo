import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import User from './model/User.js';

const app = express();
app.use(express.json()); // To parse JSON request bodies
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = '46caab1fd196ddac13f90c533d090700f391a174bf56d53c3b20836a48f2074ba089f2a3bf9f7035fd13a82fe26aa2a8c24fbd6055fccacaf4d6a2729b785700'; // Replace with your actual secret

mongoose.connect("mongodb+srv://zixinzhang0519:zzx971106@cluster0.avikpsa.mongodb.net/demo?retryWrites=true&w=majority&appName=Cluster0")
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error('Failed to connect to MongoDB', err));

// Register route
app.post('/register', async (req, res) => {
	const { first_name, last_name, mobile_no, email, password } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({
			first_name,
			last_name,
			mobile_no,
			email,
			password: hashedPassword,
		});

		await user.save();
		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
});

// Login route
app.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		} else {
			const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    		return res.json({ token });
		}


	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
});


const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Route to get all users
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude the password field from the result
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});





app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
