module.exports.dog = Dog;

function Dog(idDog, dogName, idUser, age, breed, size, getAlongWithMales, getAlongWithFemales, getAlongWithKids, getAlongWithHumans, description, gender, photo) {
    this.idDog = idDog;
    this.dogName = dogName;
    this.idUser = idUser;
    this.age = age;
    this.breed = breed;
    this.size = size;
    this.getAlongWithMales = getAlongWithMales;
    this.getAlongWithFemales = getAlongWithFemales;
    this.getAlongWithKids = getAlongWithKids;
    this.getAlongWithHumans = getAlongWithHumans;
    this.description = description;
    this.gender = gender;
    this.photo = photo;
}
