module.exports.walk = Walk;

function Walk(id, idDog, idUser, wN, description, city, dep) {
    this.idWalk = id;
    this.idDog = idDog;
    this.idUser = idUser;
    this.walkName = wN;
    this.description = description;
    this.city = city;
    this.departure = dep;
}
