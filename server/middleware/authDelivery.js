import jwt from 'jsonwebtoken';

const authDelivery = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({ success: false, message: "Not Authorized. Login Again." });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        if (token_decode.role !== 'DELIVERY_PARTNER') {
            return res.json({ success: false, message: "Not Authorized. Delivery Partners Only." });
        }

        req.body.deliveryPartnerId = token_decode.id;
        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authDelivery;
