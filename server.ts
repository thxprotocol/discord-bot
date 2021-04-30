import http from 'http';
import application from './app';

const host = 'localhost';
const port = 8080;

const server = http.createServer(application);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

export default server;
