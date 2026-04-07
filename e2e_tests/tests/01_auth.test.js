const request = require('supertest');
const { expect } = require('chai');

const API_URI = 'http://localhost:8000/api';
const app = request(API_URI);

describe('Domain 1: User Authentication & Role Constraints', () => {
    const timestamp = Date.now();
    const vendorPayload = {
        username: `vendor_${timestamp}`,
        email: `vendor_${timestamp}@test.local`,
        password: 'securepassword',
        role: 'vendor'
    };

    it('Path 1: Successfully initializes a vendor entity', async () => {
        const res = await app.post('/signup').send(vendorPayload);
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('user_id');
        expect(res.body.user_id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('Path 2: Mathematically rejects duplicate uniqueness parameters', async () => {
        const res = await app.post('/signup').send(vendorPayload);
        expect(res.status).to.equal(400);
        expect(res.body.detail).to.include('already exists');
    });

    it('Path 3: Authenticates identity and returns access payload', async () => {
        const res = await app.post('/login')
            .type('form')
            .send({ username: vendorPayload.username, password: vendorPayload.password });
        expect(res.status).to.equal(200);
        expect(res.body.role).to.equal('vendor');
    });
});