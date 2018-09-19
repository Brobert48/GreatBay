
DROP DATABASE IF EXISTS greatbay_db;
CREATE DATABASE greatbay_db;
USE greatbay_db;

CREATE TABLE products (
    id INTEGER NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    category VARCHAR(30),
    h_bid integer,
    PRIMARY KEY (id)
);