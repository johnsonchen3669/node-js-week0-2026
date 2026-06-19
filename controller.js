import { errorMessage, successMessage } from './messageHandler.js';
import { todos } from './store.js';
import { randomUUID } from 'crypto';
import { parseBody } from './utils.js';

/**
 * 取得所有待辦事項
 */
function getTodos(req, res) {
  try {
    successMessage(res, todos);
  } catch (error) {
    errorMessage(res, 500, 'Internal Server Error');
  }
}

/**
 * 新增待辦事項
 * @returns
 */
async function postTodos(req, res) {
  try {
    const parsedBody = await parseBody(req);
    if (!parsedBody?.title) {
      errorMessage(res, 400, '請提供 title 欄位');
      return;
    }
    todos.push({ id: randomUUID(), title: parsedBody.title });
    successMessage(res, todos);
  } catch (error) {
    errorMessage(res, 500, '請輸入正確的 JSON 格式');
  }
}

/**
 * 編輯指定待辦事項
 * @returns
 */
async function patchTodos(req, res) {
  try {
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
  } catch (error) {
    errorMessage(res, 500, '請輸入正確的 JSON 格式');
  }
}

/**
 * 刪除所有待辦事項
 * @returns
 */
function deleteTodos(req, res) {
  try {
    todos.length = 0;
    successMessage(res, todos);
  } catch (error) {
    errorMessage(res, 500, 'Internal Server Error');
  }
}

/**
 * 刪除指定待辦事項
 * @returns
 */
function deleteTodo(req, res) {
  try {
    const id = req.url.split('/').at(-1);
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1) {
      errorMessage(res, 404, 'Todo not found');
      return;
    }
    todos.splice(todoIndex, 1);
    successMessage(res, todos);
  } catch (error) {
    errorMessage(res, 500, 'Internal Server Error');
  }
}

export { getTodos, postTodos, patchTodos, deleteTodos, deleteTodo };
