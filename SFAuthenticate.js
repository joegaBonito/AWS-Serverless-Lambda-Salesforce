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

      // var body = JSON.parse(process.env.requestBody);
      var body = event.body; //body taken in by a Request Body.

      var item = {};
      
      conn.apex.post(process.env.endpoint, body, function(err, res) {
        if (err) {  
          callback(err, null); 
          return console.log('errr' + err); 
        }
        console.log("response: ", res);
        // the response object structure depends on the definition of apex class
        callback(null, res);
      });
};
