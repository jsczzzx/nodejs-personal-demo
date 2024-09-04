import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import User from './model/User.js';
import Restaurant from './model/Restaurant.js';
import Order from './model/Order.js';

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
	const { userName, mobile_no, email, address, password } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({
			userName,
			mobile_no,
			email,
			address,
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

// Get a user by ID
app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password'); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


app.get('/restaurants', authenticateToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select(''); // Exclude the password field from the result
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


app.post('/orders', authenticateToken, async (req, res) => {
	const { userName, restaurantId, restaurantName, items, totalPrice, createdAt, updatedAt, status } = req.body;

	try {

		const order = new Order({
			userName, 
			restaurantId, 
			restaurantName, 
			items, 
			totalPrice, 
			createdAt, 
			updatedAt, 
			status
		});

		await order.save();
		res.status(201).json({ message: 'Order submitted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
});

app.post('/restaurants', async (req, res) => {
	const { name,telephone,address,coordinates,type,dishes } = req.body;

	try {
		const existingRestaurant = await User.findOne({ address });
		if (existingRestaurant) {
			return res.status(400).json({ message: 'Restaurant already exists' });
		}

		const restaurant = new Restaurant({
			name,
			telephone,
			address,
			coordinates,
			type,
			dishes
		});

		await restaurant.save();
		res.status(201).json({ message: 'Restaurant registered successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error });
	}
});


app.get('/restaurants/search', async (req, res) => {
  const { query, latitude, longitude, page = 1, limit = 10 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'User location (latitude and longitude) is required' });
  }

  try {
    const restaurantsWithDistances = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          spherical: true,
          query: {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { type: { $regex: query, $options: 'i' } },
              { 'dishes.name': { $regex: query, $options: 'i' } }
            ]
          }
        }
      },
      { $sort: { distance: 1 } },
      { $skip: (page - 1) * limit },  // Skip previous pages
      { $limit: parseInt(limit) }     // Limit results per page
    ]);

    const response = restaurantsWithDistances.map(restaurant => ({
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        telephone: restaurant.telephone,
        address: restaurant.address,
        coordinates: restaurant.coordinates,
        type: restaurant.type,
        dishes: restaurant.dishes,
      },
      distance: restaurant.distance / 1609.34
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while searching for restaurants' });
  }
});



app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
