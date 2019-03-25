'use strict';

require('dotenv').config();
const GoogleDatastore = require('@google-cloud/datastore');
const googledatastore = new GoogleDatastore({ projectId: process.env.PROJECT_ID, namespace: process.env.NAMESPACE });

// private functions
const _idExtration = (item) => {
  if (!item) {
    return item;
  }

  item.id = parseInt(item[googledatastore.KEY].id);

  return (item);
};

class Datastore {
  // collection <-> kind

  constructor(collectionName) {
    if(collectionName) this.collection = collectionName;
  }

  static set collection(value) {
    this.collection = value;
  }

  static set excludeFromIndexes(value) {
    this.excludeFromIndexes = value;
  }

  findById(id) {

    let taskKey;

    if (Array.isArray(id)) {

      if (id.length == 0) {
        return id;
      }

      taskKey = id.map(_id => {
        _id = parseInt(_id);
        return googledatastore.key([this.collection, _id]);
      });

    } else {

      if (!id) {
        return null;
      }

      id = parseInt(id);
      taskKey = googledatastore.key([this.collection, id]);

    }

    return new Promise((resolve, reject) => {

      googledatastore.get(taskKey).then(results => {
        if (Array.isArray(results[0])) {
          let items = results[0];
          resolve(items.map(item => _idExtration(item)));
        } else {
          resolve(_idExtration(results[0]));
        }
      })
        .catch((error) => {
          reject(error);
        });

    });
  }

  async findBy(field, value) {

    const result = await this.find({
      filter: {
        prefix: field,
        operator: '=',
        suffix: value
      }
    });

    return result.items;
  }

  async findOneBy(field, value) {

    const result = await this.find({
      filter: {
        prefix: field,
        operator: '=',
        suffix: value
      },
      limit: 1,
    });

    return result.items.length > 0 ? result.items[0] : null;
  }

  find(params) {
    let select, filter, filters, order, limit, cursor, itemsField;

    select = params.select;
    filter = params.filter;
    filters = params.filters;
    order = params.order;
    limit = params.limit;
    cursor = params.cursor;
    // the name of the property that contains returning item
    // helpful in constructing response body
    // default to 'items'
    itemsField = params.itemsField || 'items';
    // item transformer, each item will be transformed by this function
    // helpful filtering out some unwanted properties

    const query = googledatastore.createQuery(this.collection);

    if (filter) {
      query.filter(filter.prefix, filter.operator, filter.suffix);
    }

    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        query.filter(filter.prefix, filter.operator, filter.suffix);
      });
    }

    if (order) {
      query.order(order);
    }

    if (select) {
      query.select(select);
    }

    if (limit) {
      query.limit(limit);
    }

    if (cursor) {
      query.start(cursor);
    }

    if (params.sort_NewToOld) {
      query.order('timestamp', {
        descending: true,
      });
    }

    if (params.sort_OldToNew) {
      query.order('timestamp', {
        descending: false,
      });
    }

    return new Promise((resolve, reject) => {

      googledatastore
        .runQuery(query)
        .then(results => {

          const task = {};

          task[itemsField] = results[0].map(_idExtration);
          task.itemsCount = task[itemsField].length;

          if (limit || cursor) {
            let hasMore = results[1].moreResults === 'MORE_RESULTS_AFTER_LIMIT';
            task.more = hasMore;
            task.continue_cursor = hasMore ? results[1].endCursor : '';
            task.limit = limit;
          }

          resolve(task);
        })
        .catch(err => {
          console.error('ERROR:', err);
          reject(err);
        });
    });
  }

  create(data) {
    data.created_at = new Date().getTime();
    data.updated_at = new Date().getTime();
    let entity, key, addKindData;

    key = googledatastore.key([this.collection]);

    entity = {
      key: key,
      data: data
    };

    entity.method = "insert";

    return new Promise((resolve, reject) => {

      googledatastore
        .save(entity)
        .then(() => {

          addKindData = data;
          addKindData.id = parseInt(entity.key.id);

          resolve(addKindData);

        })
        .catch(err => {
          reject(err);
        });

    });
  }

  update(params) {

    let editData, transaction, taskKey, id, data;

    id = params.id;
    id = parseInt(id);
    data = params.data;
    data.updated_at = new Date().getTime();

    transaction = googledatastore.transaction();
    taskKey = googledatastore.key([this.collection, id]);

    return new Promise((resolve, reject) => {

      transaction
        .run()
        .then(() => transaction.get(taskKey))
        .then(results => {

          const task = results[0];
          const updateData = Object.assign({}, task, data);

          const entity = {

            key: taskKey,
            data: updateData

          };

          if (this.excludeFromIndexes){
            entity.excludeFromIndexes = this.excludeFromIndexes;
          }

          transaction.save(entity);
          return transaction.commit();

        })
        .then(() => {

          editData = data;
          editData.id = id;

          resolve(editData);
        })
        .catch((err) => {
          reject(err);
          transaction.rollback();
        }
        );

    });
  }

  createUnique(uniqueKeys) {

    let entity, key, addKindData;

    key = googledatastore.key([this.collection]);

    entity = {
      key: key,
      data: uniqueKeys
    };

    return new Promise((resolve, reject) => {

      googledatastore
        .upsert(entity)
        .then(() => {

          addKindData = uniqueKeys;
          addKindData.id = entity.key.id;

          resolve(addKindData);

        })
        .catch(err => {
          reject(err);
        });

    });
  }

  delete(id) {

    let taskKey, msg;

    if (Array.isArray(id)) {

      taskKey = id.map(_id => {
        _id = parseInt(_id);
        return googledatastore.key([this.collection, _id]);
      });
      msg = 'Entities deleted successfully.';

    } else {

      taskKey = googledatastore.key([this.collection, id]);
      msg = 'Entity ${id} deleted successfully.';
    }


    return new Promise((resolve, reject) => {

      googledatastore
        .delete(taskKey)
        .then(() => {
          resolve(msg);
        })
        .catch(err => {
          console.error('ERROR:', err);
          reject(err);
        });

    });
  }
}


module.exports = Datastore;