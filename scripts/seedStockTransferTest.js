require("dotenv").config();
const connectDB = require("../src/config/db");
const Branch = require("../src/models/Branch");
const Product = require("../src/models/Product");
const Inventory = require("../src/models/Inventory");
const User = require("../src/models/User");

const run = async () => {
    await connectDB();

    const fromBranch = await Branch.findOneAndUpdate(
        { code: "BR-001" },
        { name: "Colombo Main", code: "BR-001", city: "Colombo", isActive: true },
        { upsert: true, new: true }
    );

    const toBranch = await Branch.findOneAndUpdate(
        { code: "BR-002" },
        { name: "Kandy Branch", code: "BR-002", city: "Kandy", isActive: true },
        { upsert: true, new: true }
    );

    const product = await Product.findOneAndUpdate(
        { barcode: "TEST-PROD-001" },
        {
            name: "Test Product",
            barcode: "TEST-PROD-001",
            price: 100,
            costPrice: 70,
            isActive: true
        },
        { upsert: true, new: true }
    );

    await Inventory.findOneAndUpdate(
        { branch: fromBranch._id, product: product._id },
        { quantity: 50, reservedStock: 0, lowStockAlert: false },
        { upsert: true, new: true }
    );

    let adminUser = await User.findOne({ email: "admin@test.com" });
    if (!adminUser) {
        adminUser = await User.create({
            firstName: "Stock",
            lastName: "Admin",
            email: "admin@test.com",
            password: "Admin@123",
            role: "ADMIN",
            isActive: true
        });
    }

    console.log("\nLogin first (Postman):");
    console.log("POST http://localhost:5001/api/auth/login");
    console.log(JSON.stringify({ email: "admin@test.com", password: "Admin@123" }, null, 2));
    console.log("\nThen set Header: Authorization = Bearer <token>\n");

    console.log("Use these IDs in Postman (Create Transfer):\n");
    console.log(JSON.stringify(
        {
            fromBranch: fromBranch._id.toString(),
            toBranch: toBranch._id.toString(),
            items: [{ product: product._id.toString(), quantity: 2 }],
            notes: "Postman test transfer"
        },
        null,
        2
    ));
    console.log("\nPOST http://localhost:5001/api/stock-transfers\n");

    process.exit(0);
};

run().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
