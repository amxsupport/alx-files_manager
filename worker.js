import DBClient from './utils/db';

const Bull = require('bull');
const { ObjectId } = require('mongodb');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');

const fileQueue = new Bull('fileQueue');

const createImageThumbnail = async (path, options) => {
  try {
    const thumbnail = await imageThumbnail(path, options);
    const pathNail = `${path}_${options.width}`;

    await fs.writeFileSync(pathNail, thumbnail);
  } catch (error) {
    console.log(error);
  }
};

