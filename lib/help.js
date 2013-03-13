var util = require('util');
var _ = require('underscore');
var S = require('string');
var defaultsREST = ['get', 'post', 'put', 'delete'];
/*

privileges = '*' or 
  'posts' or 
  'posts#index' or
  { rule: 'posts#index', type: 'get' } or 
  { rule: 'posts#index', type: ['get', 'post'] } or
  { rule: [ 'posts#index' , 'posts#edit' ], type: 'get' }
  [ { rule: 'posts#index', type: 'get' }, { rule: 'posts#edit', type: 'post' } ]

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
    result.type = null;
  }else{
    result.url = resource.url;
    result.type = resource.type;
  }
  result.operator = getOperator(result.url);
  return result;
}

exports.checkRule = function (privilege, resource) {
  if (privilege.rule == '*') {
    return true;
  }
  var found_url = false;
  var found_type = false;
  if (resource.operator == 'controller'){
    if (!(S(privilege.rule).contains('#'))){
      found_url = (privilege.rule == resource.url);
    }
  }else{
    if (S(privilege.rule).contains('#')){
      found_url = (privilege.rule == resource.url);
    }else{
      found_url = S(resource.url).startsWith(privilege.rule+'#');
    }
  }
  
  if (resource.type == null){
    found_type = true;
  }else{
    found_type = (_.indexOf(privilege.type, resource.type) != -1);
  }

  return (found_url && found_type);
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
    var type = parseType(privilege.type);
    if (util.isArray(privilege.rule)){
      _.each(privilege.rule, function(value, index) {
        parsePrivilege(list, {rule: value, type: type});
      });
    }else{
      list.push(privilege);
    }
  }
}

function parseType (type){
  var result = [];
  if (type != undefined) {
    if (util.isArray(type)){
      _.each(type, function(value){
        if (_.contains(defaultsREST, value)){
          result.push(value);
        }else{
          result = null;
          return false;
        }
      });
    }else{
      if (_.contains(defaultsREST, type)){
        result.push(type);
      }else{
        result = null;
      }
    }
  }
  return result;
}

function getOperator (url){
  if (S(url).contains('#')){
    return 'controller#action';
  }else{
    return 'controller';
  }
}