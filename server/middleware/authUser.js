import jwt from "jsonwebtoken";

async function authUser(req, res, next) {
    const { token } = req.cookies;
  
    if (!token) {
      return res.json({ success: false, message: 'Not Authorized' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.id) {
        req.userId = decoded.id; // ✅ use a custom property on req
        next();
      } else {
        return res.json({ success: false, message: 'Not Authorized' });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  }
  
  export default authUser;