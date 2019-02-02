const crypto = require('crypto');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const { config } = require('./config');

exports.getToken = async function(event, context, callback) {
  // OAuthヘッダ作成用のデータ準備
  const oauth = OAuth({
    consumer: { key: config.consumerKey, secret: config.consumerSecret},
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
  });

  // POSTデータを受け取る
  const body = {};
  const responseHeaders = {
    "Access-Control-Allow-Origin": config.allowOrigin,
    "Access-Control-Allow-Headers": 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    "Access-Control-Allow-Methods": 'POST,GET,OPTIONS'
  };

  try {
    Object.assign(body, JSON.parse(event.body));
  } catch(e) {
    callback(null, {
      statusCode: 400,
      headers: responseHeaders,
      body: ''
    });

    return;
  }

  // 一部URL以外はエラー
  const validUrls = [
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    'https://api.twitter.com/1.1/oauth/invalidate_token'
  ];

  if(validUrls.every((vUrl) => !body.url.startsWith(vUrl))) {
    callback(null, {
      statusCode: 400,
      headers: responseHeaders,
      body: ''
    });

    return;
  }

  // リクエストデータを作って投げつける
  try {
    const requestData = {
      url: body.url,
      method: body.method,
      data: body.data || {}
    };

    const authData = body.token ? oauth.authorize(requestData, body.token) : oauth.authorize(requestData);
    requestData.headers = oauth.toHeader(authData);

    // リクエスト投げる
    // 2xx以外のコードならエラー
    const tokenResponse = await axios(requestData).catch((e) => {
      throw ({ status: e.response.status });
    });

    // 正常レスポンス
    const response = {
      statusCode: 200,
      headers: responseHeaders,
      body: `{"response": "${tokenResponse.data}"}`
    };

    return callback(null, response);
  } catch(e) {
    // ステータスコード2xx以外の時はエラー
    callback(null, {
      statusCode: e && e.status ? e.status : 500,
      headers: responseHeaders,
      body: ''
    });

    return;
  }
};