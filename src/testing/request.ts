import supertest from 'supertest';
import config from '../config';

const localhost = '127.0.0.1';

const request = supertest(`http://${localhost}:${config.api.port}`);

export default request;
