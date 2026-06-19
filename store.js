import { randomUUID } from 'crypto';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 公開 API;若要帶 cookie 需改明確網域並加 Allow-Credentials
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};
const todos = [{ id: randomUUID(), title: '吃早餐' }];

export { corsHeaders, todos };
