import { v4 as uuidv4 } from 'uuid';
import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

const { ObjectId } = require('mongodb');
const fs = require('fs');
const mime = require('mime-types');
const Bull = require('bull');

class FilesController {
  static async postUpload(req, res) {
    const fileQueue = new Bull('fileQueue');

    const token = req.header('X-Token') || null;
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const redisToken = await RedisClient.get(`auth_${token}`);
    if (!redisToken) return res.status(401).send({ error: 'Unauthorized' });

    const user = await DBClient.db
      .collection('users')
      .findOne({ _id: ObjectId(redisToken) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const fileName = req.body.name;
    if (!fileName) return res.status(400).send({ error: 'Missing name' });

    const fileType = req.body.type;
    if (!fileType || !['folder', 'file', 'image'].includes(fileType)) return res.status(400).send({ error: 'Missing type' });

    const fileData = req.body.data;
    if (!fileData && ['file', 'image'].includes(fileType)) return res.status(400).send({ error: 'Missing data' });

    const fileIsPublic = req.body.isPublic || false;
    let idParent = req.body.parentId || 0;
    idParent = idParent === '0' ? 0 : idParent;
    if (idParent !== 0) {
      const parentFile = await DBClient.db
        .collection('files')
        .findOne({ _id: ObjectId(idParent) });
      if (!parentFile) return res.status(400).send({ error: 'Parent not found' });
      if (!['folder'].includes(parentFile.type)) return res.status(400).send({ error: 'Parent is not a folder' });
    }
