import 'dotenv/config';
import { Cashfree, CFEnvironment } from "cashfree-pg";

console.log("CASHFREE_APP_ID:", process.env.CASHFREE_APP_ID);
console.log("CASHFREE_SECRET_KEY:", process.env.CASHFREE_SECRET_KEY);

try {
    console.log("CFEnvironment:", CFEnvironment);
    console.log("CFEnvironment.SANDBOX:", CFEnvironment ? CFEnvironment.SANDBOX : "undefined");

    const cashfreeInstance = new Cashfree(CFEnvironment.SANDBOX, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);
    console.log("Cashfree initialized successfully");
} catch (error) {
    console.error("Initialization Error:", error);
}
