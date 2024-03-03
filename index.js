const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'app','index')));

app.use(bodyParser.urlencoded({ extended: true }));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "suhaas",
  database: "parkingsystem"
});

app.post('/submit', (req, res) => {
    const { username, password } = req.body;
    con.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            return;
        }
        console.log('Connected to MySQL database');
        
        con.query('SELECT password FROM admin WHERE admin_id = ?', [username], (err, rows) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
            console.log('Result of SQL query:', rows);
            const firstObject = rows[0];
            const user_pwd = firstObject.password;
            console.log(user_pwd);
            if(user_pwd === password){
                //on successful login, it should open another .js file corresponding to the token.html
                //replace the below line with appropraite code
                res.send('Login successful!');
            }else {
                res.status(401).send('Invalid username or password');
            }
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});