import sha1 from 'sha1';
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';

const { ObjectId } = require('mongodb');

class UsersController {
  static async postNew(request, response) {
    const userEmail = request.body.email;
    if (!userEmail) return response.status(400).send({ error: 'Missing email' });

    const userPassword = request.body.password;
    if (!userPassword) return response.status(400).send({ error: 'Missing password' });

    const oldUserEmail = await DBClient.db
      .collection('users')
      .findOne({ email: userEmail });
    if (oldUserEmail) return response.status(400).send({ error: 'Already exist' });

    const shaUserPassword = sha1(userPassword);
    const result = await DBClient.db
      .collection('users')
      .insertOne({ email: userEmail, password: shaUserPassword });

    return response
      .status(201)
      .send({ id: result.insertedId, email: userEmail });
  }
