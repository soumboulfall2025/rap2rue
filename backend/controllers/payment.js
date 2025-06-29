const paydunya = require("paydunya");
const { setup, store } = require("../config/paydunyaConfig.js");
const Order = require("../models/Order.js");
const User = require("../models/User.js");

// Placing order using paydunya method
const placeOrderPaydunya = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Aucune musique dans la commande." });
        }
        const invoice = new paydunya.CheckoutInvoice(setup, store);
        items.forEach(item => {
            invoice.addItem(
                item.name || "Musique",
                item.quantity || 1,
                item.price || 1000,
                (item.price || 1000) * (item.quantity || 1),
                item.description || ""
            );
        });
        invoice.description = "Achat de musique sur RAP2RUE";
        invoice.totalAmount = amount;
        invoice.create()
            .then(async () => {
                if ((invoice.status === "created" || invoice.status === "pending") && invoice.url) {
                    const userId = req.user.id;
                    const orderData = {
                        userId,
                        items,
                        amount,
                        address,
                        paymentMethod: "paydunya",
                        payment: false,
                        date: Date.now(),

                        // Nouveau : infos PayDunya
                        paydunyaInvoiceId: invoice.token,
                        paydunyaResponse: invoice
                    };

                    // Vérification de la présence de musicId pour chaque item
                    for (const item of items) {
                        if (!item.musicId) {
                            return res.status(400).json({
                                success: false,
                                message: "Chaque musique doit avoir un musicId."
                            });
                        }
                    }

                    const newOrder = new Order(orderData);
                    await newOrder.save();
                    // Parrainage (optionnel, à adapter si besoin)
                    const user = await User.findById(userId);
                    if (user && user.referredBy) {
                        const ordersCount = await Order.countDocuments({ userId });
                        if (ordersCount === 1) {
                            await User.findOneAndUpdate(
                                { referralCode: user.referredBy },
                                { $inc: { points: 100 } }
                            );
                        }
                    }
                    return res.json({
                        success: true,
                        message: 'Facture générée avec succès',
                        redirectUrl: invoice.url
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        message: invoice.responseText || "Erreur PayDunya"
                    });
                }
            })
            .catch((e) => {
                return res.status(500).json({
                    success: false,
                    message: "Erreur serveur PayDunya",
                    error: e.message
                });
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Erreur serveur PayDunya",
            error: error.message
        });
    }
};

module.exports = { placeOrderPaydunya };
