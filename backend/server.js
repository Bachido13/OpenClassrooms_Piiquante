//plugin http 
const http = require('http');
//import de l'app.js
const app = require('./app');

//fonction de normalisation du port :
const normalizePort = val => {
  const port = parseInt(val, 10);

  //si pas un nombre retourner la valeur :
  if (isNaN(port)) {
    return val;
  }
  //si nombre retourner port :
  if (port >= 0) {
    return port;
  }
  //Sinon retourner false.
  return false;
};

//variable port déclarer via la fonction normalizePort 
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

//fonction pour gérer les erreurs :
const errorHandler = error => {
  //Si l'appel du système pour écouter à échoué :
  if (error.syscall !== 'listen') {
    throw error;
  }


  const address = server.address();
  //Bind = type de l'adresse selon si chaine de caractère ou non
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  //Selon le code d'erreur :
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

//création du serveur :
const server = http.createServer(app);

//Evenement erreur :
server.on('error', errorHandler);
//Evenement Ecoute :
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);