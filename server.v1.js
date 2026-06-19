import { createServer } from 'http';
import { nanoid } from 'nanoid';

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
  'Content-Type': 'application/json',
};
const todos = [
  {
    id: nanoid(),
    title: '吃飯',
  },
];
const requestListener = (req, res) => {
  console.log(`[${req.method}] ${req.url}`);
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      }),
    );
    res.end();
  } else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      console.log(`body: ${body || '(empty)'}`);

      let parsedBody = {};
      try {
        parsedBody = body ? JSON.parse(body) : {};
      } catch {
        res.writeHead(400, headers);
        res.end(
          JSON.stringify({
            status: 'false',
            message: 'JSON 格式錯誤',
          }),
        );
        return;
      }

      if (parsedBody.title) {
        todos.push({
          id: nanoid(),
          title: parsedBody.title,
        });
      }

      res.writeHead(200, headers);
      res.end(
        JSON.stringify({
          status: 'success',
          data: todos,
        }),
      );
    });
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    todos.length = 0;
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        status: 'success',
        data: todos,
      }),
    );
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      res.writeHead(200, headers);
      res.end(
        JSON.stringify({
          status: 'success',
          data: todos.filter((todo) => todo.id !== id),
        }),
      );
    } else {
      res.writeHead(404, headers);
      res.end(
        JSON.stringify({
          status: 'false',
          message: '無此 ID 的待辦事項',
        }),
      );
    }
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      console.log(`body: ${body || '(empty)'}`);

      let parsedBody = {};
      try {
        parsedBody = body ? JSON.parse(body) : {};
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.writeHead(400, headers);
        res.end(
          JSON.stringify({
            status: 'false',
            message: 'JSON 格式錯誤',
          }),
        );
        return;
      }

      const id = req.url.split('/').pop();
      const index = todos.findIndex((todo) => todo.id === id);
      if (parsedBody.title !== undefined && index !== -1) {
        todos[index].title = parsedBody.title;
        res.writeHead(200, headers);
        res.end(
          JSON.stringify({
            status: 'success',
            data: todos,
          }),
        );
      } else {
        res.writeHead(404, headers);
        res.end(
          JSON.stringify({
            status: 'false',
            message: '無此 ID 的待辦事項',
          }),
        );
      }
    });
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '無此網站路由',
      }),
    );
    res.end();
  }
};
const server = http.createServer(requestListener);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
