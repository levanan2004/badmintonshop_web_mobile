module.exports = {
  vnp_TmnCode: "31IY64MS",
  vnp_HashSecret: "6CWYMYU82JHFE6SP7FKDFTRLKXEKLIIJ",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: `${
    process.env.API_SERVER || "http://localhost:3000"
  }/vnpay_return`,
};
