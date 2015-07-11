let JSData = require('js-data');
let localforage = require('localforage');
let guid = require('mout/random/guid');
let unique = require('mout/array/unique');
let map = require('mout/array/map');

let emptyStore = new JSData.DS();
let { DSUtils } = JSData;
let filter = emptyStore.defaults.defaultFilter;

class Defaults {

}

Defaults.prototype.basePath = '';

let queue = [];
let taskInProcess = false;

function enqueue(task) {
  queue.push(task);
}

function dequeue() {
  if (queue.length && !taskInProcess) {
    taskInProcess = true;
    queue[0]();
  }
}

function queueTask(task) {
  if (!queue.length) {
    enqueue(task);
    dequeue();
  } else {
    enqueue(task);
  }
}

function createTask(fn) {
  return new DSUtils.Promise(fn).then(result => {
    taskInProcess = false;
    queue.shift();
    setTimeout(dequeue, 0);
    return result;
  }, err => {
    taskInProcess = false;
    queue.shift();
    setTimeout(dequeue, 0);
    return DSUtils.Promise.reject(err);
  });
}

class DSLocalForageAdapter {
  constructor(options) {
    options = options || {};
    this.defaults = new Defaults();
    DSUtils.deepMixIn(this.defaults, options);
  }

  getPath(resourceConfig, options) {
    return DSUtils.makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.name);
  }

  getIdPath(resourceConfig, options, id) {
    return DSUtils.makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.endpoint, id);
  }

  getIds(resourceConfig, options) {
    let idsPath = this.getPath(resourceConfig, options);
    return new DSUtils.Promise((resolve, reject) => {
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
    return new DSUtils.Promise((resolve, reject) => {
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
    return new DSUtils.Promise((resolve, reject) => {
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
    value = DSUtils.removeCircular(value);
    return this.GET(key).then(item => {
      if (item) {
        DSUtils.deepMixIn(item, value);
      }
      return new DSUtils.Promise((resolve, reject) => {
        localforage.setItem(key, item || value, (err, v) => err ? reject(err) : resolve(v));
      });
    });
  }

  DEL(key) {
    return new DSUtils.Promise(resolve => localforage.removeItem(key, resolve));
  }

  find(resourceConfig, id, options) {
    let instance;
    return new DSUtils.Promise((resolve, reject) => {
      options = options || {};
      options.with = options.with || [];
      this.GET(this.getIdPath(resourceConfig, options, id)).then(item => {
        if (!item) {
          reject(new Error('Not Found!'));
        } else {
          resolve(item);
        }
      }, reject);
    }).then(_instance => {
        instance = _instance;
        let tasks = [];

        DSUtils.forEach(resourceConfig.relationList, def => {
          let relationName = def.relation;
          let relationDef = resourceConfig.getResource(relationName);
          let containedName = null;
          if (DSUtils.contains(options.with, relationName)) {
            containedName = relationName;
          } else if (DSUtils.contains(options.with, def.localField)) {
            containedName = def.localField;
          }
          if (containedName) {
            let __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options);
            __options.with = options.with.slice();
            __options = DSUtils._(relationDef, __options);
            DSUtils.remove(__options.with, containedName);
            DSUtils.forEach(__options.with, (relation, i) => {
              if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                __options.with[i] = relation.substr(containedName.length + 1);
              } else {
                __options.with[i] = '';
              }
            });

            let task;

            if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
              task = this.findAll(resourceConfig.getResource(relationName), {
                where: {
                  [def.foreignKey]: {
                    '==': instance[resourceConfig.idAttribute]
                  }
                }
              }, __options).then(relatedItems => {
                if (def.type === 'hasOne' && relatedItems.length) {
                  DSUtils.set(instance, def.localField, relatedItems[0]);
                } else {
                  DSUtils.set(instance, def.localField, relatedItems);
                }
                return relatedItems;
              });
            } else if (def.type === 'hasMany' && def.localKeys) {
              let localKeys = [];
              let itemKeys = instance[def.localKeys] || [];
              itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
              localKeys = localKeys.concat(itemKeys || []);
              task = this.findAll(resourceConfig.getResource(relationName), {
                where: {
                  [relationDef.idAttribute]: {
                    'in': DSUtils.filter(unique(localKeys), x => x)
                  }
                }
              }, __options).then(relatedItems => {
                DSUtils.set(instance, def.localField, relatedItems);
                return relatedItems;
              });
            } else if (def.type === 'belongsTo' || (def.type === 'hasOne' && def.localKey)) {
              task = this.find(resourceConfig.getResource(relationName), DSUtils.get(instance, def.localKey), __options).then(relatedItem => {
                DSUtils.set(instance, def.localField, relatedItem);
                return relatedItem;
              });
            }

            if (task) {
              tasks.push(task);
            }
          }
        });

        return DSUtils.Promise.all(tasks);
      }).then(() => instance);
  }

  findAll(resourceConfig, params, options) {
    let items = null;
    return new DSUtils.Promise((resolve, reject) => {
      options = options || {};
      options.with = options.with || [];
      this.getIds(resourceConfig, options).then(ids => {
        let idsArray = DSUtils.keys(ids);
        if (!('allowSimpleWhere' in options)) {
          options.allowSimpleWhere = true;
        }
        let tasks = [];
        DSUtils.forEach(idsArray, id => {
          tasks.push(this.GET(this.getIdPath(resourceConfig, options, id)));
        });
        return DSUtils.Promise.all(tasks);
      }).then(items => {
        return filter.call(emptyStore, items, resourceConfig.name, params, options);
      }).then(resolve, reject);
    }).then(_items => {
        items = _items;
        let tasks = [];
        DSUtils.forEach(resourceConfig.relationList, def => {
          let relationName = def.relation;
          let relationDef = resourceConfig.getResource(relationName);
          let containedName = null;
          if (DSUtils.contains(options.with, relationName)) {
            containedName = relationName;
          } else if (DSUtils.contains(options.with, def.localField)) {
            containedName = def.localField;
          }
          if (containedName) {
            let __options = DSUtils.deepMixIn({}, options.orig ? options.orig() : options);
            __options.with = options.with.slice();
            __options = DSUtils._(relationDef, __options);
            DSUtils.remove(__options.with, containedName);
            DSUtils.forEach(__options.with, (relation, i) => {
              if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                __options.with[i] = relation.substr(containedName.length + 1);
              } else {
                __options.with[i] = '';
              }
            });

            let task;

            if ((def.type === 'hasOne' || def.type === 'hasMany') && def.foreignKey) {
              task = this.findAll(resourceConfig.getResource(relationName), {
                where: {
                  [def.foreignKey]: {
                    'in': DSUtils.filter(map(items, item => DSUtils.get(item, resourceConfig.idAttribute)), x => x)
                  }
                }
              }, __options).then(relatedItems => {
                DSUtils.forEach(items, item => {
                  let attached = [];
                  DSUtils.forEach(relatedItems, relatedItem => {
                    if (DSUtils.get(relatedItem, def.foreignKey) === item[resourceConfig.idAttribute]) {
                      attached.push(relatedItem);
                    }
                  });
                  if (def.type === 'hasOne' && attached.length) {
                    DSUtils.set(item, def.localField, attached[0]);
                  } else {
                    DSUtils.set(item, def.localField, attached);
                  }
                });
                return relatedItems;
              });
            } else if (def.type === 'hasMany' && def.localKeys) {
              let localKeys = [];
              DSUtils.forEach(items, item => {
                let itemKeys = item[def.localKeys] || [];
                itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
                localKeys = localKeys.concat(itemKeys || []);
              });
              task = this.findAll(resourceConfig.getResource(relationName), {
                where: {
                  [relationDef.idAttribute]: {
                    'in': DSUtils.filter(unique(localKeys), x => x)
                  }
                }
              }, __options).then(relatedItems => {
                DSUtils.forEach(items, item => {
                  let attached = [];
                  let itemKeys = item[def.localKeys] || [];
                  itemKeys = Array.isArray(itemKeys) ? itemKeys : DSUtils.keys(itemKeys);
                  DSUtils.forEach(relatedItems, relatedItem => {
                    if (itemKeys && DSUtils.contains(itemKeys, relatedItem[relationDef.idAttribute])) {
                      attached.push(relatedItem);
                    }
                  });
                  DSUtils.set(item, def.localField, attached);
                });
                return relatedItems;
              });
            } else if (def.type === 'belongsTo' || (def.type === 'hasOne' && def.localKey)) {
              task = this.findAll(resourceConfig.getResource(relationName), {
                where: {
                  [relationDef.idAttribute]: {
                    'in': DSUtils.filter(map(items, item => DSUtils.get(item, def.localKey)), x => x)
                  }
                }
              }, __options).then(relatedItems => {
                DSUtils.forEach(items, item => {
                  DSUtils.forEach(relatedItems, relatedItem => {
                    if (relatedItem[relationDef.idAttribute] === item[def.localKey]) {
                      DSUtils.set(item, def.localField, relatedItem);
                    }
                  });
                });
                return relatedItems;
              });
            }

            if (task) {
              tasks.push(task);
            }
          }
        });
        return DSUtils.Promise.all(tasks);
      }).then(() => items);
  }

  create(resourceConfig, attrs, options) {
    return createTask((resolve, reject) => {
      queueTask(() => {
        let i;
        attrs[resourceConfig.idAttribute] = attrs[resourceConfig.idAttribute] || guid();
        options = options || {};
        this.PUT(
          DSUtils.makePath(this.getIdPath(resourceConfig, options, attrs[resourceConfig.idAttribute])),
          DSUtils.omit(attrs, resourceConfig.relationFields || [])
        ).then(item => {
            i = item;
            return this.ensureId(item[resourceConfig.idAttribute], resourceConfig, options);
          }).then(() => {
            resolve(i);
          }, reject);
      });
    });
  }

  update(resourceConfig, id, attrs, options) {
    return createTask((resolve, reject) => {
      queueTask(() => {
        let i;
        options = options || {};
        this.PUT(
          this.getIdPath(resourceConfig, options, id),
          DSUtils.omit(attrs, resourceConfig.relationFields || [])
        ).then(item => {
            i = item;
            return this.ensureId(item[resourceConfig.idAttribute], resourceConfig, options);
          }).then(() => resolve(i), reject);
      });
    });
  }

  updateAll(resourceConfig, attrs, params, options) {
    return this.findAll(resourceConfig, params, options).then(items => {
      let tasks = [];
      DSUtils.forEach(items, item => {
        tasks.push(this.update(resourceConfig, item[resourceConfig.idAttribute], DSUtils.omit(attrs, resourceConfig.relationFields || []), options));
      });
      return DSUtils.Promise.all(tasks);
    });
  }

  destroy(resourceConfig, id, options) {
    return createTask((resolve, reject) => {
      queueTask(() => {
        options = options || {};
        this.DEL(this.getIdPath(resourceConfig, options, id)).then(() => {
          return this.removeId(id, resourceConfig, options);
        }).then(() => resolve(null), reject);
      });
    });
  }

  destroyAll(resourceConfig, params, options) {
    return this.findAll(resourceConfig, params, options).then(items => {
      var tasks = [];
      DSUtils.forEach(items, item => {
        tasks.push(this.destroy(resourceConfig, item[resourceConfig.idAttribute], options));
      });
      return DSUtils.Promise.all(tasks);
    });
  }
}

module.exports = DSLocalForageAdapter;
