var help = require('./help');
var _ = require('underscore');
var util = require('util');

function Bacl(adapter){
  this.adapter = adapter;
}

Bacl.prototype = {

  /*
  
  rol = 'guest' or ['guest', 'admin']
  privileges = '*' or 
  'posts' or 
  'posts#index' or
  { rule: 'posts#index', type: 'get' } or 
  { rule: 'posts#index', type: ['get', 'post'] } or
  { rule: [ 'posts#index' , 'posts#edit' ], type: 'get' }
  [ { rule: 'posts#index', type: 'get' }, { rule: 'posts#edit', type: 'post' } ]

   */
  allow: function (rol, privileges, func) {
    var self = this;
    var listPrivileges = help.parsePrivileges(privileges);
    if (util.isArray(rol)) {
      var current = 0;
      _.each(rol, function(value){
        self.adapter.createRol(value, listPrivileges, current, _.size(rol), func);
      });
    }else{
      self.adapter.createRol(rol,listPrivileges, null, null, func);
    }
  },
  /*
  
  user = 'pepe' or ['pepe1', 'pepe2']
  roles = 'guest' or ['guest', 'admin']

   */
  add: function (user, roles, func) {
    var self = this;
    if (_.isString(roles)){
      roles = [ roles ];
    }
    if (util.isArray(user)) {
      var current = 0;
      _.each(user, function(value){
        self.adapter.createUser(value, roles, current, _.size(user), func);
      });
    }else{
      self.adapter.createUser(user, roles, null, null, func);
    }
  },

  /*
  
  user = 'pepe'
  resource = 'posts' or 'posts#index' or { url: 'posts#index', type: 'get' }

   */
  can: function (user, resource, func) {
    var self = this;
    resource = help.parseResource(resource);
    self.adapter.findUser(user, resource, func);
  }
}

exports = module.exports = Bacl;