const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'app')));

app.use(bodyParser.urlencoded({ extended: true }));

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "suhaas",
  database: "parkingsystem"
});

app.post('/submit', (req, res) => {
    const { username, password } = req.body;
    con.connect((err) => {
        console.log([username],[password]);
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
                console.log('Login successful');
                token(res);
            }else {
                res.status(401).send('Invalid username or password');
            }
        });
    });
});

function token(res){
    res.redirect('token.html');
    app.post('/token', async(req, res) => {
        const { reg_id, vehicle_no } = req.body;
        try{
            // Query to get the length of rows1
            console.log([reg_id],[vehicle_no]);
            const rows1 = await getRows1(reg_id, vehicle_no);
            const l1 = rows1.length;
            const rows2 = await getRows2();
            const l2 = rows2.length;
            const t_no = rows2[0].token_id;
            const s_no = rows2[0].parking_slot;
            console.log('query executed');
            console.log([l1],[l2],[t_no],[s_no]);
            if(l1 === 1 && l2 >= 1){
                con.query('UPDATE token SET reg_id = ?,vehicle_no = ?,entry_time = curtime() WHERE token_id = ?',
                [reg_id,vehicle_no,t_no], (err, rows2) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        return;
                    }
                });
                console.log('query executed');
                console.log(t_no);
                console.log(s_no); 
            }; 
        }catch (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        }
    });   
};

async function getRows1(reg_id, vehicle_no) {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM registration WHERE reg_id = ? AND vehicle_no =?', [reg_id, vehicle_no], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getRows2() {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM token WHERE reg_id IS NULL', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
