var util = require('util');
var _ = require('underscore');
var S = require('string');
var defaultsREST = ['get', 'post', 'put', 'delete'];
/*

operations = '*' or 
  'posts' or 
  'posts#index' or
  { rule: 'posts#index', type: 'get' } or 
  { rule: 'posts#index', type: ['get', 'post'] } or
  { rule: [ 'posts#index' , 'posts#edit' ], type: 'get' }
  [ { rule: 'posts#index', type: 'get' }, { rule: 'posts#edit', type: 'post' } ]

 */
exports.parseOperations = function (operations) {
  var list = [];
  if (util.isArray(operations)){
    _.each(operations, function(value, index){
      parseOperation(list, value);
    });
  }else{
    parseOperation(list, operations);
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

exports.checkRule = function (operation, resource) {
  if (operation.rule == '*') {
    return true;
  }
  var found_url = false;
  var found_type = false;

  if (resource.operator == 'controller'){
    if (!(S(operation.rule).contains('#'))){
      found_url = (operation.rule == resource.url);
    }
  }else{
    if (S(operation.rule).contains('#')){
      found_url = (operation.rule == resource.url);
    }else{
      found_url = S(resource.url).startsWith(operation.rule+'#');
    }
  }
  
  if (resource.type == null){
    found_type = true;
  }else{
    found_type = (_.indexOf(operation.type, resource.type) != -1);
  }

  return (found_url && found_type);
}

function parseOperation (list, operation){
  if (_.isString(operation)) {
      list.push({ rule: operation });
  }else{
    var type = parseType(operation.type);
    if (util.isArray(operation.rule)){
      _.each(operation.rule, function(value, index) {
        parseOperation(list, {rule: value, type: type});
      });
    }else{
      list.push(operation);
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