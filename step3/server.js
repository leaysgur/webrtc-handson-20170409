const ws = require('ws');
const port = process.argv[2] || 3001;

const wsServer = new ws.Server({ port: port });

wsServer.on('connection', ws => {
    console.log('-- websocket connected --');

    ws.on('message', message => {
      wsServer.clients.forEach(client => {
        if (ws === client) {
          console.log('- skip sender -');
          return;
        }
        client.send(message);
      });
    });
});

console.log('websocket server start. port=' + port);
