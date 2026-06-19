import {
  getTodos,
  postTodos,
  patchTodos,
  deleteTodo,
  deleteTodos,
} from './controller.js';

/**
 * 路由匹配函式，根據請求方法和 URL 路徑找到對應的處理函式
 * @returns 
 */
export default function matchRoute(req) {
  const routes = [
    { method: 'GET', regex: /^\/todos$/, handler: getTodos },
    { method: 'POST', regex: /^\/todos$/, handler: postTodos },
    { method: 'PATCH', regex: /^\/todos\/([^/]+)$/, handler: patchTodos },
    { method: 'DELETE', regex: /^\/todos$/, handler: deleteTodos },
    { method: 'DELETE', regex: /^\/todos\/([^/]+)$/, handler: deleteTodo },
  ];

  return routes.find(
    (route) => route.method === req.method && route.regex.test(req.url),
  );
}
