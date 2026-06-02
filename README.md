# Backend API - Retail POS & Inventory Management System

This is the central Node.js & Express backend for the AI-Powered Multi-Branch Retail POS & Inventory Management System.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Cluster (or local MongoDB instance)

### 1. Installation
Run the following command in this directory to install the required dependencies:
```bash
npm install
```

### 2. Environment Variables
You must create a `.env` file in the root of this backend directory. Include the following keys:
```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster1.gpz0msi.mongodb.net/?appName=Cluster1

# Server Port
PORT=5000

# Email Delivery Configuration (Used by Notification Service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false

# Twilio SMS Configuration (Used by Notification Service)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Running the Server
To start the server in development mode (which uses `nodemon` for auto-reloading):
```bash
npm run dev
```
The server will start on `http://localhost:5000` by default.

---

## 📁 Directory Structure
- `/src/models` - Mongoose database schemas (e.g., `Notification.js`)
- `/src/controllers` - Request handlers for REST APIs
- `/src/routes` - Express route definitions
- `/src/services` - Core business logic and integrations
- `/src/sockets` - Real-time Socket.IO handlers for WebSockets
- `/src/events` - Central `eventBus.js` for decoupled module communication
- `/src/utils` - Reusable helpers (e.g., `emailSender.js`)

---

## 🔔 Notifications & Alert Module Integration
This backend utilizes a centralized Notifications Service. To prevent tight coupling, other modules (Inventory, Sales, etc.) should **NOT** import the `NotificationService` directly. Instead, they should use the Event Bus.

**How to trigger a system alert from another module:**
```javascript
const systemEvents = require('../events/eventBus'); // Adjust path as needed

systemEvents.emit('SEND_ALERT', {
  userId: "mongodb_user_object_id", // The target recipient
  title: "Low Stock Alert",
  message: "Product XYZ is below the threshold.",
  type: "WARNING", // INFO, WARNING, ALERT, SUCCESS
  channels: ['in-app', 'email'] // Specify delivery methods
});
```

### Available REST Endpoints (For the Frontend Dashboard)
- `GET /api/notifications` - Fetch notification history for the current user.
- `PUT /api/notifications/:id/read` - Mark a specific alert as read.
- `PUT /api/notifications/read-all` - Mark all alerts as read.
- `GET /api/notifications/preferences` - Get user alert settings.
- `PUT /api/notifications/preferences` - Update user alert settings.
