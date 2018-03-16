# login-with-amazon

A server-side, promise based Node module to facilitate the use of the [Authorization Code Grant](https://developer.amazon.com/public/apis/engage/login-with-amazon/docs/authorization_code_grant.html) process using Login with Amazon. This is a supplment to the Amazon SDK for JavaScript as it does not support exchanging the authorization code for access tokens. Per their own documentation:

> The Login with Amazon SDK for JavaScript does not contain a function for exchanging authorization codes for access tokens. This is because that exchange requires the client secret, which should not be stored in a script. As a result, your web server will need to make the exchange instead. If you use amazon.Login.authorize to request an authorization code, you should pass the authorization code to your server, or use a redirect_uri that will be handled by server-side code.

**DO NOT HARD CODE YOUR CLIENT SECRET. DO NOT STORE YOUR CLIENT SECRET IN GIT/GITHUB/GITLAB/ETC**

Please remember to properly track your web client's session state and [prevent CSRF attacks](https://developer.amazon.com/public/apis/engage/login-with-amazon/docs/cross_site_request_forgery.html).

## Typical usage

Require the library

Get the Authorization code

Use the Authorization code to get the Acces tokens

Use the Access tokens to get the Amazon profile (successful response confirms validity of token)

Refresh the Access token as needed (they expire every 5 minutes)
