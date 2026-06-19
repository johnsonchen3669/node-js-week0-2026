import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
const todos = [
  {
    id: uuidv4(),
    title: '吃早餐',
  },
];
// ============================================================
//  代辦事項 API 路由表(Todo List API Routes)
//  {{url}}  → API 的基底網址(base URL)
//  {{uuid}} → 指定某一筆代辦事項的唯一識別碼
// ============================================================

// GET    {{url}}/todos              → 取得所有代辦事項
// POST   {{url}}/todos              → 新增代辦事項
// DELETE {{url}}/todos              → 刪除所有代辦事項
// PATCH  {{url}}/todos/{{uuid}}     → 編輯指定代辦事項
// DELETE {{url}}/todos/{{uuid}}     → 刪除指定代辦事項

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

const errorMessage = errorHandler(headers);

const requestListener = (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url == '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      }),
    );
    res.end();
  } else if (req.method === 'POST' && req.url === '/todos') {
    req.on('end', () => {
      let parsedBody = {};
      try {
        parsedBody = body ? JSON.parse(body) : {};
      } catch {
        errorMessage(res, 400, 'JSON 格式錯誤');
        return;
      }
      if (parsedBody?.title) {
        todos.push({
          id: uuidv4(),
          title: parsedBody.title,
        });
      } else {
        errorMessage(res, 400, '請提供 title 欄位');
        return;
      }
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: 'success',
          data: todos,
        }),
      );
      res.end();
    });
  } else if (req.method === 'DELETE' && req.url === '/todos') {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      }),
    );
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    const id = req.url.split('/').at(-1);
    req.on('end', () => {
      let parsedBody = {};
      try {
        parsedBody = body ? JSON.parse(body) : {};
      } catch {
        errorMessage(res, 400, 'JSON 格式錯誤');
        return;
      }
      const idx = todos.findIndex((t) => t.id === id);
      if (parsedBody.title !== undefined && idx !== -1) {
        todos[idx].title = parsedBody.title;
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            data: todos,
          }),
        );
        res.end();
      } else {
        errorMessage(res, 404, '無此 ID 的待辦事項');
      }
    });
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/').at(-1);
    const idx = todos.findIndex((t) => t.id === id);
    if (idx !== -1) {
      todos.splice(idx, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: 'success',
          data: todos,
        }),
      );
      res.end();
    } else {
      errorMessage(res, 404, '無此 ID 的待辦事項');
      return;
    }
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    errorMessage(res);
  }
};

const server = createServer(requestListener);
server.listen(3005);

function errorHandler(headers) {
  return (res, statusCode = 404, message = 'Not Found') => {
    res.writeHead(statusCode, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message,
      }),
    );
    res.end();
  };
}
