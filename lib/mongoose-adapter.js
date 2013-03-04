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
    roles: [{ type: db.Schema.Types.ObjectId, ref: this.prefix+'rol' }]
  });

  this.Rol = db.model(this.prefix+'rol', rolSchema);
  this.User = db.model(this.prefix+'user', userSchema);
}

MongooseAdapter.prototype = {
  createRol: function (name, privileges) {
    var self = this;
    self.Rol.findOne({ name: name }, function(err, rol){
      if (rol == null){
        self.Rol.create({ name: name, privileges: privileges},function(err,rol){
          //console.log(err);
        });
      }else{
        rol.update({ privileges: privileges }, function(err, rol){
          //console.log(err);
        });
      }
    });
  },

  createUser: function (username, roles) {
    var self = this;
    self.Rol.find({ name: { $in: roles } }, function(err, list){
      self.User.findOne({ user: username }, function(err, user){
        if (user == null){
          self.User.create({ user: username, roles: list }, function (err){

          });
        }else{
          user.update({ roles: list }, function (err){

          });
        }
      });
    });
  },

  findUser: function (username, resource, func) {
    var self = this;
    self.User.findOne({ user: username }).populate('roles').exec( function(err, user){
      var result = false;
      
      if (user != null) {
        _.each(user.roles, function (rol, index){
          _.each(rol.privileges, function (privilege, index) {
            if (help.checkRule(privilege, resource)){
              result = true;
              return false;
            } 
          });
          if (result) {
            return false;
          }
        });
      }

      func(result);
    });
  }
}
exports = module.exports = MongooseAdapter;