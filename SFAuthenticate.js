console.log('Loading function');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var jsforce = require('jsforce');
var conn;

exports.handler = (event, context,callback) => {
  /**
   * Promise function that handles login and passes the connection info as a parameter.
   */
  var loginPromise = new Promise(function(resolve,reject) {
            conn = new jsforce.Connection({
              // you can change loginUrl to connect to sandbox or prerelease env.
              loginUrl : process.env.loginUrl
            });
            conn.login(process.env.username, process.env.password, function(err, userInfo) {
              if (err) {
              reject(Error(err));
              } else {
                // Now you can get the access token and instance URL information.
                // Save them to establish connection next time.
                console.log('Access Token: '+conn.accessToken);
                console.log('Refresh Token: '+conn.refreshToken);
                console.log('Instance URL: '+conn.instanceUrl);

                // // logged in user property
                console.log("User ID: " + userInfo.id);
                console.log("Org ID: " + userInfo.organizationId);
                resolve(conn);
              }
            });
    });
  

  /**
   * Waits for the promise to be completed then handles the logic afterwards.
   */
  loginPromise.then(function(promisedConn) {
    console.log('promisedConn Access Token: '+promisedConn.accessToken);
    console.log('promisedConn Refresh Token: '+promisedConn.refreshToken);
    console.log('promisedConn Instance URL: '+promisedConn.instanceUrl);
    conn = new jsforce.Connection({
      oauth2 : {
        clientId : process.env.consumerKey, //'<your Salesforce OAuth2 client ID is here>',
        clientSecret : process.env.consumerSecret, //'<your Salesforce OAuth2 client secret is here>',
        redirectUri : process.env.redirectUri //'<your Salesforce OAuth2 redirect URI is here>'
      },
        instanceUrl : promisedConn.instanceUrl, //'<your Salesforce server URL (e.g. https://na1.salesforce.com) is here>'
        accessToken : promisedConn.accessToken, //'<your Salesforrce OAuth2 access token is here>'
        refreshToken : promisedConn.refreshToken //'<your Salesforce OAuth2 refresh token is here>'
    });

    conn.on("refresh", function(accessToken, res) {
      console.log('On refresh access token: '+accessToken);
      console.log('On refresh: '+res);
      // Refresh event will be fired when renewed access token
      // to store it in your storage for next request
    });


  /**
   * Handles and formats RequestBody.
   */
  console.log('event ======>' + event);
  var body;
  if(typeof event ==  "string") {
    body = JSON.parse(event); //When requestBody is in string format so it needs to be parsed into JSON.
  } else {
    console.log('json format stringified event =====> ' + JSON.stringify(event));
    console.log('json format event =====> ' +JSON.parse(JSON.stringify(event)));
    var eventTemp = JSON.parse(JSON.stringify(event));
    body = eventTemp.body; //When requestBody is in JSON 
  }

  console.log('body ===> ' + body);
  console.log('typeof body ===> ' + typeof body);
  if(typeof body == "string") {
    body = JSON.parse(body);
    console.log('If body is string is called, and the body is pared like ===> ' + body);
  }

  /**
   * Generates the file based on the lambda Request Body and stores it to a S3 bucket.
   */
  var bucketName = process.env.bucketName;
  var keyName = 'LambdaLogs/' + 'RequestBody_' + new Date().toString() + '.txt';
  console.log('keyName:  ' + keyName);
  var content = 'RequestBody ===> ' + JSON.stringify(body);
  console.log('content:  ' + content);

  var params = { Bucket: bucketName, Key: keyName, Body: content };
    
  s3.putObject(params, function (err, data) {
    if (err)
        console.log(err)
    else
        console.log("Successfully saved object to " + bucketName + "/" + keyName);
  });

  conn.apex.post(process.env.endpoint, body, function(err, res) {
    if (err) {  
      callback(err);
    }
    console.log("response: ", res);
    const response = {
      "isBase64Encoded": false,
      "statusCode": 200,
      "headers": {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true,
        "Access-Control-Allow-Methods": "PUT,DELETE,POST,GET,Head,OPTIONS",
        "Access-Control-Allow-Headers":"*"
      },
      "body": JSON.stringify(res)
    };

    /**
     * Generates the file based on the lambda response and stores it to a S3 bucket.
     */
    var bucketName = process.env.bucketName;
    var keyName = 'LambdaLogs/' + 'Response_' + new Date().toString() + '.txt';
    console.log('keyName:  ' + keyName);
    var content = 'Response ===> ' + JSON.stringify(res);
    console.log('content:  ' + content);

    var params = { Bucket: bucketName, Key: keyName, Body: content };
        
    s3.putObject(params, function (err, data) {
        if (err)
            console.log(err)
        else
            console.log("Successfully saved object to " + bucketName + "/" + keyName);
    });

    callback(null,response);
  });
  }).catch(function(e) {
    callback(e);
  });
};
