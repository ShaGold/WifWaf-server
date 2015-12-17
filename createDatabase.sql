DROP DATABASE WifWaf;
CREATE DATABASE WifWaf;

USE WifWaf;

-- Création des tables
CREATE TABLE User(
    idUser INT auto_increment primary key,
    email VARCHAR(255) not null,
    nickname VARCHAR(255) not null,
    password VARCHAR(255) not null,
    birthday DATE not null,
    phoneNumber INT,
    description text,
    photo VARCHAR(255),
    flag INT
);

CREATE TABLE Dog(
    idDog INT auto_increment primary key,
    idUser INT not null,
    dogName VARCHAR(255) not null,
    age INT(2),
    breed VARCHAR(255),
    size INT(2),
    getAlongWithMales VARCHAR(255),
    getAlongWithFemales VARCHAR(255),
    getAlongWithKids VARCHAR(255),
    getAlongWithHumans VARCHAR(255),
    description text
);

CREATE TABLE DogBehaviour(
    idDogBehaviour INT auto_increment primary key,
    idDog INT,
    idBehaviour INT
);

CREATE TABLE Behaviour(
    idBehaviour INT auto_increment primary key,
    description VARCHAR(200)
);

CREATE TABLE Walk(
    idWalk INT auto_increment primary key,
    city VARCHAR(255),
    idDog INT,
    idUser INT,
    walkName VARCHAR(255),
    description text,
    departure timestamp
);

CREATE TABLE Location(
    idLocation INT auto_increment primary key,
    idWalk INT,
    lattitude VARCHAR(255),
    longitude VARCHAR(255),
    ordering INT
);

CREATE TABLE DogsWalk(
    idDogsWalk INT auto_increment primary key,
    idWalk INT,
    idDog INT
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
