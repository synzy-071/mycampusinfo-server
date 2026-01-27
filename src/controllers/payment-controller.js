import crypto from "crypto";
import Razorpay from "razorpay";
import Form from "../models/application/form-model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ status: "failed", message: "Form not found" });

    const options = {
      amount: form.amount * 100, // convert to paise
      currency: "INR",
      receipt: `form_${formId}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Store only the orderId for now
    form.paymentInfo.orderId = order.id;
    form.paymentInfo.status = "created";
    await form.save();

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { formId } = req.params;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ status: "failed", message: "Form not found" });

    // Signature check
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ status: "failed", message: "Invalid signature" });
    }

    // Update form as paid
    form.payment = "Paid";
    form.paymentInfo = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "captured",
    };

    await form.save();

    res.status(200).json({ status: "success", message: "Payment verified successfully" });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};