var help = require('./help');
var _ = require('underscore');
var util = require('util');

function Bacl(adapter){
  this.adapter = adapter;
}

Bacl.prototype = {

  /*
  
  rol = 'guest' or ['guest', 'admin']
  operations = '*' or 
  'posts' or 
  'posts#index' or
  { rule: 'posts#index', type: 'get' } or 
  { rule: 'posts#index', type: ['get', 'post'] } or
  { rule: [ 'posts#index' , 'posts#edit' ], type: 'get' }
  [ { rule: 'posts#index', type: 'get' }, { rule: 'posts#edit', type: 'post' } ]

   */
  allow: function (rol, operations) {
    var self = this;
    var listOperations = help.parseOperations(operations);
    if (util.isArray(rol)) {
      _.each(rol, function(value){
        self.adapter.createRol(value,listOperations);
      });
    }else{
      self.adapter.createRol(rol,listOperations);
    }
  },
  /*
  
  user = 'pepe' or ['pepe1', 'pepe2']
  roles = 'guest' or ['guest', 'admin']

   */
  add: function (user, roles) {
    var self = this;
    if (_.isString(roles)){
      roles = [ roles ];
    }
    if (util.isArray(user)) {
      _.each(user, function(value){
        self.adapter.createUser(value, roles);
      });
    }else{
      self.adapter.createUser(user, roles);
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