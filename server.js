import { createServer } from 'http';
import { errorMessage } from './messageHandler.js';
import matchRoute from './router.js';
import { corsHeaders } from './store.js';

const PORT = process.env.PORT ?? 3005;

const requestListener = (req, res) => {
  const { method, url } = req;
  console.log(`[${method}] ${url}`);

  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const match = matchRoute(req);

  if (!match) {
    errorMessage(res, 404, 'Route not found');
    return;
  }

  match.handler(req, res);
};

const server = createServer(requestListener);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
