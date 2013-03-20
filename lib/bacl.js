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

  /**
   * Allow function, is use to define roles and set privileges for them.
   * 
   * @param {String or String[]} roles - ej: 'guest' or ['guest', 'admin']
   * @param {String or Array or Object} privileges - ej: '*' or 
  'posts' or 
  'posts#index' or
  { rule: 'posts#index', method: 'get' } or 
  { rule: 'posts#index', method: ['get', 'post'] } or
  { rule: [ 'posts#index' , 'posts#edit' ], method: 'get' }
  [ { rule: 'posts#index', method: 'get' }, { rule: 'posts#edit', method: 'post' } ]
   * @param {Callback} func - Callback function
   * @return {Bacl} self - returns the bacl object.
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

  /**
   * Add function is use to define the users with a list of roles.
   *
   * @param {String or String[]} users - ej: 'pepe' or ['pepe1', 'pepe2']
   * @param {String and String[]} roles - ej: 'guest' or ['guest', 'admin']
   * @param {Callback} func - Callback function
   * @return {Bacl} self - returns the bacl object.
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

  /**
   * Can is function to check the access in a user
   *
   * @param {String} user - ej: 'pepe'
   * @param {String or Object} resource - ej: 'posts' or 'posts#index' or { url: 'posts#index', method: 'get' }
   * @param {Callback} func - Callback function
   * @return {Bacl} self - returns the bacl object.
   */
  can: function (user, resource, func) {
    var self = this;
    resource = help.parseResource(resource);
    self.adapter.findUser(self, user, resource, func);
    return self;
  },

  /**
   * Enable is function to enable a user or a list of users
   *
   * @param {String or String[]} user - ej: 'pepe' or ['pepe1', 'pepe2']
   * @param {Callback} func - Callback function
   * @return {Bacl} self - returns the bacl object.
   */
  enable: function(users, func){
    var self = this;
    if (!(util.isArray(users))) {
      users = [users]
    }
    var stage = {current: 0, last: _.size(users)};
    self.adapter.setActiveUser(users, true, stage, func);
    return self;
  },

  /**
   * Disable is function to disable a user or a list of users
   *
   * @param {String or String[]} user - ej: 'pepe' or ['pepe1', 'pepe2']
   * @param {Callback} func - Callback function
   * @return {Bacl} self - returns the bacl object.
   */
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