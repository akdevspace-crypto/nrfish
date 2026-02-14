import express from "express";
import { pool } from "../configs/db.js";

const pincodeRouter = express.Router();

pincodeRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT pincode FROM delivery_zones');
    const pincodes = result.rows.map(row => row.pincode);
    res.json({ success: true, pincodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery zones' });
  }
});

export default pincodeRouter;
