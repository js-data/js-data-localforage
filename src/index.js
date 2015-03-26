import JSData from 'js-data';
import localforage from 'localforage';

let emptyStore = new JSData.DS();
let DSUtils = JSData.DSUtils;
let makePath = DSUtils.makePath;
let deepMixIn = DSUtils.deepMixIn;
let forEach = DSUtils.forEach;
let filter = emptyStore.defaults.defaultFilter;
let removeCircular = DSUtils.removeCircular;
let omit = require('mout/object/omit');
let guid = require('mout/random/guid');
let keys = require('mout/object/keys');
let P = DSUtils.Promise;

class Defaults {

}

Defaults.prototype.basePath = '';

class DSLocalForageAdapter {
  constructor(options) {
    this.defaults = new Defaults();
    deepMixIn(this.defaults, options);
  }

  getPath(resourceConfig, options) {
    return makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.name);
  }

  getIdPath(resourceConfig, options, id) {
    return makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.getEndpoint(id, options), id);
  }

  getIds(resourceConfig, options) {
    let idsPath = this.getPath(resourceConfig, options);
    return new P((resolve, reject) => {
      localforage.getItem(idsPath, (err, ids) => {
        if (err) {
          return reject(err);
        } else if (ids) {
          return resolve(ids);
        } else {
          return localforage.setItem(idsPath, {}, (err, v) => {
            if (err) {
              reject(err);
            } else {
              resolve(v);
            }
          });
        }
      });
    });
  }

  saveKeys(ids, resourceConfig, options) {
    let keysPath = this.getPath(resourceConfig, options);
    return new P((resolve, reject) => {
      localforage.setItem(keysPath, ids, (err, v) => {
        if (err) {
          reject(err);
        } else {
          resolve(v);
        }
      });
    });
  }

  ensureId(id, resourceConfig, options) {
    return this.getIds(resourceConfig, options).then(ids => {
      ids[id] = 1;
      return this.saveKeys(ids, resourceConfig, options);
    });
  }

  removeId(id, resourceConfig, options) {
    return this.getIds(resourceConfig, options).then(ids => {
      delete ids[id];
      return this.saveKeys(ids, resourceConfig, options);
    });
  }

  GET(key) {
    return new P((resolve, reject) => {
      localforage.getItem(key, (err, v) => {
        if (err) {
          reject(err);
        } else {
          resolve(v);
        }
      });
    });
  }

  PUT(key, value) {
    value = removeCircular(value);
    return this.GET(key).then(item => {
      if (item) {
        deepMixIn(item, value);
      }
      return new P((resolve, reject) => {
        localforage.setItem(key, item || value, (err, v) => err ? reject(err) : resolve(v));
      });
    });
  }

  DEL(key) {
    return new P(resolve => localforage.removeItem(key, resolve));
  }

  find(resourceConfig, id, options) {
    options = options || {};
    return this.GET(this.getIdPath(resourceConfig, options, id)).then(item => {
      if (!item) {
        return P.reject(new Error('Not Found!'));
      } else {
        return item;
      }
    });
  }

  findAll(resourceConfig, params, options) {
    options = options || {};
    return this.getIds(resourceConfig, options).then(ids => {
      let idsArray = keys(ids);
      if (!('allowSimpleWhere' in options)) {
        options.allowSimpleWhere = true;
      }
      let tasks = [];
      forEach(idsArray, id => {
        tasks.push(this.GET(this.getIdPath(resourceConfig, options, id)));
      });
      return P.all(tasks);
    }).then(items => {
      return filter.call(emptyStore, items, resourceConfig.name, params, options);
    });
  }

  create(resourceConfig, attrs, options) {
    let i;
    attrs[resourceConfig.idAttribute] = attrs[resourceConfig.idAttribute] || guid();
    options = options || {};
    return this.PUT(
      makePath(this.getIdPath(resourceConfig, options, attrs[resourceConfig.idAttribute])),
      omit(attrs, resourceConfig.relationFields || [])
    ).then(item => {
        i = item;
        return this.ensureId(item[resourceConfig.idAttribute], resourceConfig, options);
      }).then(() => i);
  }

  update(resourceConfig, id, attrs, options) {
    let i;
    options = options || {};
    return this.PUT(
      this.getIdPath(resourceConfig, options, id),
      omit(attrs, resourceConfig.relationFields || [])
    ).then(item => {
        i = item;
        return this.ensureId(item[resourceConfig.idAttribute], resourceConfig, options);
      }).then(() => i);
  }

  updateAll(resourceConfig, attrs, params, options) {
    return this.findAll(resourceConfig, params, options).then(items => {
      let tasks = [];
      forEach(items, item => {
        tasks.push(this.update(resourceConfig, item[resourceConfig.idAttribute], omit(attrs, resourceConfig.relationFields || []), options));
      });
      return P.all(tasks);
    });
  }

  destroy(resourceConfig, id, options) {
    options = options || {};
    return this.DEL(this.getIdPath(resourceConfig, options, id)).then(() => {
      return this.removeId(id, resourceConfig, options);
    }).then(() => null);
  }

  destroyAll(resourceConfig, params, options) {
    return this.findAll(resourceConfig, params, options).then(items => {
      var tasks = [];
      forEach(items, item => {
        tasks.push(this.destroy(resourceConfig, item[resourceConfig.idAttribute], options));
      });
      return P.all(tasks);
    });
  }
}

export default DSLocalForageAdapter;
