const request = require('supertest');
const app = require('../app');

describe('Tests For Routes',()=>{
  it('the root route should respond to requests',(done)=>{
    request(app)
      .get('/')
      .expect(200,done)
  })
})
