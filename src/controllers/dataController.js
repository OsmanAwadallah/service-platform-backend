const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { loadAllJson } = require('../utils/dataLoader');

const FRONTEND_DATA_PATH = process.env.FRONTEND_DATA_PATH || path.join(__dirname, '..', '..', 'frontend', 'data');

let memoryStore = loadAllJson(FRONTEND_DATA_PATH);

function getModel(collectionName) {
  if (!process.env.MONGO_URI) return null;
  if (mongoose.models[collectionName]) return mongoose.models[collectionName];
  const schema = new mongoose.Schema({}, { strict: false, timestamps: true, collection: collectionName });
  return mongoose.model(collectionName, schema);
}

async function seedToDbIfNeeded() {
  if (!process.env.MONGO_URI) return;
  if (process.env.SEED_DB !== 'true' && process.env.SEED_DB !== '1') return;
  for (const [table, items] of Object.entries(memoryStore)) {
    const Model = getModel(table);
    if (!Model) continue;
    const count = await Model.countDocuments();
    if (count === 0 && Array.isArray(items) && items.length > 0) {
      const docs = items.map(it => {
        if (!it._id) {
          it._id = new mongoose.Types.ObjectId();
        }
        return it;
      });
      await Model.insertMany(docs);
      console.log(`Seeded ${docs.length} documents into ${table}`);
    }
  }
}

seedToDbIfNeeded().catch(err => console.error('Seeding error', err));

function paginate(array, page = 1, limit = 20) {
  page = Math.max(1, parseInt(page));
  limit = Math.max(1, parseInt(limit));
  const start = (page - 1) * limit;
  return array.slice(start, start + limit);
}

const list = async (req, res) => {
  const table = req.params.table;
  const q = req.query.q;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const sort = req.query.sort;

  const Model = getModel(table);
  if (Model) {
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    let query = Model.find(filter);
    if (sort) query = query.sort(sort);
    const total = await Model.countDocuments(filter);
    const items = await query.skip((page - 1) * limit).limit(parseInt(limit)).exec();
    return res.json({ success: true, meta: { page: parseInt(page), limit: parseInt(limit), total }, data: items });
  }

  const items = memoryStore[table] || [];
  let result = items;
  if (q) {
    const ql = q.toLowerCase();
    result = items.filter(it => JSON.stringify(it).toLowerCase().includes(ql));
  }
  if (sort) {
    const [field, order] = sort.split(':');
    result = result.sort((a, b) => {
      if (a[field] < b[field]) return order === 'desc' ? 1 : -1;
      if (a[field] > b[field]) return order === 'desc' ? -1 : 1;
      return 0;
    });
  }
  const paged = paginate(result, page, limit);
  res.json({ success: true, meta: { page: parseInt(page), limit: parseInt(limit), total: result.length }, data: paged });
};

const getOne = async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  const Model = getModel(table);
  if (Model) {
    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  }
  const items = memoryStore[table] || [];
  const found = items.find(it => String(it._id || it.id) === String(id));
  if (!found) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: found });
};

const createOne = async (req, res) => {
  const table = req.params.table;
  const payload = req.body;
  const Model = getModel(table);
  if (Model) {
    const doc = await Model.create(payload);
    return res.status(201).json({ success: true, data: doc });
  }
  memoryStore[table] = memoryStore[table] || [];
  const id = (new Date()).getTime().toString();
  const item = Object.assign({}, payload, { _id: id });
  memoryStore[table].push(item);
  res.status(201).json({ success: true, data: item });
};

const updateOne = async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  const payload = req.body;
  const Model = getModel(table);
  if (Model) {
    const doc = await Model.findByIdAndUpdate(id, payload, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  }
  const items = memoryStore[table] || [];
  const idx = items.findIndex(it => String(it._id || it.id) === String(id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  memoryStore[table][idx] = Object.assign({}, memoryStore[table][idx], payload);
  res.json({ success: true, data: memoryStore[table][idx] });
};

const deleteOne = async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  const Model = getModel(table);
  if (Model) {
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  }
  const items = memoryStore[table] || [];
  const idx = items.findIndex(it => String(it._id || it.id) === String(id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  memoryStore[table].splice(idx, 1);
  res.json({ success: true, message: 'Deleted' });
};

module.exports = { list, getOne, createOne, updateOne, deleteOne };