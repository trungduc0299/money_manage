const connection = require('../config/database');
const { use } = require('../routes/route_name');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const saltRounds = 10; // Number of salt rounds for bcrypt

const signIn = (req, res) => {
    let userName = req.body.user_name;
    let password = req.body.password;
    try {
        connection.query(
            'SELECT * FROM user WHERE user_name = ? AND password = ?', [userName, password],
            function (err, result) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                // Check if user exists (result should contain rows if the query was successful)
                if (result.length == 1) {
                    // Generate JWT token
                    const payload = { check: true };
                    const token = jwt.sign(payload, 'your_secret_key', {
                        expiresIn: "1d"
                    });

                    // Send user details and the token in a single response
                    connection.query(
                        "SELECT * FROM user WHERE user_name = ?", [userName],
                        function (err, userResult) {
                            if (err) {
                                throw err;
                            }

                            // Send the response with user info and token
                            res.json({
                                success: true,
                                message: 'Authentication successful!',
                                user: userResult[0],
                                token: token
                            });
                        }
                    );
                } else {
                    // If no user was found
                    res.status(401).json({
                        success: false,
                        message: 'Authentication failed! User not found or wrong credentials.'
                    });
                }
            }
        );
    } catch (err) {
        res.status(500).send({ error: 'An error occurred' });
    }
};

const updateUser = (req, res) => {
    let fullName = req.body.full_name;
    let phoneNum = req.body.phone_number;
    let userId = req.body.user_id;
    connection.query(
        'UPDATE Account_infor SET full_name = ?,phone_number = ? WHERE user_id = ?', [fullName, phoneNum, userId],
        function (err, results) {
            if (err) {
                throw err;
            }
            if (results.affectedRows == 1) {
                connection.query(
                    "SELECT * FROM Account_infor WHERE user_id = ?", [userId],
                    function (err, result) {
                        if (err) {
                            throw err;
                        }
                        res.send(result);
                    }
                )
            }
            else {
                res.send("Error");
            }
        }
    )
}

const getAllUser = (req, res) => {
    connection.query(
        'SELECT * FROM Account_infor ai LEFT JOIN `User` u ON u.id  = ai.user_id ',
        function (err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        }
    )
}

// Assuming `checkIfUserExists` is an async function
async function checkIfUserExists(email, userName) {
    try {
        const query = 'SELECT * FROM user WHERE email = ? OR user_name = ?';
        const [rows] = await connection.promise().query(query, [email, userName]);
        return rows.length > 0; // Return true if user exists
    } catch (error) {
        console.error('Error checking if user exists:', error);
        throw new Error('Database query failed');
    }
}

const signUp = async (req, res) => {
    const role = "user";
    const userName = req.body.user_name;
    const password = req.body.password;
    const email = req.body.email;
    const phoneNumber = req.body.phone_number;
    const fullName = req.body.full_name;

    // Check if required fields are provided
    if (!userName || !password || !email) {
        return res.status(400).json({
            success: false,
            message: 'Username, email, and password are required!'
        });
    }

    try {
        // Check if the user with the provided email or username already exists
        const userExists = await checkIfUserExists(email, userName);
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the database (assuming auto-increment for id)
        const query = `INSERT INTO user (user_name, email, roles, phone_number, password, full_name) VALUES (?, ?, ?, ?, ?, ?)`;
        await connection.promise().query(query, [userName, email, role, phoneNumber, hashedPassword, fullName]);

        // If successful, return a success message
        res.status(201).json({
            success: true,
            message: 'User registered successfully!'
        });

    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Setup your email transport (using nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'trungduc02991@gmail.com',
        pass: 'irar ferj dnbs uync' // Use the generated App Password here
    }
});

// Request Password Reset - Sends a reset token to user's email
const requestPasswordReset = async (req, res) => {
    const { email, user_name } = req.body;

    if (!email || !user_name) {
        return res.status(400).json({ success: false, message: 'Username and email are required' });
    }

    try {
        // Check if a user exists with the provided email and username
        const [user] = await connection.promise().query('SELECT * FROM user WHERE email = ? AND user_name = ?', [email, user_name]);

        if (!user.length) {
            return res.status(404).json({ success: false, message: 'User not found with this email and username' });
        }

        // Generate a reset token (key) - can be any string (e.g., random bytes)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, saltRounds); // Hash the token before storing it

        // Store the hashed token and an expiration time (1 hour) in the database
        await connection.promise().query(
            'UPDATE user SET reset_token = ?, reset_token_expires = ? WHERE email = ? AND user_name = ?',
            [hashedToken, Date.now() + 3600000, email, user_name]
        );

        // Send the reset token to the user's email
        const mailOptions = {
            from: 'your_email@example.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Here is your password reset key: ${resetToken}. It will expire in 1 hour.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Password reset key has been sent to your email.'
        });

    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Reset Password - User submits the reset key and a new password
const resetPassword = async (req, res) => {
    const { email, user_name, resetToken, newPassword } = req.body;

    if (!email || !user_name || !resetToken || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Email, username, reset token, and new password are required'
        });
    }

    try {
        // Find the user by email and username
        const [user] = await connection.promise().query('SELECT * FROM user WHERE email = ? AND user_name = ?', [email, user_name]);

        if (!user.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userRecord = user[0];

        // Check if the reset token has expired
        if (Date.now() > userRecord.reset_token_expires) {
            return res.status(400).json({ success: false, message: 'Reset token has expired' });
        }

        // Verify the reset token
        const isValidToken = await bcrypt.compare(resetToken, userRecord.reset_token);

        if (!isValidToken) {
            return res.status(400).json({ success: false, message: 'Invalid reset token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password and clear the reset token fields
        await connection.promise().query(
            'UPDATE user SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ? AND user_name = ?',
            [hashedPassword, email, user_name]
        );

        res.status(200).json({
            success: true,
            message: 'Password has been successfully reset.'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Search user by full name function
const searchUserByFullName = (req, res) => {
    const { full_name } = req.params; // Assuming the full name is passed as a URL parameter

    // Check if the full name is provided
    if (!full_name) {
        return res.status(400).json({
            success: false,
            message: 'Full name is required!'
        });
    }

    // SQL query to search user by full name
    const query = 'SELECT * FROM user WHERE full_name  LIKE ?';

    // Execute the query
    connection.query(query, [full_name], (err, result) => {
        if (err) {
            console.error('Error searching for user:', err);
            return res.status(500).json({
                success: false,
                message: 'Error occurred while searching for the user.'
            });
        }

        // If the user is not found
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        // Return the user data
        return res.status(200).json({
            success: true,
            user: result // Return the matching user(s)
        });
    });
};

module.exports = {
    signIn,
    signUp,
    updateUser,
    getAllUser,
    requestPasswordReset,
    resetPassword,
    searchUserByFullName
}