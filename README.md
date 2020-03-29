
![alt text](https://github.com/Jahn08/WEB-TIMER/blob/master/WebTimer/resources/images/favicon-navbar.ico)

# WEB-TIMER

A web application to set a timer or stopwatch along with some customisation provided. The main features are:

* Timer and stopwatch available without registration
* Customised timers for registered users
* OAuth authentication and registration by Facebook
* Administration module to gather the users' statistics
* MongoDB as a default DB model provider ([more about database](#headDatabase))

## Installing / Getting started

The application is dependent on Node.js ([more about its version](#headPrerequisites)) along with MongoDB ([more about its version](#headSettingUpDev)).

There is a couple of ways to start the application from inside the WebTimer directory (there must be a file package.json):
1. *npm start*
2. *npm run release* - starts the application after getting through testing

To turn on debugging while testing there is a script available in package.json: *npm run debug-test*. After running the command it's possible to join the process in Google Chrome through the url: *chrome://inspect*. A directive *debugger* should be used for break points in tests.

The first user registered in the application will be granted the role of an administrator.

## Developing

### Built with

* [express 4.16.3](https://www.npmjs.com/package/express/v/4.16.3)
* [Vue 2.5.16](https://www.npmjs.com/package/vue/v/2.5.16)
* [vue-router 3.0.1](https://www.npmjs.com/package/vue-router/v/3.0.1)
* [Bootstrap 4.3.1](https://www.npmjs.com/package/bootstrap/v/4.3.1)
* [jQuery 3.4.1](https://www.npmjs.com/package/jquery/v/3.4.1)
* [Mongoose 5.7.5](https://www.npmjs.com/package/mongoose/v/5.7.5)
* [Passport 0.4.0](https://www.npmjs.com/package/passport/v/0.4.0)
* [passport-facebook-token 3.3.0](https://www.npmjs.com/package/passport-facebook-token/v/3.3.0)
* [body-parser 1.18.2](https://www.npmjs.com/package/body-parser/v/1.18.2)
* [Multiple Select 1.2.1](https://www.npmjs.com/package/multiple-select/v/1.2.1)
* [Nodemailer 4.6.7](https://www.npmjs.com/package/nodemailer/v/4.6.7)
* [escape-html 1.0.3](https://www.npmjs.com/package/escape-html/v/1.0.3)
* [helmet 3.21.3](https://www.npmjs.com/package/helmet/v/3.21.3)

Icons made by [Smashicons](https://www.flaticon.com/authors/smashicons) from [www.flaticon.com](https://www.flaticon.com/) are licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)

### <a name="headPrerequisites"></a>Prerequisites

* [Node.js 8.9.4](https://nodejs.org/download/release/v8.9.4/)
* [MongoDB 3.6.2](https://www.mongodb.org/dl/win32/x86_64-2008plus-ssl?_ga=2.113660480.637015255.1538331504-1402874581.1537118071)
* The project was developed in MS Visual Studio 2017 Community ([the product page](https://visualstudio.microsoft.com/vs/community/))

### <a name="headSettingUpDev"></a>Setting up Dev

Developing the application in VS 2017 Community requires turning on the Node.js development component while installing. Additionally, [Node JS Tools](https://github.com/Microsoft/nodejstools/) is a requirement.

The developer computer has to have an access to a MongoDB server installed to deploy the database ([more about database](#headDatabase)).

### Deploying / Publishing

The stages to deploy the application in a docker container by command prompt:
1. Run a command in the root folder of the project where the Dockerfile file is available (including the dot at the end): *docker build -t webtimer .*
2. Before the usage of the docker stack deploy command a swarm has to be initialised: *docker swarm init*
3. Since the application relies on secret values they have to be entered the next way: *echo SECRET_VALUE|docker secret create SECRET_NAME -*
The list of all the possible secrets can be found in the docker-compose.yml file (more about them in the [configuration section below](#headConfiguration)).
4. In the same directory where the docker-compose.yml file lies run a command: *docker stack deploy -c docker-compose.yml webtimer*

## <a name="headConfiguration"></a>Configuration

All preferences are set in config.js inside the WebTimer directory. Each option supplemented with a secret parameter can also be determined through an environment variable with the same name for purposes of developing. The structure of the settings is next:
* URLs for databases: *db.uri* and *db.testUri* are distinct in names for the main and test databases respectively, whereas the host for MongoDB is determined through an environment variable *MONGO_HOST* or *mongodb://localhost:27017/* by default
* Parameters for the Facebook authentication: *auth.facebook.clientId* and *auth.facebook.secretId* (both are set by secrets  *AUTH_FACEBOOK_CLIENT_ID* and *AUTH_FACEBOOK_CLIENT_SECRET* accordingly)
* To set a path to a certificate in a pfx-format along with its password when running the application on HTTPS: *server.pfx.path* (an environment variable *SERVER_PFX_PATH* or *1.pfx* by default) and *server.pfx.password* (a secret *SERVER_PFX_PASSWORD*)
* *server.url* is the main web address for the application that comprises a host name and port (environment variables *SERVER_HOST* or *0.0.0.0* by default and *SERVER_PORT* or *3443* by default)
* *server.externalUrl* works as a public url for cases when it is different from the previous one (e.g., the application was deployed in a docker container) and it is required to give a link to the applciation (e.g., in emails); the external address also accepts a host name and port (environment variables *SERVER_EXTERNAL_HOST* and *SERVER_EXTERNAL_PORT* or *443* by default)
* For sending automatic email messages: *mail.host* (an environment variable *MAIL_HOST*), *mail.port* (an environment variable *MAIL_SECURE_PORT* or *465*), *mail.auth.user* (an environment variable *MAIL_AUTH_USER*) and *mail.auth.pass* (a secret *MAIL_AUTH_PASSWORD*). The mechanism works out as long as the host and authentication options are set up 
* Parameters to store additional information: *about.website* (an environment variable *ABOUT_WEBSITE*) determines a URL for a home site on the about page
* *logger* to define a console logger with the next logging levels: *error* (by defult), *warn*, *info* (an environmental variable *LOGGER_LEVEL*)

## API Reference

Public API methods working for anonymous visitors:
* **GET programs/default** returns programs available by default without registration: *[{ name, userId, stages: [order, duration, descr], active, audioBetweenStages }]*
* **GET modules** sends static script files
* **GET modules/about** to read basic contact information from the configuration: *{ email, website }* ([more about configuring](#headConfiguration))

Some API methods are for authenticated users and that's why they require a Facebook token as a header Authorization: *Bearer [token]*. The methods:
* **POST auth/logIn** updates the user's login time and returns whether the user is an administrator *{ hasAdminRole }*; provided it's a new user it sends an email to them if the respective preferences are set ([more about configuring](#headConfiguration))
* **GET programs** to get a user's customised programs through an object *{ programs: { _id, name, userId, stages: [order, duration, descr], active, audioBetweenStages }, schemaRestrictions }*, where *schemaRestrictions* describes restrictions imposed by the program schema
* **POST programs** updates the user's program list: *{ deletedIds: [], updated: [{ _id, name, userId, stages: [order, duration, descr], active, audioBetweenStages }], created: [{ _id, name, userId, stages: [order, duration, descr], active, audioBetweenStages }] }*, then it redirects to **GET programs**
* **GET programs/active** returns the list of the user's active programs: *[{ _id, name, userId, stages: [order, duration, descr], active }]*
* **GET users/profile** to get the user's preferences: *{ hideDefaultPrograms }* - the sole option determines whether only active customised timers should be shown (if there are such available) or all timer programs including default ones
* **POST users/profile** accepts the user's only option to update: *{ hideDefaultPrograms }*
* **DELETE users/profile** after removal sends an email to the user if the respective preferences are set ([more about configuring](#headConfiguration))

The user must be an administrator to have access to the methods:
* **GET users** accepts an object for sorting and filtering its outcome: *{ query: { page || 1, searchFor, sortField || 'name', sortDirection || -1 } }*; returns *{ queryFilter: { page, searchFor, sortField, sortDirection }, curUserId, users: [_id, name, administrator, location, gender, lastLogin, createdAt, activeProgramCount], pageCount }*
* **POST users/adminSwitch** switch the user's administrative right; thereafter it sends an email to the user if the respective preferences are set ([more about configuring](#headConfiguration))

## <a name="headDatabase"></a>Database

The project database is built upon MongoDB ([more about its version](#headPrerequisites)). A default database server address used in the application is *mongodb://localhost:27017/*.

There are 2 tables altogether:
* **User** stores users' data such as: name, gender, location, email, preferences, etc.
* **Program** keeps all information about users' customised timers (with a name and 2 boolean properties: *active* and *audioBetweenStages* (should play a sound during a stage shift)) and their stages in an included schema (a duration, description and order)
