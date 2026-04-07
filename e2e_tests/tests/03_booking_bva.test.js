const request = require('supertest');
const { expect } = require('chai');

// SQA FIX: Explicit host binding to enforce strict API routing
const API_URI = 'http://localhost:8000';
const app = request(API_URI);

describe('Domain 3: Transaction Control Flow & Boundary Value Analysis', () => {
    let customerId, vendorId, eventId;

    before(async () => {
        // 1. Establish Identity Vectors
        const userRes = await app.get('/api/users');
        customerId = userRes.body.data.find(u => u.role === 'customer')?.user_id;
        vendorId = userRes.body.data.find(u => u.role === 'vendor')?.user_id;
        
        if (!customerId || !vendorId) throw new Error("Test Vector Setup Failed: Missing entities.");

        // 2. Establish a Deterministic State Machine Vector
        const eventPayload = {
            vendor_id: vendorId,
            title: `BVA Isolation Event ${Date.now()}`,
            total_capacity: 5
        };
        const eventRes = await app.post('/api/vendor/events').send(eventPayload);
        eventId = eventRes.body.event_id;
        
        if (!eventId) throw new Error("Pre-flight failure: Event initialization failed.");
    });

    describe('Equivalence Partitioning: Valid Boundary (1 <= x <= 10)', () => {
        it('Valid Path: Processes a minimal boundary (1 ticket)', async () => {
            const res = await app.post('/api/bookings').send({
                event_id: eventId, customer_id: customerId, requested_tickets: 1
            });
            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('success'); 
        });

        it('Valid Path: Processes an internal partition value (2 tickets)', async () => {
            const res = await app.post('/api/bookings').send({
                event_id: eventId, customer_id: customerId, requested_tickets: 2
            });
            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('success');
        });
    });

    describe('Boundary Value Analysis: Mathematical Exceptions', () => {
        it('Fault Path: Rejects lower boundary violation (0 tickets)', async () => {
            const res = await app.post('/api/bookings').send({
                event_id: eventId, customer_id: customerId, requested_tickets: 0
            });
            expect(res.status).to.equal(400); 
        });

        it('Fault Path: Rejects upper boundary violation (11 tickets)', async () => {
            const res = await app.post('/api/bookings').send({
                event_id: eventId, customer_id: customerId, requested_tickets: 11
            });
            expect(res.status).to.equal(400); 
        });
    });

    describe('State Machine Capacity Exhaustion', () => {
        it('Fault Path: Prevents booking exceeding available venue capacity', async () => {
            // Mathematical Verification of Exhaustion:
            // Initial Capacity = 5. Valid partitions consumed 3. Remaining = 2.
            const res = await app.post('/api/bookings').send({
                event_id: eventId, customer_id: customerId, requested_tickets: 10
            });
            expect(res.status).to.equal(400);
            expect(res.body.detail).to.match(/Capacity Fault|Constraint/i);
        });
    });
});