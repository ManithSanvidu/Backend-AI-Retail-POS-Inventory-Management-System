const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

class CustomerService {

    // CREATE CUSTOMER
    async createCustomer(data) {
        return await Customer.create(data);
    }

    // GET ALL CUSTOMERS + SEARCH (name, email, phone)
    async getAllCustomers(search = "") {

        const query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        return await Customer.find(query)
            .populate("preferredBranch")
            .sort({ createdAt: -1 });
    }

    // GET ONE CUSTOMER
    async getCustomerById(id) {
        return await Customer.findById(id)
            .populate("preferredBranch");
    }

    // UPDATE CUSTOMER
    async updateCustomer(id, data) {
        return await Customer.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }

    // DELETE CUSTOMER
    async deleteCustomer(id) {
        return await Customer.findByIdAndDelete(id);
    }

    /* // PURCHASE HISTORY (FROM SALE MODULE)
    async getPurchaseHistory(customerId) {

        return await Sale.find({ customer: customerId })
            .populate("items.product")
            .populate("branch")
            .sort({ createdAt: -1 });
    }

    // LOYALTY POINT UPDATE (CALLED FROM POS)
    async addLoyaltyPoints(customerId, amount) {

        const points = Math.floor(amount / 1000);

        return await Customer.findByIdAndUpdate(
            customerId,
            {
                $inc: {
                    loyaltyPoints: points,
                    totalPurchases: amount
                }
            },
            { new: true }
        );
    }

    // ANALYTICS
    async getAnalytics() {

        const totalCustomers = await Customer.countDocuments();

        const topCustomers = await Customer.find()
            .sort({ totalPurchases: -1 })
            .limit(5);

        const totalLoyaltyUsers = await Customer.countDocuments({
            loyaltyPoints: { $gt: 0 }
        });

        return {
            totalCustomers,
            totalLoyaltyUsers,
            topCustomers
        };
    } */
}

module.exports = new CustomerService();