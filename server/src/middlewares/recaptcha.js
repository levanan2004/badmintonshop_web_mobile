// node-fetch v3 là ESM, require kiểu lazy như dưới để dùng được trong CommonJS
const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

module.exports = async function verifyRecaptcha(req, res, next) {
  try {
    const token = req.body.captchaToken || req.body["g-recaptcha-response"];
    if (!token) {
      return res.status(400).json({ message: "Thiếu captcha token" });
    }

    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY); // SECRET KEY (v2 checkbox)
    params.append("response", token);
    params.append("remoteip", req.ip);

    const gg = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await gg.json(); // { success: true/false, ... }

    if (!result.success) {
      return res.status(400).json({ message: "Captcha không hợp lệ" });
    }
    next();
  } catch (err) {
    console.error("reCAPTCHA verify error:", err);
    return res.status(500).json({ message: "Lỗi xác thực captcha" });
  }
};
