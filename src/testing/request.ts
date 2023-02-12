import supertest from 'supertest';

const localhost = '127.0.0.1';
const port = process.env.PORT!;

const request = supertest(`http://${localhost}:${port}`);

export default request;
