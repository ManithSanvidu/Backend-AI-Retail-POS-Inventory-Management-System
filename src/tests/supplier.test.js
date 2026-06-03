const assert = require('node:assert/strict');
const test = require('node:test');
const mongoose = require('mongoose');

const app = require('../app');
const Supplier = require('../models/Supplier');

const request = async (server, path, options) => {
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, options);
  const body = await response.json();

  return { body, status: response.status };
};

// 1. SCHEMA VALIDATION TESTS
test('Supplier Schema validation succeeds with valid details', () => {
  const validSupplier = new Supplier({
    companyName: 'Harvest Co.',
    contactPerson: 'John Doe',
    email: 'john@harvest.com',
    phone: '+94771234567',
    address: '123 Main Street, Colombo',
    category: 'Grains & Rice',
    taxId: 'TIN-12345678',
    status: 'Active',
    transactions: [
      {
        id: 'PO-2026-104',
        date: '2026-06-03',
        itemsCount: 15,
        amount: 25000,
        status: 'Delivered'
      }
    ]
  });

  const err = validSupplier.validateSync();
  assert.equal(err, undefined);
  
  // Verify defaults
  assert.equal(validSupplier.rating, 5.0);
  assert.equal(validSupplier.totalSpend, 0);
  assert.equal(validSupplier.performance.onTimeDelivery, 95);
  assert.equal(validSupplier.performance.qualityScore, 95);
  assert.equal(validSupplier.performance.leadTimeDays, 3);
  assert.equal(validSupplier.performance.returnRate, 0.0);
});

test('Supplier Schema validation fails when required fields are missing', () => {
  const invalidSupplier = new Supplier({});
  const err = invalidSupplier.validateSync();
  
  assert.ok(err);
  assert.ok(err.errors.companyName);
  assert.ok(err.errors.contactPerson);
  assert.ok(err.errors.email);
  assert.ok(err.errors.phone);
  assert.ok(err.errors.address);
  assert.ok(err.errors.category);
  assert.ok(err.errors.taxId);
});

test('Supplier Schema validation fails with invalid email format', () => {
  const invalidEmailSupplier = new Supplier({
    companyName: 'Harvest Co.',
    contactPerson: 'John Doe',
    email: 'invalid-email-format',
    phone: '+94771234567',
    address: '123 Main Street, Colombo',
    category: 'Grains & Rice',
    taxId: 'TIN-12345678'
  });

  const err = invalidEmailSupplier.validateSync();
  assert.ok(err);
  assert.ok(err.errors.email);
  assert.match(err.errors.email.message, /valid email address/);
});

test('Supplier Schema validation fails with invalid category enum value', () => {
  const invalidCategorySupplier = new Supplier({
    companyName: 'Harvest Co.',
    contactPerson: 'John Doe',
    email: 'john@harvest.com',
    phone: '+94771234567',
    address: '123 Main Street, Colombo',
    category: 'Fast Food', // Not in enum
    taxId: 'TIN-12345678'
  });

  const err = invalidCategorySupplier.validateSync();
  assert.ok(err);
  assert.ok(err.errors.category);
  assert.match(err.errors.category.message, /is not a valid category/);
});

test('Supplier Schema validation fails with invalid status enum value', () => {
  const invalidStatusSupplier = new Supplier({
    companyName: 'Harvest Co.',
    contactPerson: 'John Doe',
    email: 'john@harvest.com',
    phone: '+94771234567',
    address: '123 Main Street, Colombo',
    category: 'Grains & Rice',
    taxId: 'TIN-12345678',
    status: 'Suspended' // Not in enum
  });

  const err = invalidStatusSupplier.validateSync();
  assert.ok(err);
  assert.ok(err.errors.status);
  assert.match(err.errors.status.message, /is not a valid status/);
});

// 2. HTTP ENDPOINT TESTS (DATABASE OFFLINE)
test('GET /api/suppliers returns empty array before MongoDB connects', async () => {
  const server = app.listen(0);

  try {
    const response = await request(server, '/api/suppliers');

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.count, 0);
    assert.deepEqual(response.body.data, []);
  } finally {
    server.close();
  }
});

test('POST /api/suppliers returns 503 status before MongoDB connects', async () => {
  const server = app.listen(0);

  try {
    const response = await request(server, '/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Harvest Co.',
        contactPerson: 'John Doe',
        email: 'john@harvest.com',
        phone: '+94771234567',
        address: '123 Main Street, Colombo',
        category: 'Grains & Rice',
        taxId: 'TIN-12345678'
      })
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /MongoDB is not connected/);
  } finally {
    server.close();
  }
});

test('GET /api/suppliers/:id returns 503 status before MongoDB connects', async () => {
  const server = app.listen(0);
  const dummyId = new mongoose.Types.ObjectId().toString();

  try {
    const response = await request(server, `/api/suppliers/${dummyId}`);

    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /MongoDB is not connected/);
  } finally {
    server.close();
  }
});

test('PUT /api/suppliers/:id returns 503 status before MongoDB connects', async () => {
  const server = app.listen(0);
  const dummyId = new mongoose.Types.ObjectId().toString();

  try {
    const response = await request(server, `/api/suppliers/${dummyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'New Name' })
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /MongoDB is not connected/);
  } finally {
    server.close();
  }
});

test('DELETE /api/suppliers/:id returns 503 status before MongoDB connects', async () => {
  const server = app.listen(0);
  const dummyId = new mongoose.Types.ObjectId().toString();

  try {
    const response = await request(server, `/api/suppliers/${dummyId}`, {
      method: 'DELETE'
    });

    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /MongoDB is not connected/);
  } finally {
    server.close();
  }
});
