var help = require('./help');
var _ = require('underscore');
var util = require('util');

function Bacl(adapter, messages){
  var defaul_messages = {"grantAccess": "User has grant access", 
  "denyAccess": "User don't has access",
  "userNotFound": "The user doesn't exist in the system or is disabled"};
  this.adapter = adapter;
  this.messages = messages || {};
  this.messages = _.extend(defaul_messages, this.messages);
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
      var stage = {current: 0, last: _.size(rol)};
      _.each(rol, function(value){
        self.adapter.createRol(value, listPrivileges, stage, func);
      });
    }else{
      self.adapter.createRol(rol,listPrivileges, null, func);
    }
    return self;
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
      var stage = {current: 0, last: _.size(user)};
      _.each(user, function(value){
        self.adapter.createUser(value, roles, stage, func);
      });
    }else{
      self.adapter.createUser(user, roles, null, func);
    }
    return self;
  },

  /*
  
  user = 'pepe'
  resource = 'posts' or 'posts#index' or { url: 'posts#index', type: 'get' }

   */
  can: function (user, resource, func) {
    var self = this;
    resource = help.parseResource(resource);
    self.adapter.findUser(self, user, resource, func);
    return self;
  },

  enable: function(user, func){
    var self = this;
    if (util.isArray(user)) {
      var stage = {current: 0, last: _.size(user)};
      _.each(user, function(value){
        self.adapter.setActiveUser(user, true, stage, func);
      });
    }else{
      self.adapter.setActiveUser(user, true, null, func);
    }
    return self;
  },

  disable: function(user, func){
    var self = this;
    if (util.isArray(user)) {
      var stage = {current: 0, last: _.size(user)};
      _.each(user, function(value){
        self.adapter.setActiveUser(user, false, stage, func);
      });
    }else{
      self.adapter.setActiveUser(user, false, null, func);
    }
    return self;
  },

}

exports = module.exports = Bacl;