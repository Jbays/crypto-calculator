const request = require('supertest');
const expect = require('chai').expect;
const app = require('../app');

describe('Tests For Routes',()=>{
  it('the root route should respond to requests',(done)=>{
    request(app)
      .get('/')
      .expect(200,done)
  })
  it('random routes should return 404',(done)=>{
    request(app)
      .get('/random')
      .expect(404,done);
  })
})
