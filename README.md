bacl
=========

##Simple, fast and secure node ACL

bacl is a nodejs module to work with ACL (access control list). It's work with mongodb using mongoose but you can create your own adapter to work with other databases.

Install and use bacl is very simple
--------------
---
### Installation

Just the `bacl` library:

    npm install bacl

### Use bacl using mongoose connection

Initialize the bacl and pass a mongoose connection

    bacl = require('bacl');
    bacl = new bacl(new bacl.mongooseAdapter(mongoose));

Example adding roles

    bacl.allow('guest', '*');
    or
    bacl.allow(['guest', 'manager'], '*');
    or
    bacl.allow('guest', 'posts#index');
    or
    bacl.allow('guest', 'posts');
    or
    bacl.allow('guest', { rule: 'posts#index', type: 'get' } );
    or
    bacl.allow('guest', { rule: 'posts#index', type: ['get','post','put'] });
    or
    bacl.allow('guest', { rule: [ 'posts#index' , 'posts#edit' ], type: ['get', 'post'] });
    or
    bacl.allow('guest', [ { rule: 'posts#index', type: 'get' }, 
      { rule: 'posts#edit', type: 'post' } ]);

Example adding users

    bacl.add('user1', 'guest');
    or
    bacl.add('user1', ['guest', 'manager']);
    or
    bacl.add(['user1','user2'], 'guest');
    
Example chequing access

    bacl.can('user1','posts', function (ok) {
        if (ok) {
            allowed access
        }else{
            deny access
        }
    });
    or
    bacl.can('user1','posts#index', function (ok) {
        if (ok) {
            allowed access
        }else{
            deny access
        }
    });
    or
    bacl.can('user1', { url: 'posts#index', type: 'get' }, function (ok) {
        if (ok) {
            allowed access
        }else{
            deny access
        }
    });
License
-

MIT

*Free Software, Fuck Yeah!*