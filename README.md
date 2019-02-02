# lambda_twitter_token

AWS LambdaからTwitterのAPIをOauthでなんやかんやするなんやかんやです。

## Build

config.sample.jsファイルをコピーして編集する。

```
copy src/config.sample.js src/config.js
```

中のURLとトークン文字列を自分のものに置き換える。

準備ができたらビルドする。

```
npm run build
```

これでlambda.zipファイルができます。

あとはAWS Lamdaにzipファイル投げれば終わりです。
API Gatewayとかもプロキシ統合で適当に設定すると動く。
API Gateway側でもCORS設定は忘れずに。

## Usage

POST https://aws.yourgatewayapi.com/yourendpoint

### Params

| Key    | Type    | Optional | Desc.                                |
|--------|---------|:--------:|--------------------------------------|
| url    | string  |          | TwitterのエンドポイントURL             |
| method | string  |          | POST                                 |
| data   | object  | x        | 送信データ。oauth_callbackとか入れる。  |
| token  | object  | x        | {key: 'xxx', secret: 'xxx'}の形式    |

### Sample Request Body

request_token

```
{
  "url": "https://api.twitter.com/oauth/request_token",
  "method": "POST",
  "data": {
    "oauth_callback": "http://example.com/"
  }
}
```

access_token

```
{
  "url": "https://api.twitter.com/oauth/access_token",
  "method": "POST",
  "data": {
    "oauth_token": "xxxxxx",
    "oauth_verifier": "xxxxxx" 
  },
  "token": {
    "key": "xxxxxx"
  }
}
```

invalidate_token

```
{
  "url": "https://api.twitter.com/1.1/oauth/invalidate_token?access_token=xxxxx&access_token_secret=xxxx",
  "method": "POST",
  "token": {
    "key": "xxxxxx",
    "secret": "xxxx"
  }
}
```

### Sample Response

```
{"response": "oauth_token=xxxx&oauth_token_secret=xxxxx"}
```

## License

MIT License. 詳しくは [LICENSE.md](./LICENSE.md) を参照。