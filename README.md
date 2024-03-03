# DBMS-ParkingSystem
An advanced parking system for MIT Bengaluru using MySQL, Node.js and CSS

![alt text](app/images/index.png)
![alt text](app/images/token.png)
![alt text](app/images/reg.png)

Starting Digit of Registration number:
1. Staff - 9xxx
2. Student - 1xxx
3. Guest - 0

The token and slot fields in token.html are containers and NOT text fields.\
Make appropriate changes to display the text.


index.js opens index.html and connects to the db.\
It takes in the user id and pwd and cross-checks with db.\
Once successful, it displays "login successful".\
Replcae it with appropriate code to open the token.html.