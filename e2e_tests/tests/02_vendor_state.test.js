const request = require('supertest');
const { expect } = require('chai');

const API_URI = 'http://localhost:8000';
const app = request(API_URI);

describe('Domain 2: Vendor Event Integrity', () => {
    let vendorId;
    let eventId;

    before(async () => {
        // Retrieve a valid vendor UUID
        const res = await app.get('/api/users');
        const vendor = res.body.data.find(u => u.role === 'vendor');
        if (!vendor) throw new Error("Pre-flight failure: No vendor entity found in database.");
        vendorId = vendor.user_id;
    });

    it('Path 1: Instantiates an event with absolute capacity invariants', async () => {
        const payload = {
            vendor_id: vendorId,
            title: `SQA Load Test Event ${Date.now()}`,
            total_capacity: 5
        };
        const res = await app.post('/api/vendor/events').send(payload);
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('event_id');
        eventId = res.body.event_id;
    });

    it('Path 2: Validates live state insertion in global inventory', async () => {
        const res = await app.get('/api/events');
        expect(res.status).to.equal(200);
        const eventNode = res.body.data.find(e => e.event_id === eventId);
        expect(eventNode).to.not.be.undefined;
        expect(eventNode.total_capacity).to.equal(5);
        expect(eventNode.available_capacity).to.equal(5); // Initial State Invariant
    });
});