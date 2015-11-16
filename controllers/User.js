module.exports.user = User;

function User(email, nickname, password, birthday, phoneNumber, description, photo) {
    this.email = email;
    this.nickname = nickname;
    this.password = password;
    this.birthday = birthday;
    this.phoneNumber = phoneNumber;
    this.description = description;
    this.photo = photo;
}
