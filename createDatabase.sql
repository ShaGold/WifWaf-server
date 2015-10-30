DROP DATABASE WifWaf;
CREATE DATABASE WifWaf;

USE WifWaf;

-- Création des tables
CREATE TABLE User(
  idUser INT primary key autoincrement,
  email VARCHAR(200) not null,
  nickname VARCHAR(200) not null,
  password VARCHAR(200) not null,
  birthday DATE not null,
  phoneNumber INT,
  description text,
  photo VARCHAR(200)
);
