## Creation du backend et les apis pour "mon voisin l'epicier"

### exigence
node.js 10.15.3 or higher
npm 6.9.0 or higher

### cloner le projet sur le serveur

```bash 
    git clone https://github.com/helmangoug/mve-back.git
```

### Installation des resources

```bash 
    npm install
```
### configuration du fichier .env

creé un fichier .env en root de l'application

```
#listening port 
PORT=3000
#Database info
DB_HOST="127.0.0.1"
DB_USER="your db user"
DB_PASSWORD="your db password"
DB_NAME="your db name"
DB_PORT="3306" 
DB_DIALECT="mysql"

#SMTP CONFIG
SMTP_HOST="smtp-relay.sendinblue.com"
SMTP_PORT=smtp port
SMTP_SECURE=false
SMTP_USER="smtp user"
SMTP_PASSWORD="smtp password"
SMTP_FROM="'Mon Voisin L'Epicier' <contact@mon-voisin-epicier.fr>"

#Front/back URL Config
BACKEND_URL="http://backdev.mon-voisin-lepicier.fr.local:3000"
FRONTEND_URL="http://frontdev.mon-voisin-lepicier.fr.local:8080"

#Paydone config
PAYDONE_LOGIN="your paydone user"
PAYDONE_PASSWORD="your paydone password"
PAYDONE_PUBLICKEY="YOUR paydone public key"
PAYDONE_APIURL="https://api.paydone.fr/"
PAYDONE_PARTNERID="your paydone partner id"

#Session Config : 
SESSION_SID_SECRET = "a secret"
SESSION_SID_NAME = "a session name"
SESSION_SID = "a session id"

DATABASE_DIALECT="mysql"
COOKIE_EXPIRATION="600000"



```

### lancer le backend

- installer pm2 
- lancer dans le repertoire du projet la commande suivante

```bash
    pm2 start index.js
```
