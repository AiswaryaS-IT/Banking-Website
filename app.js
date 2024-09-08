const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mysql = require("mysql");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 1000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

const handlebars = exphbs.create({ extname: ".hbs" });
app.engine('hbs', handlebars.engine);
app.set("view engine", "hbs");

const con = mysql.createPool({
    connectionlimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


function generateShortIdentifier() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return timestamp + random;
}

app.post('/home', (req, res) => {
    const { account_number, phone } = req.body;
    const sql = `SELECT fullname, account_number FROM users WHERE account_number = ? AND phone = ?`;
    const values = [account_number, phone];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Error fetching user data');
        }

        if (result.length === 0) {
            return res.render('home', { errorMessage: 'Invalid login details. Please try again.' });
        }

        const fullname = result[0].fullname;
        const accountNumber = result[0].account_number; 

        res.render('welcome', { fullname, accountNumber });
    });
});



app.post('/register', (req, res) => {
    const { fullname, address, phone, email, accountType, deposit } = req.body;

    const accountNumber = generateShortIdentifier(); 
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO users (fullname, address, phone, email, account_type, amount, account_number, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [fullname, address, phone, email, accountType, deposit, accountNumber, currentDate];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error inserting data');
        }

        const successMessage = `Account created successfully.`;
        res.render('register', { successMessage, accountNumber });
    });
});

app.get('/', (req, res) => {
    res.render("home", { cssPath: "/css/style.css" });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/transaction', (req, res) => {
    res.render('transaction');
});

app.post('/transaction', (req, res) => {
    const { accountNumber, transactionType, amount } = req.body;

    console.log('Account Number:', accountNumber);
    console.log('Transaction Type:', transactionType);
    console.log('Amount:', amount);

    const getUserSQL = `SELECT id FROM users WHERE account_number = ?`;
    const getUserValues = [accountNumber];

    con.query(getUserSQL, getUserValues, (err, userResult) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Error fetching user data');
        }

        if (userResult.length === 0) {
            console.log("User not found");
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].id;

        const insertTransactionSQL = `INSERT INTO transaction_history (user_id, transaction_type, amount) VALUES (?, ?, ?)`;
        const insertTransactionValues = [userId, transactionType, amount];

        con.query(insertTransactionSQL, insertTransactionValues, (err, transactionResult) => {
            if (err) {
                console.error('Error inserting transaction data:', err);
                return res.status(500).send('Error inserting transaction data');
            }

            let updateAmountSQL;
            if (transactionType === 'Credit') {
                updateAmountSQL = `UPDATE users SET amount = amount + ? WHERE id = ?`;
            } else if (transactionType === 'Debit') {
                updateAmountSQL = `UPDATE users SET amount = amount - ? WHERE id = ?`;
            } else {
                return res.status(400).send('Invalid transaction type');
            }

            con.query(updateAmountSQL, [amount, userId], (err, updateResult) => {
                if (err) {
                    console.error('Error updating user amount:', err);
                    return res.status(500).send('Error updating user amount');
                }

                const successMessage = 'Transaction completed successfully';
                res.render('transaction', { successMessage });
            });
        });
    });
});

function getTransactionHistory(accountNumber, callback) {
    const sql = `SELECT * FROM transaction_history WHERE user_id = (SELECT id FROM users WHERE account_number = ?)`;
    con.query(sql, [accountNumber], (err, rows) => {
        if (err) {
            console.error('Error fetching transaction history:', err);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

  app.get('/welcome/transactions', (req, res) => {
    const accountNumber = req.query.accountNumber;
    getTransactionHistory(accountNumber, (err, transaction_history) => {
      if (err) {
        console.error('Error fetching transaction history:', err);
        return res.status(500).json({ error: 'Error fetching transaction history' });
      }
      res.json({ transactions: transaction_history });
    });
  });
  
  app.get('/balance', (req, res) => {
    const accountNumber = req.query.accountNumber;
    const sql = `SELECT amount FROM users WHERE account_number = ?`;
    
    con.query(sql, [accountNumber], (err, result) => {
        if (err) {
            console.error('Error fetching balance:', err);
            return res.status(500).json({ error: 'Error fetching balance' });
        }
        
        if (result.length > 0) {
            const balance = result[0].amount;
            res.json({ balance });
        } else {
            res.status(404).json({ error: 'User not found or balance unavailable' });
        }
    });
});

app.get('/', (req, res) => {
    res.render("welcome", { accountNumber: req.query.accountNumber, fullname: req.query.fullname });
});


app.listen(port, () => {
    console.log("Listening Port : " + port);
});
