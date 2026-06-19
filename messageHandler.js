import { corsHeaders as headers } from './store.js';

/**
 * 傳送回應給客戶端
 */
function send(res, statusCode, data) {
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}

/**
 * 傳送成功訊息給客戶端
 */
function successMessage(res, data) {
  send(res, 200, { status: 'success', data });
}

/**
 * 傳送錯誤訊息給客戶端
 */
function errorMessage(res, statusCode, message) {
  send(res, statusCode, { status: 'false', message });
}

export { successMessage, errorMessage };
