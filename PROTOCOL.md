# Client > Serveur
### Utilisateur
**TrySignUp**(args): args = JsonObject contenant un Utilisateur
Exemple :
```
[
    {"email":"test@testing.fr", "nickname": "Gold", "password":"kje564", "birthday":"10/12/1778", "phoneNumber":"0487291837", "description": "je suis gentil", "photo":"photo.jpg"},
    {"email":"deuxiemetest@testing.fr", "nickname": "Cassoulet", "password":"chourcroute", "birthday":"18/04/1120", "phoneNumber":"1485963720", "description": "je suis pas gentil", "photo":"photodeux.jpg"}
]
```

# Client < Serveur
### Utilisateur
**RTrySignUp**(arg): arg = int permettant de savoir comment s'est déroulée l'inscription
