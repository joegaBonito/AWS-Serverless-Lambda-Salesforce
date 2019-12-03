# AWS-Serverless-Lambda-Salesforce
## Basic AWS Serverless Lambda and Salesforce Authentication Project

Need to fill out these information in the Lambda's environment variables:

process.env.username (Salesforce username)

process.env.password (Salesforce password+security token)

process.env.loginUrl (STG: https://test.salesforce.com | PROD: https://login.salesforce.com)

process.env.endpoint (apexrest endpoint)

process.env.requestBody (JSON object passed in as a body) *Not Required

process.env.consumerKey (Connected App's consumer key)

process.env.consumerSecret (Connected App's consumer secret)

process.env.redirectUri (API Gateway URL with page path followed after stage name)

process.env.bucketName (Destination bucket to store LambdaLogs)

process.env.folderPath (Folder path to store LambdaLogs)

## In Salesforce Connected Apps

Selected OAuth Scopes: 

    Access your basic information (id, profile, email, address, phone)

    Access and manage your data (api)

    Provide access to your data via the Web (web)

    Perform requests on your behalf at any time (refresh_token, offline_access)

Callback URL: Should match process.env.redirectUri 

## Steps to upload the function with nodejs:

Install dependencies to the function project folder

Note: Most Node.js modules are platform-independent, but some modules are compiled against specific operating system environments. Lambda runs under a Linux environment. When installing modules with npm, we recommend building the .zip file in a Linux environment to be sure that the correct platform dependencies are included.

1.    In the command line interface (CLI), change directories to your project folder. For example:

cd /project-folder-name

Note: Replace project-folder-name with the actual name of your project folder.

2.    Install your dependencies locally to your function project folder using the command npm install package-name, replacing package-name with the actual package name. For example, to install the AWS SDK for JavaScript modules to the root of your project folder, run this command:

npm install jsforce

Run the command for each module required for your Lambda function.

Note: There's a 250-MB limit on your function size for unzipped files. Only include the libraries you need for your function to work.

## Build the deployment package

### Windows

1.    In File Explorer, open your project folder.

2.    Select all of the project files, then right-click to open the context menu.

3.    Choose Send to, then choose Compressed (zipped) folder.

4.    Enter a name for the .zip file.

### Linux / MacOS

In the CLI, run this command:

zip -r ../function-name.zip .

Note: Replace function-name with the file name you want to give your deployment package.

This puts all files in the project folder into a .zip file located in the parent folder.

Verify the deployment package

1.    In the CLI, run this command:

zipinfo ../function-name.zip

Note: Replace function-name with the actual file name of your deployment package.

You can also run unzip -l on the .zip file to list its contents, though the output won't be as detailed.

2.    Check the output to verify that the function handler source file is located in the root of the .zip file.

3.    Check the output to verify that your files have global read permissions. For more information, including how to fix permissions if needed, see Permissions Policies on Lambda Deployment Packages.

## Upload and verify the deployment package

1.    In the Lambda console, choose your function.

2.    Under Function code, for Code entry type, choose Upload a .zip file.

3.    Under Function package, choose Upload.

4.    Choose the .zip file you created, and then choose Open.

5.    At the top of the console, choose Save.

Tip: You can also run update-function-code from the AWS Command Line Interface (AWS CLI) to upload your .zip file.

6.    After uploading is finished, choose Test.

Tip: You can also use 7-Zip from the AWS CLI to verify your deployment package's file permissions. Download it from the 7-Zip website. For more information, see Permissions Policies on Lambda Deployment Packages.

## On the client side

Make sure not to use $.ajax for making RESTful calls due to CORS issue. Use below format instead:

    var xhr = new XMLHttpRequest();

    xhr.open("POST", Your API Gateway POST endpoint URL, true);

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");

    xhr.send(JSON.stringify(body)); //Must be stringified.

## For the Lambda Proxy Integration with API Gateway

Must have the response format exactly as below:

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
