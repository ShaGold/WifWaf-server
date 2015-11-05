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
  photo VARCHAR(200),
  flag INT
);

CREATE TABLE Dog(
  idDog INT primary key autoincrement,
  dogName VARCHAR(200) not null,
  age INT,
  breed VARCHAR(200),
  size INT, --deux digit
  getAlongWithMales VARCHAR(200),
  getAlongWithFemales VARCHAR(200),
  getAlongWithKids VARCHAR(200),
  obedient INT,
  description text,
  sociable INT -- deux digit
);

CREATE TABLE DogBehaviour(
  idDogBehaviour INT primary key autoincrement,
  idDog INT,
  idBehaviour INT
);

CREATE TABLE Behaviour(
  idBehaviour INT primary key autoincrement,
  description VARCHAR(200)
);

CREATE TABLE PhotoDog(
  idPhotoDog INT primary key autoincrement,
  idDog INT,
  idPhoto INT
);

CREATE TABLE Photo(
  idPhoto INT,
  photo VARCHAR(250)
);
