const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'app')));

app.use(bodyParser.urlencoded({ extended: true }));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "suhaas",
  database: "parkingsystem"
});

//for admin login
app.post('/submit', (req, res) => {
    try{
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
                    //opens token.html on successfull login
                    console.log('Login successful');
                    token(res);
                }else {
                    res.status(401).send('Invalid username or password');
                }
            });
        });
    }catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
    }
});

function token(res){
    res.redirect('token.html');
    //to generate a token
    app.post('/token', async(req, res) => {
        const { reg_id, vehicle_no } = req.body;
        try{
            console.log([reg_id],[vehicle_no]);
            const rows1 = await get_reg_row(reg_id, vehicle_no);
            const l1 = rows1.length;
            const rows2 = await get_empty_slots();
            const l2 = rows2.length;
            const t_no = rows2[0].token_id;
            const s_no = rows2[0].parking_slot;
            const r_no = rows1[0].reg_id;
            const v_no = rows1[0].vehicle_no;
            const t_check = await get_token_row(r_no,v_no);
            const l3 = t_check.length;
            console.log('query executed');
            console.log([l1],[l2],[t_no],[s_no]);
            console.log(rows1);
            //l1(row exists in registration table)
            //l2(checks for vacant parking spots)
            //l3(checks if the vehicle is trying to generate abother token for itself)
            if(l1 === 1 && l2 >= 1 && l3 === 0){
                con.query('UPDATE token SET reg_id = ?,vehicle_no = ?,entry_time = curtime() WHERE token_id = ?',
                [reg_id,vehicle_no,t_no], (err, rows2) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        return;
                    }
                });
                console.log('token generated');
                console.log(t_no);
                console.log(s_no); 
                //code to display token and slot goes here
            }else if(l3===1){//vehicle already has a token
                res.status(401).send('token already generated');
            }else{//user is not registered
                res.status(401).send('not registered');
            }
        }catch (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        }
    });  
    
    //to make the parking spot available on exit
    app.post('/exit', async(req, res) => {
        try{
            const {exit_id, exit_veh} = req.body;
            console.log([exit_id],[exit_veh]);
            const rows3 = await get_token_row(exit_id, exit_veh);
            const l3 = rows3.length;
            const exit_t = rows3[0].token_id;
            console.log([rows3]);
            //checks if vehicle has a token
            if(l3===1){
                con.query('UPDATE token SET reg_id = NULL,vehicle_no = NULL,entry_time = NULL WHERE token_id = ?',[exit_t], (err, rows3) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        return;
                    }
                    console.log("exit successful");
                });
                const g_row = await guest_check(exit_id, exit_veh);
                console.log([g_row]);
                if(g_row[0].entry_type === 'Guest'){//if the user is a guest, delete row from registration table
                    con.query('DELETE FROM registration WHERE reg_id = ? AND vehicle_no = ?',[exit_id,exit_veh], (err, rows4) => {
                        if (err) {
                            console.error('Error executing query:', err);
                            return;
                        }
                        console.log("guest row deleted");
                    });
                }
                res.redirect('token.html');//redirect back to token.html to refresh the page
            }else{//user tried to exit without a token
                res.status(401).send('cannot exit: token not generated');
            };
        }catch (err) {
            console.error('Error executing query:', err);
            res.status(500).send('cannot exit: token not generated');
        }
    });
};

async function get_reg_row(reg_id, vehicle_no) {//returns row from registration table if the vehicle is registered
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

async function get_empty_slots() {//returns all null rows in token table
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

async function get_token_row(exit_id, exit_veh) {//returns row if the vehicle currently has a token
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM token WHERE reg_id = ? AND vehicle_no =?', [exit_id, exit_veh], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function guest_check(exit_id, exit_veh) {//return entry type of the user(used to check for guest entry)
    return new Promise((resolve, reject) => {
        con.query('SELECT entry_type FROM registration WHERE reg_id = ? AND vehicle_no =?', [exit_id, exit_veh], (err, rows) => {
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
