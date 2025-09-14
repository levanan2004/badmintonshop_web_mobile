const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Account = require("../models/Account");
const qs = require("qs");
const crypto = require("crypto");
const VnpayTransaction = require("../models/VnpayTransaction");
const SECRET_KEY = "saddasdasadsasdadsas";
const axios = require("axios");
const vnpayConfig = require("../../config/vnpayConfig"); // Thêm dòng này
exports.getCustomerData = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token không được cung cấp" });
  }
  try {
    const user = jwt.verify(token, SECRET_KEY);

    const customer = await Customer.findOne({
      where: { CustomerId: user.customerid },
    });
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    }
    res.json({
      Firstname: customer.Firstname,
      Lastname: customer.Lastname,
      Address: customer.Address,
      Mobile: customer.Mobile,
      Email: customer.Email,
    });
  } catch (err) {
    console.error("Error in getCustomerData:", err);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Xử lý thanh toán và tạo đơn hàng
exports.checkout = async (req, res) => {
  const { cart, paymentMethod, address, mobile, email, firstname, lastname } =
    req.body;

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token không được cung cấp" });
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user;

    // Lấy thông tin khách hàng từ DB
    const customer = await Customer.findOne({
      where: { CustomerId: user.customerid },
    });

    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    }

    // Lấy thông tin account từ DB
    const account = await Account.findOne({
      where: { AccountId: user.userId },
    });

    // Debug giá trị nhận được và giá trị hiện tại

    // Nếu có địa chỉ hoặc số điện thoại mới, cập nhật vào Customer và Account
    let needUpdateCustomer = false;
    let needUpdateAccount = false;
    if (address && address !== customer.Address) {
      customer.Address = address;
      needUpdateCustomer = true;
    }
    if (mobile && mobile !== customer.Mobile) {
      customer.Mobile = mobile;
      needUpdateCustomer = true;
    }
    if (account) {
      if (address && address !== account.Address) {
        account.Address = address;
        needUpdateAccount = true;
      }
      if (mobile && mobile !== account.Mobile) {
        account.Mobile = mobile;
        needUpdateAccount = true;
      }
    }
    if (needUpdateCustomer) {
      await customer.save();
    }
    if (needUpdateAccount) {
      await account.save();
    }

    // Tính tổng tiền giỏ hàng (SubPrice)
    const subPrice = cart.reduce(
      (acc, item) => acc + item.Price * item.Quantity,
      0
    );
    const discount = 2;
    const newOrder = await Order.create({
      CustomerId: customer.CustomerId,
      PaymentMethod: paymentMethod,
      Address: address || customer.Address,
      Mobile: mobile || customer.Mobile,
      Email: email || customer.Email,
      Firstname: firstname || customer.Firstname,
      Lastname: lastname || customer.Lastname,
      TotalPrice: subPrice,
      SubPrice: subPrice,
      Discount: discount,
      CreateAt: new Date(),
      OrderStatusId: 3,
    });

    if (!newOrder.OrderId) {
      return res.status(400).json({ message: "Không thể tạo đơn hàng." });
    }

    // Tạo các chi tiết đơn hàng, thêm Size
    const orderDetails = cart.map((item) => ({
      OrderId: newOrder.OrderId,
      ProductId: item.ProductId,
      Quantity: item.Quantity,
      Size: item.Size || null,
    }));

    for (let i = 0; i < orderDetails.length; i++) {
      await OrderDetail.create({
        OrderId: orderDetails[i].OrderId,
        ProductId: orderDetails[i].ProductId,
        Quantity: orderDetails[i].Quantity,
        Size: orderDetails[i].Size,
      });
    }

    res.status(201).json({
      message: "Đơn hàng đã được tạo thành công!",
      orderId: newOrder.OrderId,
      totalAmount: newOrder.TotalPrice,
      orderDate: newOrder.CreateAt,
      customer: {
        Address: customer.Address,
        Mobile: customer.Mobile,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

//Thanh toán MoMo
exports.createMoMoPaymentUrl = async (req, res) => {
  try {
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    const redirectUrl = `${
      process.env.API_SERVER || "http://localhost:3000"
    }/momo_return`;
    const ipnUrl = `${
      process.env.API_SERVER || "http://localhost:3000"
    }/momo_ipn`;
    const requestType = "captureWallet";

    // Lấy token và giải mã user
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Token không được cung cấp" });
    }
    let user;
    try {
      user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Lấy thông tin customer từ DB
    const customer = await Customer.findOne({
      where: { CustomerId: user.customerid },
    });
    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    }

    // Nhận thông tin đơn hàng từ client
    const {
      amount,
      orderInfo,
      cart,
      address,
      mobile,
      email,
      firstname,
      lastname,
    } = req.body;

    // 1. Lưu đơn hàng vào database với CustomerId
    const newOrder = await Order.create({
      CustomerId: customer.CustomerId,
      PaymentMethod: "momo",
      Address: address || customer.Address,
      Mobile: mobile || customer.Mobile,
      Email: email || customer.Email,
      Firstname: firstname || customer.Firstname,
      Lastname: lastname || customer.Lastname,
      TotalPrice: amount,
      SubPrice: amount,
      Discount: 0,
      CreateAt: new Date(),
      OrderStatusId: 3,
    });

    // 2. Lưu chi tiết đơn hàng
    if (cart && Array.isArray(cart)) {
      const orderDetails = cart.map((item) => ({
        OrderId: newOrder.OrderId,
        ProductId: item.ProductId,
        Quantity: item.Quantity,
        Size: item.Size || null,
      }));

      for (let i = 0; i < orderDetails.length; i++) {
        await OrderDetail.create({
          OrderId: orderDetails[i].OrderId,
          ProductId: orderDetails[i].ProductId,
          Quantity: orderDetails[i].Quantity,
          Size: orderDetails[i].Size,
        });
      }
    }

    // 3. Tạo orderId duy nhất cho MoMo (không dùng OrderId trong DB)
    const orderId = `ORDER_${newOrder.OrderId}_${Date.now()}`;
    const requestId = Date.now().toString();

    // 4. Tạo link thanh toán MoMo như cũ
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${
      orderInfo || "Thanh toán đơn hàng"
    }&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo: orderInfo || "Thanh toán đơn hàng",
      redirectUrl,
      ipnUrl,
      extraData: "",
      requestType,
      signature,
      lang: "vi",
    };

    const response = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data && response.data.payUrl) {
      res.json({ payUrl: response.data.payUrl });
    } else {
      res.status(400).json({
        message: "Không tạo được link thanh toán MoMo",
        momoResponse: response.data,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tạo link thanh toán MoMo",
      error: error.message,
      momoResponse: error.response?.data,
    });
  }
};

// ===== ENV =====
const vnp_TmnCode = (process.env.VNP_TMN_CODE || "31IY64MS").trim();
const vnp_HashSecret = (
  process.env.VNP_HASH_SECRET || "6CWYMYU82JHFE6SP7FKDFTRLKXEKLIIJ"
).trim();
const vnp_Url = (
  process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
).trim();
const vnp_ReturnUrl = (
  process.env.VNP_RETURN_URL ||
  `${process.env.API_SERVER || "http://localhost:3000"}/checkout/vnpay_return`
).trim();
const FE_BASE = (process.env.API_CLIENT || "http://localhost:3001").trim();

// ===== Helpers chung =====
// encode theo application/x-www-form-urlencoded (space -> '+')
const enc = (s) => encodeURIComponent(String(s)).replace(/%20/g, "+");
// encode dùng để VERIFY Return/IPN (an toàn với dấu '+')
const encReturn = (s) =>
  encodeURIComponent(String(s).replace(/\+/g, " ")).replace(/%20/g, "+");

const buildSignData = (params) =>
  Object.keys(params)
    .sort()
    .map((k) => `${k}=${enc(params[k])}`)
    .join("&");

const buildQueryString = (params) =>
  Object.keys(params)
    .sort()
    .map((k) => `${enc(k)}=${enc(params[k])}`)
    .join("&");

const pad = (n) => (n < 10 ? "0" + n : "" + n);
const formatVNDateYYYYMMDDHHmmss = (d = new Date()) => {
  const VN_OFFSET_MIN = 7 * 60;
  const localOffsetMin = d.getTimezoneOffset();
  const diffMin = VN_OFFSET_MIN + localOffsetMin;
  const vn = new Date(d.getTime() + diffMin * 60 * 1000);
  return (
    vn.getFullYear().toString() +
    pad(vn.getMonth() + 1) +
    pad(vn.getDate()) +
    pad(vn.getHours()) +
    pad(vn.getMinutes()) +
    pad(vn.getSeconds())
  );
};

const sanitizeOrderInfo = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
    .replace(/[^a-zA-Z0-9\s,.:#\-_/]/g, "")
    .trim();

const getClientIp = (req) => {
  let ip = req.headers["x-forwarded-for"];
  if (ip && typeof ip === "string") ip = ip.split(",")[0].trim();
  else
    ip =
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      "";
  if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";
  return ip;
};

// ========= 1) CREATE: tạo URL thanh toán (Order = Pending) =========
exports.createVNPayPaymentUrl = async (req, res) => {
  try {
    // Auth
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.status(403).json({ message: "Token không được cung cấp" });

    let user;
    try {
      user = jwt.verify(token, SECRET_KEY);
    } catch {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Customer
    const customer = await Customer.findOne({
      where: { CustomerId: user.customerid },
    });
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });

    // Input
    const {
      amount,
      orderInfo,
      cart,
      address,
      mobile,
      email,
      firstname,
      lastname,
      language,
      bankCode,
    } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0)
      return res.status(400).json({ message: "amount không hợp lệ" });

    // Order & OrderDetail (Pending)
    const newOrder = await Order.create({
      CustomerId: customer.CustomerId,
      PaymentMethod: "vnpay",
      Address: address || customer.Address,
      Mobile: mobile || customer.Mobile,
      Email: email || customer.Email,
      Firstname: firstname || customer.Firstname,
      Lastname: lastname || customer.Lastname,
      TotalPrice: amt,
      SubPrice: amt,
      Discount: 0,
      CreateAt: new Date(),
      OrderStatusId: 3,
      PaymentStatus: "Pending", // <--- EN
    });

    if (Array.isArray(cart)) {
      for (const item of cart) {
        await OrderDetail.create({
          OrderId: newOrder.OrderId,
          ProductId: item.ProductId,
          Quantity: item.Quantity,
          Size: item.Size || null,
        });
      }
    }

    // Params ký
    const vnp_TxnRef = String(newOrder.OrderId);
    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: language === "en" ? "en" : "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: sanitizeOrderInfo(
        orderInfo || `Thanh toan don hang #${vnp_TxnRef}`
      ),
      vnp_OrderType: "other",
      vnp_Amount: Math.round(amt) * 100,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: getClientIp(req),
      vnp_CreateDate: formatVNDateYYYYMMDDHHmmss(),
    };
    if (bankCode) vnp_Params.vnp_BankCode = bankCode;

    // Ký & URL
    const signData = buildSignData(vnp_Params);
    const vnp_SecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf-8")
      .digest("hex");

    const paymentUrl = `${vnp_Url}?${buildQueryString({
      ...vnp_Params,
      vnp_SecureHashType: "HmacSHA512",
      vnp_SecureHash,
    })}`;

    return res.json({ paymentUrl, orderId: newOrder.OrderId });
  } catch (err) {
    console.error("[VNPAY] create error:", err);
    return res.status(500).json({ message: "Lỗi tạo link thanh toán VNPay" });
  }
};

// ========= 2) RETURN: local thì cập nhật luôn (Success) + clear session cart =========
exports.vnpayReturnHandler = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const signData = Object.keys(vnp_Params)
      .sort()
      .map((k) => `${k}=${encReturn(vnp_Params[k])}`)
      .join("&");

    const localHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf-8")
      .digest("hex");

    if (String(secureHash).toLowerCase() !== localHash.toLowerCase()) {
      return res.redirect(`${FE_BASE}/payment-failed?error=bad_signature`);
    }

    const respCode = vnp_Params["vnp_ResponseCode"];
    const transStatus = vnp_Params["vnp_TransactionStatus"];
    const orderIdRaw = vnp_Params["vnp_TxnRef"];
    const orderId = Number.parseInt(orderIdRaw, 10);

    const amount = Number(vnp_Params["vnp_Amount"] || 0);

    const order = await Order.findOne({ where: { OrderId: orderId } });
    if (!order) {
      return res.redirect(`${FE_BASE}/payment-failed?error=order_not_found`);
    }
    if (Number(order.TotalPrice) * 100 !== amount) {
      return res.redirect(`${FE_BASE}/payment-failed?error=amount_mismatch`);
    }

    const isSuccess = respCode === "00" && transStatus === "00";
    if (isSuccess) {
      try {
        if (order.PaymentStatus !== "Success") {
          const [affected] = await Order.update(
            { PaymentStatus: "Success" },
            { where: { OrderId: orderId } }
          );

          const tx = await VnpayTransaction.create({
            OrderId: orderId,
            vnp_TxnRef: vnp_Params["vnp_TxnRef"],
            vnp_Amount: amount / 100,
            vnp_ResponseCode: respCode,
            vnp_TransactionNo: vnp_Params["vnp_TransactionNo"] || null,
            vnp_BankCode: vnp_Params["vnp_BankCode"] || null,
            vnp_PayDate: vnp_Params["vnp_PayDate"] || null,
            Status: "Success",
          });
        }
      } catch (dbErr) {
        console.error("[VNPay][RETURN] DB error:", {
          name: dbErr?.name,
          message: dbErr?.message,
          sql: dbErr?.parent?.sql,
          sqlMessage: dbErr?.parent?.sqlMessage,
        });
      }

      // Clear session cart
      try {
        if (req.session) {
          req.session.cart = [];
          if (typeof req.session.save === "function") {
            await new Promise((resolve, reject) =>
              req.session.save((err) => (err ? reject(err) : resolve()))
            );
          }
        }
      } catch (sErr) {
        console.error("[VNPay][RETURN] clear session cart error:", sErr);
      }

      return res.redirect(`${FE_BASE}/payment-success?orderId=${orderId}`);
    }

    // Failed case
    try {
      await Order.update(
        { PaymentStatus: "Failed" },
        { where: { OrderId: orderId } }
      ); // <--- EN
      await VnpayTransaction.create({
        OrderId: orderId,
        vnp_TxnRef: vnp_Params["vnp_TxnRef"],
        vnp_Amount: amount / 100,
        vnp_ResponseCode: respCode,
        vnp_TransactionNo: vnp_Params["vnp_TransactionNo"] || null,
        vnp_BankCode: vnp_Params["vnp_BankCode"] || null,
        vnp_PayDate: vnp_Params["vnp_PayDate"] || null,
        Status: "Failed", // <--- EN
      });
    } catch (dbErr) {
      console.error(
        "[VNPay][RETURN] DB log fail (failed case):",
        dbErr?.message
      );
    }

    return res.redirect(`${FE_BASE}/payment-failed?error=${respCode}`);
  } catch (err) {
    console.error("[VNPay][RETURN] internal error:", err);
    return res.redirect(`${FE_BASE}/payment-failed?error=internal_error`);
  }
};

// ========= 3) IPN: idempotent, chốt trạng thái khi deploy online =========
exports.vnpayIpnHandler = async (req, res) => {
  try {
    const merged = { ...(req.method === "POST" ? req.body : req.query) };
    const vnp_Params = { ...merged };
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const signData = Object.keys(vnp_Params)
      .sort()
      .map((k) => `${k}=${encReturn(vnp_Params[k])}`)
      .join("&");
    const checkHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf-8")
      .digest("hex");

    if (String(secureHash).toLowerCase() !== checkHash.toLowerCase()) {
      return res.json({ RspCode: "97", Message: "Invalid signature" });
    }

    const orderId = Number.parseInt(vnp_Params["vnp_TxnRef"], 10);
    const respCode = vnp_Params["vnp_ResponseCode"];
    const transStatus = vnp_Params["vnp_TransactionStatus"];
    const amount = Number(vnp_Params["vnp_Amount"] || 0);

    const order = await Order.findOne({ where: { OrderId: orderId } });
    if (!order) return res.json({ RspCode: "01", Message: "Order not found" });
    if (Number(order.TotalPrice) * 100 !== amount)
      return res.json({ RspCode: "04", Message: "Invalid amount" });

    if (order.PaymentStatus === "Success") {
      return res.json({ RspCode: "00", Message: "Already processed" });
    }

    const ok = respCode === "00" && transStatus === "00";
    if (ok) {
      await Order.update(
        { PaymentStatus: "Success" },
        { where: { OrderId: orderId } }
      ); // <--- EN
      await VnpayTransaction.create({
        OrderId: orderId,
        vnp_TxnRef: vnp_Params["vnp_TxnRef"],
        vnp_Amount: amount / 100,
        vnp_ResponseCode: respCode,
        vnp_TransactionNo: vnp_Params["vnp_TransactionNo"] || null,
        vnp_BankCode: vnp_Params["vnp_BankCode"] || null,
        vnp_PayDate: vnp_Params["vnp_PayDate"] || null,
        Status: "Success", // <--- EN
      });
      return res.json({ RspCode: "00", Message: "Success" });
    }

    await Order.update(
      { PaymentStatus: "Failed" },
      { where: { OrderId: orderId } }
    ); // <--- EN
    await VnpayTransaction.create({
      OrderId: orderId,
      vnp_TxnRef: vnp_Params["vnp_TxnRef"],
      vnp_Amount: amount / 100,
      vnp_ResponseCode: respCode,
      vnp_TransactionNo: vnp_Params["vnp_TransactionNo"] || null,
      vnp_BankCode: vnp_Params["vnp_BankCode"] || null,
      vnp_PayDate: vnp_Params["vnp_PayDate"] || null,
      Status: "Failed", // <--- EN
    });
    return res.json({ RspCode: "00", Message: "Processed (failure recorded)" });
  } catch (error) {
    console.error("VNPay IPN error:", error);
    return res.json({ RspCode: "99", Message: "Unknown error" });
  }
};

// ===== API CHO MOBILE =====

// API tạo link thanh toán VNPay cho mobile (chỉ trả URL, không redirect)
exports.createVNPayPaymentUrlMobile = async (req, res) => {
  try {
    // Auth
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.status(403).json({ message: "Token không được cung cấp" });

    let user;
    try {
      user = jwt.verify(token, SECRET_KEY);
    } catch {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Customer
    const customer = await Customer.findOne({
      where: { CustomerId: user.customerid },
    });
    if (!customer)
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });

    // Input - cho mobile có thể đơn giản hơn
    const {
      amount,
      orderInfo,
      cart,
      address,
      mobile,
      email,
      firstname,
      lastname,
      orderId, // Có thể nhận orderId từ mobile nếu đã tạo order trước đó
    } = req.body;

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0)
      return res.status(400).json({ message: "amount không hợp lệ" });

    let newOrder;

    // Nếu mobile đã tạo order trước đó thì dùng orderId có sẵn
    if (orderId) {
      newOrder = await Order.findOne({ where: { OrderId: orderId } });
      if (!newOrder) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }
    } else {
      // Tạo order mới nếu chưa có
      newOrder = await Order.create({
        CustomerId: customer.CustomerId,
        PaymentMethod: "vnpay",
        Address: address || customer.Address,
        Mobile: mobile || customer.Mobile,
        Email: email || customer.Email,
        Firstname: firstname || customer.Firstname,
        Lastname: lastname || customer.Lastname,
        TotalPrice: amt,
        SubPrice: amt,
        Discount: 0,
        CreateAt: new Date(),
        OrderStatusId: 3,
        PaymentStatus: "Pending",
      });

      // Tạo OrderDetail nếu có cart và ProductId hợp lệ
      if (Array.isArray(cart)) {
        for (const item of cart) {
          // Kiểm tra ProductId có tồn tại không (chỉ tạo nếu ProductId > 0 và có thực)
          if (item.ProductId && item.ProductId > 1) {
            try {
              await OrderDetail.create({
                OrderId: newOrder.OrderId,
                ProductId: item.ProductId,
                Quantity: item.Quantity,
                Size: item.Size || null,
              });
            } catch (err) {
              console.log(
                `Không thể tạo OrderDetail cho ProductId ${item.ProductId}:`,
                err.message
              );
              // Tiếp tục tạo order mà không fail
            }
          }
        }
      }
    }

    // Tạo URL thanh toán VNPay với return URL cho mobile
    const vnp_TxnRef = String(newOrder.OrderId);
    const mobileReturnUrl = `${
      process.env.MOBILE_APP_SCHEME || "atbadminton"
    }://payment-result`;

    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: sanitizeOrderInfo(
        orderInfo || `Thanh toan don hang mobile #${vnp_TxnRef}`
      ),
      vnp_OrderType: "other",
      vnp_Amount: Math.round(amt) * 100,
      vnp_ReturnUrl: mobileReturnUrl,
      vnp_IpAddr: getClientIp(req),
      vnp_CreateDate: formatVNDateYYYYMMDDHHmmss(),
    };

    // Ký & URL
    const signData = buildSignData(vnp_Params);
    const vnp_SecureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData, "utf-8")
      .digest("hex");

    const paymentUrl = `${vnp_Url}?${buildQueryString({
      ...vnp_Params,
      vnp_SecureHashType: "HmacSHA512",
      vnp_SecureHash,
    })}`;

    return res.json({
      success: true,
      paymentUrl,
      orderId: newOrder.OrderId,
      message: "Tạo link thanh toán thành công",
    });
  } catch (err) {
    console.error("[VNPAY Mobile] create error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi tạo link thanh toán VNPay",
      error: err.message,
    });
  }
};

// API cập nhật trạng thái thanh toán cho mobile
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    // Auth
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.status(403).json({ message: "Token không được cung cấp" });

    let user;
    try {
      user = jwt.verify(token, SECRET_KEY);
    } catch {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Validate input
    if (!orderId || !paymentStatus) {
      return res.status(400).json({
        message: "orderId và paymentStatus là bắt buộc",
      });
    }

    const validStatuses = ["Success", "Failed", "Pending", "Cancel"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message:
          "paymentStatus không hợp lệ. Chỉ chấp nhận: " +
          validStatuses.join(", "),
      });
    }

    // Tìm order và kiểm tra quyền
    const order = await Order.findOne({
      where: { OrderId: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra order có thuộc về user hiện tại không
    const customer = await Customer.findOne({
      where: { CustomerId: user.customerid },
    });

    if (!customer || order.CustomerId !== customer.CustomerId) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật đơn hàng này",
      });
    }

    // Cập nhật trạng thái thanh toán
    await Order.update(
      { PaymentStatus: paymentStatus },
      { where: { OrderId: orderId } }
    );

    // Lưu log transaction nếu cần
    if (paymentStatus === "Success" || paymentStatus === "Failed") {
      try {
        await VnpayTransaction.create({
          OrderId: orderId,
          vnp_TxnRef: orderId.toString(),
          vnp_Amount: order.TotalPrice,
          vnp_ResponseCode: paymentStatus === "Success" ? "00" : "01",
          Status: paymentStatus,
        });
      } catch (logErr) {
        console.error("Error logging transaction:", logErr);
        // Không fail request nếu log lỗi
      }
    }

    return res.json({
      success: true,
      message: `Cập nhật trạng thái thanh toán thành ${paymentStatus}`,
      orderId: orderId,
      paymentStatus: paymentStatus,
    });
  } catch (err) {
    console.error("[Mobile] update payment status error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật trạng thái thanh toán",
      error: err.message,
    });
  }
};
