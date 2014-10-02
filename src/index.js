var JSData;

try {
  JSData = require('js-data');
} catch (e) {
}

if (!JSData) {
  try {
    JSData = window.JSData;
  } catch (e) {
  }
}

if (!JSData) {
  throw new Error('js-data must be loaded!');
} else if (!localforage) {
  throw new Error('localforage must be loaded!');
}

var emptyStore = new JSData.DS();
var DSUtils = JSData.DSUtils;
var makePath = DSUtils.makePath;
var deepMixIn = DSUtils.deepMixIn;
var forEach = DSUtils.forEach;
var filter = emptyStore.defaults.defaultFilter;
var guid = require('mout/random/guid');
var keys = require('mout/object/keys');
var P = DSUtils.Promise;

function Defaults() {

}

Defaults.prototype.basePath = '';

function DSLocalForageAdapter(options) {
  options = options || {};
  this.defaults = new Defaults();
  deepMixIn(this.defaults, options);
}

var dsLocalStorageAdapterPrototype = DSLocalForageAdapter.prototype;

dsLocalStorageAdapterPrototype.getPath = function (resourceConfig, options) {
  return makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.name);
};

dsLocalStorageAdapterPrototype.getIdPath = function (resourceConfig, options, id) {
  return makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.getEndpoint(id, options), id);
};

dsLocalStorageAdapterPrototype.getIds = function (resourceConfig, options) {
  var idsPath = this.getPath(resourceConfig, options);
  return new P(function (resolve) {
    localforage.getItem(idsPath, function (ids) {
      if (ids) {
        return resolve(ids);
      } else {
        return localforage.setItem(idsPath, {}, resolve);
      }
    });
  });
};

dsLocalStorageAdapterPrototype.saveKeys = function (ids, resourceConfig, options) {
  var keysPath = this.getPath(resourceConfig, options);
  return new P(function (resolve) {
    localforage.setItem(keysPath, ids, resolve);
  });
};

dsLocalStorageAdapterPrototype.ensureId = function (id, resourceConfig, options) {
  var _this = this;
  return _this.getIds(resourceConfig, options).then(function (ids) {
    ids[id] = 1;
    return _this.saveKeys(ids, resourceConfig, options);
  });
};

dsLocalStorageAdapterPrototype.removeId = function (id, resourceConfig, options) {
  var _this = this;
  return _this.getIds(resourceConfig, options).then(function (ids) {
    delete ids[id];
    return _this.saveKeys(ids, resourceConfig, options);
  });
};

dsLocalStorageAdapterPrototype.GET = function (key) {
  return new P(function (resolve) {
    localforage.getItem(key, resolve);
  });
};

dsLocalStorageAdapterPrototype.PUT = function (key, value) {
  return this.GET(key).then(function (item) {
    if (item) {
      deepMixIn(item, value);
    }
    return new P(function (resolve) {
      localforage.setItem(key, item || value, resolve);
    });
  });
};

dsLocalStorageAdapterPrototype.DEL = function (key) {
  return new P(function (resolve) {
    localforage.removeItem(key, resolve);
  });
};

dsLocalStorageAdapterPrototype.find = function find(resourceConfig, id, options) {
  options = options || {};
  return this.GET(this.getIdPath(resourceConfig, options, id)).then(function (item) {
    if (!item) {
      return P.reject(new Error('Not Found!'));
    } else {
      return item;
    }
  });
};

dsLocalStorageAdapterPrototype.findAll = function (resourceConfig, params, options) {
  var _this = this;
  options = options || {};
  return _this.getIds(resourceConfig, options).then(function (ids) {
    var idsArray = keys(ids);
    if (!('allowSimpleWhere' in options)) {
      options.allowSimpleWhere = true;
    }
    var tasks = [];
    forEach(idsArray, function (id) {
      tasks.push(new P(function (resolve) {
        localforage.getItem(_this.getIdPath(resourceConfig, options, id), resolve);
      }));
    });
    return P.all(tasks);
  }).then(function (items) {
    return filter.call(emptyStore, items, resourceConfig.name, params, options);
  });
};

dsLocalStorageAdapterPrototype.create = function (resourceConfig, attrs, options) {
  var _this = this;
  var i;
  attrs[resourceConfig.idAttribute] = attrs[resourceConfig.idAttribute] || guid();
  options = options || {};
  return _this.PUT(
    makePath(this.getIdPath(resourceConfig, options, attrs[resourceConfig.idAttribute])),
    attrs
  ).then(function (item) {
      i = item;
      return _this.ensureId(item[resourceConfig.idAttribute], resourceConfig, options);
    }).then(function () {
      return i;
    });
};

dsLocalStorageAdapterPrototype.update = function (resourceConfig, id, attrs, options) {
  var _this = this;
  var i;
  options = options || {};
  return _this.PUT(_this.getIdPath(resourceConfig, options, id), attrs).then(function (item) {
    i = item;
    return _this.ensureId(item[resourceConfig.idAttribute], resourceConfig, options);
  }).then(function () {
    return i;
  });
};

dsLocalStorageAdapterPrototype.updateAll = function (resourceConfig, attrs, params, options) {
  var _this = this;
  return _this.findAll(resourceConfig, params, options).then(function (items) {
    var tasks = [];
    forEach(items, function (item) {
      tasks.push(_this.update(resourceConfig, item[resourceConfig.idAttribute], attrs, options));
    });
    return P.all(tasks);
  });
};

dsLocalStorageAdapterPrototype.destroy = function (resourceConfig, id, options) {
  var _this = this;
  options = options || {};
  return _this.DEL(_this.getIdPath(resourceConfig, options, id)).then(function () {
    return _this.removeId(id, resourceConfig, options);
  }).then(function () {
    return null;
  });
};

dsLocalStorageAdapterPrototype.destroyAll = function (resourceConfig, params, options) {
  var _this = this;
  return _this.findAll(resourceConfig, params, options).then(function (items) {
    var tasks = [];
    forEach(items, function (item) {
      tasks.push(_this.destroy(resourceConfig, item[resourceConfig.idAttribute], options));
    });
    return P.all(tasks);
  });
};

module.exports = DSLocalForageAdapter;
