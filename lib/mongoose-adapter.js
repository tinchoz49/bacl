var _ = require('underscore');
var help = require('./help');

function MongooseAdapter(db, prefix){
  this.db = db;
  if (prefix == undefined){
    prefix = 'acl';
  }
  this.prefix = prefix+'_';

  var rolSchema = db.Schema({
    name: String,
    privileges: [{
      rule: { type: String, lowercase: true, trim: true, default: '*'},
      type: { type: [String], default: ['get', 'post', 'put', 'delete'] }
    }]
  });

  var userSchema = db.Schema({
    user: { type: String, lowercase: true, trim: true, unique: true },
    roles: [{ type: db.Schema.Types.ObjectId, ref: this.prefix+'rol' }],
    isActive: { type: Boolean, default: true }
  });

  this.Rol = db.model(this.prefix+'rol', rolSchema);
  this.User = db.model(this.prefix+'user', userSchema);
}

MongooseAdapter.prototype = {
  createRol: function (name, privileges, stage, func) {
    var self = this;
    self.Rol.findOne({ name: name }, function(err, rol){
      if (err == null){
        if (rol == null){
          self.Rol.create({ name: name, privileges: privileges},function(err,rol){
            help.finishFunc(stage, func, err);
          });
        }else{
          rol.update({ privileges: privileges }, function(err, rol){
            help.finishFunc(stage, func, err);
          });
        }
      }else{
        help.finishFunc(stage, func, err);
      }
    });
  },

  createUser: function (username, roles, stage, func) {
    var self = this;
    self.Rol.find({ name: { $in: roles } }, function(err, list){
      if (err == null){
        self.User.findOne({ user: username }, function(err, user){
          if (err == null){
            if (user == null){
              self.User.create({ user: username, roles: list }, function (err){
                help.finishFunc(stage, func, err);
              });
            }else{
              user.update({ roles: list }, function (err){
                help.finishFunc(stage, func, err);
              });
            }
          }else{
            help.finishFunc(null, func, err);
          }
        });
      }else{
        help.finishFunc(null, func, err);
      }
    });
  },

  findUser: function (bacl, username, resource, func) {
    var self = this;
    var result = false;
    var message = '';
    self.User.findOne({ user: username, isActive: true }).populate('roles').exec( function(err, user){
      
      if (user != null) {
        _.each(user.roles, function (rol, index){
          _.each(rol.privileges, function (privilege, index) {
            if (help.checkRule(privilege, resource)){
              result = true;
              message = bacl.messages.grantAccess;
              return false;
            } 
          });
          if (result) {
            return false;
          }
        });
        if (!(result)){
          message = bacl.messages.denyAccess;
        }
      }else{
        message = bacl.messages.userNotFound;
      }

      help.finishFunc(null, func, [result, message]);
    });
  },

  setActiveUser: function(username, value, stage, func){
    var self = this;
    self.User.findOne({ user: username }, function(err, user){
      if (user != null){
        user.isActive = value;
        user.save(function(err){
          help.finishFunc(stage, func, err);
        });
      }
    });
  }
}
exports = module.exports = MongooseAdapter;