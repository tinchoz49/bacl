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
  allow: function (roles, privileges, func) {
    var self = this;
    var listPrivileges = help.parsePrivileges(privileges);
    if (!(util.isArray(roles))) {
      roles = [roles]
    }
    var stage = {current: 0, last: _.size(roles)};
    self.adapter.createRol(roles, listPrivileges, stage, func);
    return self;
  },
  /*
  
  users = 'pepe' or ['pepe1', 'pepe2']
  roles = 'guest' or ['guest', 'admin']

   */
  add: function (users, roles, func) {
    var self = this;
    if (_.isString(roles)){
      roles = [ roles ];
    }
    if (!(util.isArray(users))) {
      users = [users]
    }
    var stage = {current: 0, last: _.size(users)};
    self.adapter.createUser(users, roles, stage, func);
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

  enable: function(users, func){
    var self = this;
    if (!(util.isArray(users))) {
      users = [users]
    }
    var stage = {current: 0, last: _.size(users)};
    self.adapter.setActiveUser(users, true, stage, func);
    return self;
  },

  disable: function(users, func){
    var self = this;
    if (!(util.isArray(users))) {
      users = [users]
    }
    var stage = {current: 0, last: _.size(users)};
    self.adapter.setActiveUser(users, false, stage, func);
    return self;
  },

}

exports = module.exports = Bacl;