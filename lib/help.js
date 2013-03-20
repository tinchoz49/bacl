var util = require('util');
var _ = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');
var defaultsREST = ['get', 'post', 'put', 'delete'];
/*

privileges = '*' or 
  'posts' or 
  'posts#index' or
  { rule: 'posts#index', method: 'get' } or 
  { rule: 'posts#index', method: ['get', 'post'] } or
  { rule: [ 'posts#index' , 'posts#edit' ], method: 'get' }
  [ { rule: 'posts#index', method: 'get' }, { rule: 'posts#edit', method: 'post' } ]

 */
exports.parsePrivileges = function (privileges) {
  var list = [];
  if (util.isArray(privileges)){
    _.each(privileges, function(value, index){
      parsePrivilege(list, value);
    });
  }else{
    parsePrivilege(list, privileges);
  }
  return list;
}

exports.parseResource = function (resource) {
  var result = {};
  if (_.isString(resource)){
    result.url = resource;
    result.method = null;
  }else{
    result.url = resource.url;
    result.method = resource.method;
  }
  result.operator = getOperator(result.url);
  return result;
}

exports.checkRule = function (privilege, resource) {
  if (privilege.rule == '*') {
    return true;
  }
  var found_url = false;
  var found_method = false;
  if (resource.operator == 'controller'){
    if (!(_.str.include(privilege.rule,'#'))){
      found_url = (privilege.rule == resource.url);
    }
  }else{
    if (_.str.include(privilege.rule, '#')){
      found_url = (privilege.rule == resource.url);
    }else{
      found_url = _(resource.url).startsWith(privilege.rule+'#');
    }
  }
  
  if (resource.method == null){
    found_method = true;
  }else{
    found_method = (_.indexOf(privilege.method, resource.method) != -1);
  }

  return (found_url && found_method);
}

exports.implode = function(list, operator){
  var result = '';
  if (_.isString(list)){
    return list;
  }
  _.each(list, function(value, index){
    if (index < (_.size(list) - 1)){
      result = result + value + operator;
    }else{
      result = result + value;
    }
  });
  return result;
}

exports.finishFunc = function(stage, func, args){
  if (stage != null){
    stage.current++;
    if ((stage.current == stage.last) && (func != null)){
      execCallback(func, args);
    }
  }else{
    if (func != null) {
      execCallback(func, args);
    }
  }
  return stage;
}

exports.checkRoles = function(currentRoles, roles){
  currentRoles = _.map(currentRoles, function(value){ return value.name; });
  return checkRoles(currentRoles, roles);
}

function execCallback(func, args){
  if (args != null){
    if (!(_.isArray(args))){
      args = [args];
    }
  }
  func.apply(null, args);
}
function parsePrivilege (list, privilege){
  if (_.isString(privilege)) {
      list.push({ rule: privilege });
  }else{
    var method = parseMethod(privilege.method);
    if (util.isArray(privilege.rule)){
      _.each(privilege.rule, function(value, index) {
        parsePrivilege(list, {rule: value, method: method});
      });
    }else{
      list.push(privilege);
    }
  }
}

function parseMethod (method){
  var result = [];
  if (method != undefined) {
    if (util.isArray(method)){
      _.every(method, function(value){
        if (_.contains(defaultsREST, value)){
          result.push(value);
          return true;
        }else{
          result = null;
          return false;
        }
      });
    }else{
      if (_.contains(defaultsREST, method)){
        result.push(method);
      }else{
        result = null;
      }
    }
  }
  return result;
}

function getOperator (url){
  if (_.str.include(url,'#')){
    return 'controller#action';
  }else{
    return 'controller';
  }
}

function checkRoles(currentRoles, roles){
  if (_.isString(roles)){
    return _.contains(currentRoles, roles);
  }else{
    var result = null;
    _.each(roles, function(value, index){
      if (_.isArray(value) || _.isObject(value)){
        value = checkRoles(currentRoles, value);
      }else{
        value = _.contains(currentRoles, value);
      }
      if ((index == 'or') || (index != 'and')){
        if (result == null){
          result = false;
        }
        result = (result || value);
      }else{
        if (result == null){
          result = true;
        }
        result = (result && value);
      }
    });
    return result;
  }
}