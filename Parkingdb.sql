CREATE TABLE Admin(
    admin_id INT PRIMARY KEY,
    password VARCHAR(15)
);

CREATE TABLE Registration(
    reg_id INT,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone_no BIGINT NOT NULL,
    entry_type VARCHAR(15) NOT NULL,
    vehicle_no VARCHAR(15),
    PRIMARY KEY(reg_id,vehicle_no),
    CHECK(entry_type IN ('Student', 'Staff', 'Guest'))
);

CREATE TABLE Token(
    token INT PRIMARY KEY,
    parking_slot VARCHAR(5) NOT NULL,
    reg_id int,
    vehicle_no VARCHAR(15),
    entry_time TIME,
    FOREIGN KEY (reg_id,vehicle_no) REFERENCES Registration(reg_id,vehicle_no)
);

INSERT INTO Admin VALUES(111,'admin');

INSERT INTO Registration VALUES(9000,'John', 'Doe', 'john.doe@gmail.com', 9998882221, 'Staff', 'KA19 EQ 1316');
INSERT INTO Registration VALUES(1004, 'Emily', 'Chen', 'emily_chen@gmail.com', 8888222244, 'Student', 'KA19 P 8488');
INSERT INTO Registration VALUES(1007, 'Mark', 'P', 'mark.p@gmail.com', 7788221144, 'Student', 'KA09 G 8888');

INSERT INTO Token VALUES(1,'AB1', NULL, NULL, NULL);
INSERT INTO Token VALUES(2,'AB2', NULL, NULL, NULL);
INSERT INTO Token VALUES(3,'AB3', 9000, 'KA19 EQ 1316', '13:26:20');
INSERT INTO Token VALUES(4,'AB4', NULL, NULL, NULL);
INSERT INTO Token VALUES(5,'AB5', 1007, 'KA09 G 8888', '09:11:48');
INSERT INTO Token VALUES(6,'AB6', NULL, NULL, NULL);
