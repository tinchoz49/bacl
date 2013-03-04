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
    user: { type: String, lowercase: true, trim: true, unique: true }
  });

  this.Rol.hasMany(this.Privilege, {as: 'privileges',  foreignKey: 'rolId'});
  this.Rol.hasMany(this.Permision, {as: 'permisions',  foreignKey: 'rolId'});
  this.Permision.belongsTo(this.Rol, {as: 'rol',  foreignKey: 'rolId'});

  this.User.hasMany(this.Permision, {as: 'permisions',  foreignKey: 'userId'});
  this.Permision.belongsTo(this.User, {as: 'user',  foreignKey: 'userId'});
}

JugglingdbAdapter.prototype = {
  createRol: function (name, privileges) {
    var self = this;
    self.Rol.findOne({ where: { name: name } }, function(err, rol){
      if (rol == null){
        self.Rol.create({ name: name },function(err, rol){
          if (!(err)){
            self.createPrivileges(rol, privileges);
          }
        });
      }else{
        rol.privileges.destroyAll(function(err){
          if (!(err)){
            self.createPrivileges(rol, privileges);
          }
        });
      }
    });
  },

  createUser: function (username, roles) {
    var self = this;
    self.Rol.all({ where: { name: { in: roles } } }, function(err, list) {
      self.User.findOne({ where: { user: username } }, function(err, user){
        if (user == null){
          self.User.create({ user: username }, function (err, user){
            _.each(list, function(rol, index){
              user.permisions.create({ rolId: rol.id }, function(err){

              });
            });
          });
        }else{
          user.permisions.destroyAll(function(err){
            _.each(list, function(rol, index){
              user.permisions.create({ rolId: rol.id }, function(err){

              });
            });
          });
        }
      });
    });
  },

  findUser: function (username, resource, func) {
    var self = this;
    self.User.findOne({ where: { user: username } }, function(err, user){
      var result = false;      
      if (user != null) {
        user.permisions(function(err, permisions){
          _.each(permisions, function(permision, indexPerm){
            permision.rol(function(err, rol){
              rol.privileges(function(err, privileges){
                _.each(privileges, function (privilege, indexPri) {
                  privilege.type = privilege.type.split(',');
                  if (help.checkRule(privilege, resource)){
                    result = true;
                    return false;
                  } 
                });
                if (result) {
                  func(result);
                  return false;
                }
                if (indexPerm == (_.size(permisions) - 1)) {
                  func(result);
                }
              });
            });
          });
        });
      }else{
        func(result);
      }
    });
  },

  createPrivileges: function (rol, privileges){
    _.each(privileges, function(value, index){
      if (value.type != null){
        rol.privileges.create({ rule: value.rule, type: help.implode(value.type, ',') }, function(err, privilege) {

        });
      }else{
        rol.privileges.create({ rule: value.rule }, function(err, privilege) {

        });
      }
    });
  }
}
exports = module.exports = JugglingdbAdapter;