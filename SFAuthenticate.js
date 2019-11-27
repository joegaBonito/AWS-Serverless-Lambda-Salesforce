console.log('Loading function');
var jsforce = require('jsforce');


exports.handler =  (event, context,callback) => {

      var conn = new jsforce.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl : 'https://test.salesforce.com'
      });
      
      conn.login(process.env.username, process.env.password, function(err, userInfo) {
        if (err) { return console.error(err); }
        // Now you can get the access token and instance URL information.
        // Save them to establish connection next time.
        console.log(conn.accessToken);
        console.log(conn.instanceUrl);
      
        // logged in user property
        console.log("User ID: " + userInfo.id);
        console.log("Org ID: " + userInfo.organizationId);
      });
      
      console.log('process.env.instanceUrl ===========> ' + process.env.instanceUrl);
      console.log('process.env.accessToken ===========> ' + process.env.accessToken);
      
      conn = new jsforce.Connection({
        instanceUrl : process.env.instanceUrl, //instance URL
        accessToken : process.env.accessToken //access token
      });
      
      console.log('event ======>' + event);
      console.log('event.body =====>' + event.body);
      console.log('event.data =====>' + event.data);
      // var body = JSON.parse(process.env.requestBody);
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
        // the response object structure depends on the definition of apex class
        callback(null, response);
      });
};
