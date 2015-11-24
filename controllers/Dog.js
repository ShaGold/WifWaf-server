module.exports.user = Dog;

function Dog(dogName, idUser, age, breed, size, getAlongWithMales, getAlongWithFemales, getAlongWithKids, getAlongWithHumans, description) {
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
}
