import { createServer } from 'http';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT ?? 3005;

// 初始資料，伺服器重啟後會重置（儲存在記憶體，非資料庫）
const todos = [{ id: randomUUID(), title: '吃早餐' }];

// 每個 HTTP 回應都需要帶這些 header，讓瀏覽器允許跨域存取
const CORS_HEADERS = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

// messageHandler 是 function 宣告會被 hoisting，可在定義前呼叫
const { successMessage, errorMessage } = messageHandler(CORS_HEADERS);

// ── Controller ───────────────────────────────────────────────────────────────
// 所有對 todos 的操作邏輯集中在這裡
function controller() {
  // GET /todos → 取得所有代辦事項
  function getTodos(req, res) {
    try {
      successMessage(res, todos);
    } catch (error) {
      errorMessage(res, 500, 'Internal Server Error');
    }
  }

  // POST /todos → 新增代辦事項
  async function postTodos(req, res) {
    const parsedBody = await parseBody(req);
    if (!parsedBody?.title) {
      errorMessage(res, 400, '請提供 title 欄位');
      return;
    }
    todos.push({ id: randomUUID(), title: parsedBody.title });
    successMessage(res, todos);
  }

  // PATCH /todos/:id → 編輯指定代辦事項
  async function patchTodos(req, res) {
    // url 格式為 /todos/:id，取最後一段即為 id
    const id = req.url.split('/').at(-1);
    const parsedBody = await parseBody(req);
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      errorMessage(res, 404, 'Todo not found');
      return;
    }
    if (!parsedBody?.title) {
      errorMessage(res, 400, '請提供 title 欄位');
      return;
    }
    todos[todoIndex].title = parsedBody.title;
    successMessage(res, todos);
  }

  // DELETE /todos → 刪除所有代辦事項
  function deleteTodos(req, res) {
    // todos.length = 0 清空陣列並保留原始參考，比重新賦值更安全
    todos.length = 0;
    successMessage(res, todos);
  }

  // DELETE /todos/:id → 刪除指定代辦事項
  function deleteTodo(req, res) {
    const id = req.url.split('/').at(-1);
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      errorMessage(res, 404, 'Todo not found');
      return;
    }
    todos.splice(todoIndex, 1);
    successMessage(res, todos);
  }

  return { getTodos, postTodos, patchTodos, deleteTodos, deleteTodo };
}

// ── Message Handler ──────────────────────────────────────────────────────────
// 統一回應格式，避免每個 handler 各自呼叫 writeHead / end
function messageHandler(headers) {
  // 底層發送，所有回應都經過這裡
  function send(res, statusCode, data) {
    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(data));
  }

  function successMessage(res, data) {
    send(res, 200, { status: 'success', data });
  }

  function errorMessage(res, statusCode, message) {
    send(res, statusCode, { status: 'false', message });
  }

  return { successMessage, errorMessage };
}

// ── Router ───────────────────────────────────────────────────────────────────
// 用正則比對 method + url，回傳符合的路由物件（含 handler）
// 正則說明：
//   /^\/todos$/          → 完全符合 /todos（^ 開頭、$ 結尾，不允許多餘字元）
//   /^\/todos\/([^/]+)$/ → 符合 /todos/:id，([^/]+) 抓取 / 以外的所有字元（即 id）
function matchRoute(req) {
  const { getTodos, postTodos, patchTodos, deleteTodos, deleteTodo } = controller();
  const routes = [
    { method: 'GET',    regex: /^\/todos$/,          handler: getTodos },
    { method: 'POST',   regex: /^\/todos$/,          handler: postTodos },
    { method: 'PATCH',  regex: /^\/todos\/([^/]+)$/, handler: patchTodos },
    { method: 'DELETE', regex: /^\/todos$/,          handler: deleteTodos },
    { method: 'DELETE', regex: /^\/todos\/([^/]+)$/, handler: deleteTodo },
  ];

  return routes.find(
    (route) => route.method === req.method && route.regex.test(req.url),
  );
}

// ── Request Listener ─────────────────────────────────────────────────────────
// Node.js http.createServer 的核心回調，每個進來的請求都會經過這裡
const requestListener = (req, res) => {
  const { method, url } = req;
  console.log(`[${method}] ${url}`);

  // 瀏覽器跨域請求前會先發 OPTIONS preflight，需回 204 讓後續請求能通過
  if (method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const match = matchRoute(req);
  if (!match) {
    errorMessage(res, 404, 'Not Found');
    return;
  }

  // 將 req、res 傳給對應的 handler 處理
  match.handler(req, res);
};

// ── Utilities ────────────────────────────────────────────────────────────────
// 將 request 的 body 串流收集完畢後解析成物件
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    // data 事件會分批觸發（大 body 會切成多個 chunk）
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        // raw 為空（如 GET/DELETE）或非合法 JSON 時，回傳空物件交由 controller 驗證
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = createServer(requestListener);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
