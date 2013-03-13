var _ = require('underscore');
var help = require('./help');

function JugglingdbAdapter(db, prefix){
  this.db = db;
  if (prefix == undefined){
    prefix = 'acl';
  }
  this.prefix = prefix+'_';

  this.Privilege = db.define(this.prefix+'privilege', {
    rule: { type: String, default: "*" },
    type: { type: String, default: "get,post,put,delete" }
  });

  this.Permision = db.define(this.prefix+'permision', { });

  this.Rol = db.define(this.prefix+'rol', {
    name: { type: String }
  });

  this.User = db.define(this.prefix+'user',{ 
    user: { type: String, lowercase: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true }
  });

  this.Rol.hasMany(this.Privilege, {as: 'privileges',  foreignKey: 'rolId'});
  this.Rol.hasMany(this.Permision, {as: 'permisions',  foreignKey: 'rolId'});
  this.Permision.belongsTo(this.Rol, {as: 'rol',  foreignKey: 'rolId'});

  this.User.hasMany(this.Permision, {as: 'permisions',  foreignKey: 'userId'});
  this.Permision.belongsTo(this.User, {as: 'user',  foreignKey: 'userId'});
}

JugglingdbAdapter.prototype = {
  createRol: function (roles, privileges, stage, func) {
    var self = this;
    self.Rol.all({ where: { name: {in: roles} } }, function(err, list){
      if (err == null){
        _.each(list, function(rol, index){
          roles = _.without(roles, rol.name);
          rol.privileges.destroyAll(function(err){
            if (!(err)){
              self.createPrivileges(rol, privileges, func);
            }else{
              help.finishFunc(stage, func, err);
            }
          });
        });
        _.each(roles, function(name, index){
          self.Rol.create({ name: name },function(err, rol){
            if (!(err)){
              self.createPrivileges(rol, privileges, func);
            }else{
              help.finishFunc(stage, func, err);
            }
          });
        });
      }else{
        help.finishFunc(null, func, err);
      }
    });
  },

  createUser: function (usernames, roles, stage, func) {
    var self = this;
    self.Rol.all({ where: { name: { in: roles } } }, function(err, list) {
      self.User.all({ where: { user: { in: usernames } } }, function(err, listUser){
        if (err == null){
          _.each(listUser, function(u, index){
            usernames = _.without(u, u.name);
            u.permisions.destroyAll(function(err){
              _.each(list, function(rol, index){
                u.permisions.create({ rolId: rol.id }, function(err){
                  help.finishFunc(stage, func, err);
                });
              });
            });
          });
          _.each(usernames, function(username, index){
            self.User.create({ user: username }, function (err, user){
              _.each(list, function(rol, index){
                user.permisions.create({ rolId: rol.id }, function(err){
                  help.finishFunc(stage, func, err);
                });
              });
            });
          });
        }else{
          help.finishFunc(null, func, err);
        }
      });
    });
  },

  findUser: function (bacl, username, resource, func) {
    var self = this;
    self.User.findOne({ where: { user: username, isActive: true } }, function(err, user){
      var result = false;    
      var message = '';  
      if (user != null) {
        user.permisions(function(err, permisions){
          _.each(permisions, function(permision, indexPerm){
            permision.rol(function(err, rol){
              rol.privileges(function(err, privileges){
                _.each(privileges, function (privilege, indexPri) {
                  privilege.type = privilege.type.split(',');
                  if (help.checkRule(privilege, resource)){
                    result = true;
                    message = bacl.messages.grantAccess;
                    return false;
                  } 
                });
                if (result) {
                  help.finishFunc(null, func, [result, message]);
                  return false;
                }
                if (indexPerm == (_.size(permisions) - 1)) {
                  message = bacl.messages.denyAccess;
                  help.finishFunc(null, func, [result, message]);
                }
              });
            });
          });
        });
      }else{
        message = bacl.messages.userNotFound;
        help.finishFunc(null, func, [result, message]);
      }
    });
  },

  createPrivileges: function (rol, privileges, func){
    var stage = {current: 0, last: _.size(privileges)};
    _.each(privileges, function(value, index){
      if (value.type != null){
        rol.privileges.create({ rule: value.rule, type: help.implode(value.type, ',') }, function(err, privilege) {
          help.finishFunc(stage, func, err);
        });
      }else{
        rol.privileges.create({ rule: value.rule }, function(err, privilege) {
          help.finishFunc(stage, func, err);
        });
      }
    });
  },

  setActiveUser: function(usernames, value, stage, func){
    var self = this;
    self.User.all({ user: { in: usernames } }, function(err, list){
      if (err == null){
        if (list != null){
          _.each(list, function(u, index){
            u.isActive = value;
            u.save(function(err){
              help.finishFunc(stage, func, err);
            });
          });
        }
      }else{
        help.finishFunc(null, func, err);
      }
    });
  }  
}
exports = module.exports = JugglingdbAdapter;