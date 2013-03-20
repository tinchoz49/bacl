bacl
=========

##Simple, fast and secure node ACL

bacl is a nodejs module to work with ACL (access control list). It's work with mongodb using mongoose but you can create your own adapter to work with other databases.

Install and use bacl is very simple

### Installation

Just the 'bacl' library:

```
npm install bacl
```

### Using bacl with the mongoose adapter

Initialize the bacl and pass a mongoose connection

```js
bacl = require('bacl');
//you need a mongoose or jugglingb connection (to use jugglingdb, look at the bottom of the document)
bacl = new bacl(new bacl.mongooseAdapter(mongoose));
```
bacl has got a default list of messages for diferent events (grantAccess,denyAccess and userNotFound) you can change this
```js
bacl = new bacl(new bacl.mongooseAdapter(mongoose),
{"grantAccess": "User has got grant access", ...});
```
Example adding roles

```js
bacl.allow('guest', '*');
/* or */
bacl.allow(['guest', 'manager'], '*');
/* or */
bacl.allow('guest', 'posts#index');
/* or */
bacl.allow('guest', 'posts');
/* or */
bacl.allow('guest', { rule: 'posts#index', method: 'get' } );
/* or */
bacl.allow('guest', { rule: 'posts#index', method: ['get','post','put'] });
/* or */
bacl.allow('guest', { rule: [ 'posts#index' , 'posts#edit' ], method: ['get', 'post'] });
/* or */
bacl.allow('guest', [ { rule: 'posts#index', method: 'get' }, 
  { rule: 'posts#edit', method: 'post' } ]);
```

Example adding users

```js
bacl.add('user1', 'guest');
/* or */
bacl.add('user1', ['guest', 'manager']);
/* or */
bacl.add(['user1','user2'], 'guest');
```
    
Example checking access

```js
bacl.can('user1','posts', function (ok, user, message) {
    if (ok) {
        allowed access
    }else{
        deny access
    }
});
/* or */
bacl.can('user1','posts#index', function (ok, user, message) {
    if (ok) {
        allowed access
    }else{
        deny access
    }
});
/* or */
bacl.can('user1', { url: 'posts#index', method: 'get' }, function (ok, user, message) {
    if (ok) {
        allowed access
    }else{
        deny access
    }
});
```
When you recive the user with the method "can" you can check the roles when you want for example to show and hide elements in the views for diferents roles.

```js
if (user.is('guest')) {
  //show menu for the guest
}else{
  //show other menu
}
/* you can define an "or" operator using arrays */
if (user.is(['guest', 'guest2']) {
  //show menu for the guest or guest2
}else{
  //show other menu
}
/* you can define an operator using objects, everthing is posible */
if (user.is({or: ['guest', 'guest2'], and: 'guest3'})) {
  //if the user is guest and guest2 show the menu for that
}else{
  //show other menu
}
```

bacl has got a fast and simple way to enable/disable users

```js
bacl.enable('user1', function(err){
  
});
/* or */
bacl.disable('user1', function(err){
  
});

/* the first parameter can be an array */
```
### Using bacl in compoundjs with the jugglingdb Adapter
In the world of nodejs we have an excellent framework called compoundjs, I'm going to show how integrate bacl with compoundjs.

In config/environment.js

First we are going to create a new file in config/initializers/acl.js of the compound app and copy/paste this code:

```js
module.exports = function(compound) {
  var bacl = require('bacl');
  bacl = new bacl(new bacl.jugglingdbAdapter(compound.orm._schemas[0]));
  bacl.allow('guest','posts#index', function(){
    console.log('Create a new set of rules for the rol guest');
    //in this case we are using an static user called user1, but this is only for example
    bacl.add('user1', 'guest', function(){
      console.log('Set the rol guest for the user1');
    });
  });
  //this is necesary to use in the controller files of compoundjs
  compound.bacl = bacl;
}
```
And this is everthing. For example, if you want check the access of the user1 in the controller posts you can write this in the controller app/controllers/posts_controller.js:

```js
before(function (req) {
  compound.bacl.can('user1', controllerName+'#'+actionName, function (result) {
    if (result == false){
      return send({ code: 404, error: 'Nooo access' });
    }else{
      next();
    }
  });
});
```

Very simple!

License
-

MIT

*Free Software, Fuck Yeah!*