const express = require('express');  
const mongoose = require('mongoose');  
const bcrypt = require('bcrypt');  
const { body, validationResult } = require('express-validator');  

const app = express();  
const PORT = process.env.PORT || 3000;  

// Middleware  
app.use(express.urlencoded({ extended: true }));  // Add this line for form data parsing
  

// Connect to MongoDB  
mongoose.connect('mongodb://localhost:27017/user_registration') // Ensure to specify the DB name  
    .then(() => console.log('MongoDB connected'))  
    .catch(err => console.log(err));  

    // Root route  
app.get('/', (req, res) => {  
    res.send('Welcome to the API!');  
});
// Define User model  
const UserSchema = new mongoose.Schema({  
    username: { type: String, required: true },  
    email: { type: String, required: true },  
    password: { type: String, required: true },  
});  

const User = mongoose.model('User', UserSchema);  

// Endpoint to register a new user  
app.post('/api/register', [  
    body('username').notEmpty().withMessage('Username is required'),  
    body('email').isEmail().withMessage('Invalid email format'),  
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),  
], async (req, res) => {  
    const errors = validationResult(req);  
    if (!errors.isEmpty()) {  
        return res.status(400).json({ errors: errors.array() });  
    }  

    const { username, email, password } = req.body;  

    // Hash the password  
    const hashedPassword = await bcrypt.hash(password, 10);  

    const newUser = new User({  
        username,  
        email,  
        password: hashedPassword,  
    });  

    try {  
        const savedUser = await newUser.save();  
        res.status(201).json(savedUser);  
    } catch (err) {  
        res.status(400).json({ error: err.message });  
    }  
});  

// Start the server  
app.listen(PORT, () => {  
    console.log(`Server running on http://localhost:${PORT}`);  
});