'use strict';

const bhttp = require('bhttp');

const lwa = module.exports;
lwa.error = {};
const OAUTH_URL = 'https://api.amazon.com/auth/o2/token';

lwa.error.LoginWithAmazonError = class LoginWithAmazonError extends Error {
  constructor(name, message) {
    super();
    this.name = name;
    this.message = message;
  }
};

lwa.getAccessTokens = function getAccessTokens(code, client_id, client_secret,
  redirect_uri) {
  const url = 'https://api.amazon.com/auth/o2/token';
  const params = {
    grant_type: 'authorization_code',
    code,
    client_id,
    client_secret,
    redirect_uri,
  };
  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return bhttp.post(url, params, options).then((response) => {
    const body = response.body;
    if (body.error) {
      throw new lwa.error.LoginWithAmazonError(body.error,
                                                body.error_description);
    }
    return body;
  });
};

lwa.getAuthorizationCode = function getAuthorizationCode( code, client_id,
  client_secret, redirect_uri) {
  const params = {
    response_type: 'response_code',
    code,
    client_id,
    client_secret,
    redirect_uri,
  };
  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  return bhttp.post(OAUTH_URL, params, options).then(response => {
    const body = response.body;
    if (body.error) {
      throw new lwa.error.LoginWithAmazonError(body.error,
                                                body.error_description);
    }
    return body;
  });
};

 /**
  * @param string $accessToken Required
  * @return object json body response
  */
lwa.getProfile = function getProfile(access_token) {
  const url = 'https://api.amazon.com/user/profile?access_token=' +
                `${encodeURIComponent(access_token)}`;
  return bhttp.get(url).then((response) => {
    const body = response.body;
    if (body.error) {
      throw new lwa.error.LoginWithAmazonError(body.error,
                                                body.error_description);
    }
    return body;
  });
};

 /**
  * @param string $refreshToken Required
  * @return string new token
  */
lwa.refreshAccessToken = function refreshAccessToken(refresh_token, client_id,
  client_secret) {
  const params = {
    grant_type: 'refresh_token',
    refresh_token,
    client_id,
    client_secret,
  };
  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return bhttp.post(OAUTH_URL, params, options).then((response) => {
    const body = response.body;
    if (body.error) {
      throw new lwa.error.LoginWithAmazonError(body.error,
                                                body.error_description);
    }
    return body;
  });
};
