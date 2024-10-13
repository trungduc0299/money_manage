const bodyParser = require('body-parser');

// Function to check if a user exists by email
async function checkIfUserExists(email, userName) {
    try {
        const query = 'SELECT * FROM user WHERE email = ? AND user_name = ?';
        const [rows] = await connection.promise().query(query, [email, userName]);
        return rows.length > 0; // Return true if user exists
    } catch (error) {
        console.error('Error checking if user exists:', error);
        throw new Error('Database query failed');
    }
}