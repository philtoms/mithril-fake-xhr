'use strict';

var mithrilFakeXhr = function(base) {

  base = base || window;
  var SaveXML = base.XMLHttpRequest; 

  var pending = {};
  var unexpectedRequests = 0;
    
  base.XMLHttpRequest = (function() {

    function select(ctx, cb) {
      Object.keys(pending).forEach(function(key){
        var match = new RegExp('^'+key+'$').exec(ctx.method.toLowerCase() + ctx.url);
        if (match && match.length) {
          ctx.pending = pending[key];
          cb(pending[key],ctx);
        }
      });
    }

    return function() {
      this.$headers = {};
      this.setRequestHeader = function(key, value) {
        this.$headers[key] = value;
      };
      this.open = function(method, url, async, user, password) {
        this.method = method;
        this.url = url;
        select(this, function(pending){
          if (pending.passthrough){
            pending.xhr = new SaveXML();
            return pending.xhr.open(method, url, async, user, password);
          }
        })
      };
      this.send = function(data) {
        var xhr = this, request = this.pending;
        xhr.readyState = 4;
        xhr.status = 400;
        xhr.responseText='';
        if (request && (request.data === undefined || JSON.stringify(request.data) == data)) {
          if (request.passthrough){
            var passthroughXhr = request.xhr;
            passthroughXhr.onreadystatechange = function() {
              if (passthroughXhr.readyState === 4) {
                request.response(passthroughXhr.responseText);
                xhr.status = passthroughXhr.status;
                xhr.readyState = passthroughXhr.readyState;
                xhr.responseText = passthroughXhr.responseText;
                xhr.onreadystatechange();
              }
            };
            request.$headers = xhr.$headers;
            return request.xhr.send(data);
          }
          else {
            xhr.status = request.status();
            xhr.responseText = JSON.stringify(request.response());
            xhr.onreadystatechange();
          }
        }
        else {
          fake.unexpectedRequests += 1;
          xhr.onreadystatechange();
        }
      };
    };

  }());

  var fake = function(method, url, data, headers) {

    var key = method.toLowerCase()+url;
    var prop = m.prop('');
    var count = 0;
    var status = 200;
    var response = function() {
      count ++;
      return prop.apply(this,arguments);
    };

    var api = {
      respondWith: function() {
        switch (arguments.length) {
          case 0: prop(''); break;
          case 1: prop(arguments[0]); break;
          default: {
            status = arguments[0];
            prop(arguments[1]);
            break;
          }
        }
        return api;
      },
      response:response,
      passthrough: function() {
        pending[key].passthrough = true;
        return api;
      },
      get count() {
        return count;
      }
    };
    
    pending[key] = {
      status: function(){
        return status;
      },
      response: function(){
        return api.response.apply(this,arguments);
      }
    };
    return api;
  };

  Object.defineProperty(fake, 'unexpectedRequests', {
      get: function() {
        // read once semantics
        var count = unexpectedRequests;
        unexpectedRequests = 0;
        return count;
      },
      set: function(val) {
          unexpectedRequests++;
      }
  });

  fake.reset = function() {
    pending = {};
    unexpectedRequests = 0;
  };
  
  return fake;

};

if (typeof module != "undefined" && module !== null && module.exports) module.exports = mithrilFakeXhr;
else if (typeof define == "function" && define.amd) define(function() {return mithrilFakeXhr});
