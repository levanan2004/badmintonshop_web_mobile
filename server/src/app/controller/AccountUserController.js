const Account = require("../models/Account");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "saddasdasadsasdadsas";
const bcrypt = require("bcrypt");
const Customer = require("../models/Customer");
const OrderStatus = require("../models/OrderStatus"); // Thêm dòng này

exports.getAllAccountsUser = async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching all accounts:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProfileUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const account = await Account.findOne({ where: { AccountId: userId } });
    if (!account) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }
    // Trả về object với trường chữ thường cho frontend
    res.json({
      username: account.Username,
      email: account.Email,
      mobile: account.Mobile,
      lastname: account.Lastname,
      firstname: account.Firstname,
      address: account.Address,
      gender: account.Gender,
      userId: account.AccountId,
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.updateProfileUser = async (req, res) => {
  const { lastname, firstname, gender, address, mobile } = req.body;
  const userId = req.user.userId;

  try {
    const user = await Account.findOne({ where: { AccountId: userId } });
    if (!user) {
      console.log("Không tìm thấy user khi update profile");
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    user.Lastname = lastname || user.Lastname;
    user.Firstname = firstname || user.Firstname;
    user.Gender = gender || user.Gender;
    user.Address = address || user.Address;
    user.Mobile = mobile || user.Mobile;

    const customer = await Customer.findOne({
      where: { CustomerId: user.CustomerId },
    });
    if (customer) {
      customer.Mobile = user.Mobile;
      customer.Address = user.Address;
      await customer.save();
    }

    await user.save();
    // Generate new token after updating user information
    const newToken = jwt.sign(
      {
        username: user.Username,
        userId: user.AccountId,
        idgroup: user.IdGroup,
        email: user.Email,
        mobile: user.Mobile,
        address: user.Address,
        firstname: user.Firstname,
        lastname: user.Lastname,
        gender: user.Gender,
        customerid: user.CustomerId,
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Thông tin người dùng đã được cập nhật",
      user: user.toJSON(),
      token: newToken,
    });
  } catch (error) {
    console.error("Lỗi khi update profile:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.changePasswordUser = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    console.log("Change password for userId:", userId);
    const user = await Account.findOne({ where: { AccountId: userId } });
    if (!user) {
      console.log("Không tìm thấy user khi đổi mật khẩu");
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.Password);
    if (!isMatch) {
      console.log("Mật khẩu cũ không đúng");
      return res.status(400).json({ error: "Mật khẩu cũ không chính xác" });
    }

    if (newPassword.length < 8) {
      console.log("Mật khẩu mới quá ngắn");
      return res
        .status(400)
        .json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.Password = hashedPassword;
    await user.save();

    const newToken = jwt.sign(
      {
        username: user.Username,
        userId: user.AccountId,
        email: user.Email,
        idgroup: user.GroupId, // PHẢI có dòng này!
        mobile: user.Mobile,
        address: user.Address,
        firstname: user.Firstname,
        lastname: user.Lastname,
        gender: user.Gender,
        customerid: user.CustomerId,
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Mật khẩu đã được thay đổi thành công",
      user: user.toJSON(),
      token: newToken,
    });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("Không có token trong header");
    return res.status(403).json({ message: "Token không được cung cấp" });
  }

  try {
    const user = jwt.verify(token, SECRET_KEY);
    req.user = user;

    const customer = await Customer.findOne({
      where: { CustomerId: user.customerid },
    });
    if (!customer) {
      console.log("Không tìm thấy khách hàng với customerid:", user.customerid);
      return res.status(404).json({ message: "Không tìm thấy khách hàng." });
    }
    // Lấy danh sách đơn hàng của user và đảm bảo có trường PaymentStatus
    const orders = await Order.findAll({
      where: { CustomerId: user.customerid },
      order: [["CreateAt", "DESC"]],
      attributes: [
        "OrderId",
        "CustomerId",
        "PaymentMethod",
        "SubPrice",
        "TotalPrice",
        "Discount",
        "CreateAt",
        "OrderStatusId",
        "PaymentStatus", // đảm bảo lấy PaymentStatus
      ],
    });

    if (orders.length === 0) {
      console.log("Khách hàng chưa có đơn hàng nào");
      return res
        .status(404)
        .json({ message: "Khách hàng này chưa có đơn hàng nào." });
    }
    // Chuẩn hóa dữ liệu trả về để frontend dùng trực tiếp
    const normalizedOrders = orders.map((o) => ({
      OrderId: o.OrderId,
      CustomerId: o.CustomerId,
      PaymentMethod: o.PaymentMethod,
      SubPrice: o.SubPrice,
      TotalPrice: o.TotalPrice,
      Discount: o.Discount,
      CreateAt: o.CreateAt,
      OrderStatusId: o.OrderStatusId,
      PaymentStatus: o.PaymentStatus || "Pending",
    }));

    res.json({ customer, orders: normalizedOrders });
  } catch (err) {
    console.error("JWT verify error:", err);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Lấy chi tiết sản phẩm trong đơn hàng
    const orderDetails = await OrderDetail.findAll({
      where: { OrderId: orderId },
      include: [
        {
          model: Product,
          as: "Product",
        },
      ],
    });

    if (!orderDetails || orderDetails.length === 0) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    }

    // Lấy thông tin đơn hàng
    const order = await Order.findOne({
      where: { OrderId: orderId },
      include: [
        {
          model: OrderStatus,
          as: "OrderStatus",
          attributes: ["OrderStatusName"],
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    // Lấy thông tin khách hàng
    const customer = await Customer.findOne({
      where: { CustomerId: order.CustomerId },
    });

    res.json({
      order: {
        ...order.toJSON(),
        OrderStatusName: order.OrderStatus?.OrderStatusName,
      },
      customer,
      details: orderDetails.map((od) => ({
        ProductName: od.Product?.ProductName,
        Size: od.Size,
        Quantity: od.Quantity,
        Price:
          od.Price !== undefined && od.Price !== null
            ? od.Price
            : od.Product?.Price,
        ImageUrl:
          od.Product?.ImageUrl ||
          (od.Product?.Avatar
            ? `${process.env.API_SERVER || "http://localhost:3000"}/uploads/${
                od.Product.Avatar
              }`
            : ""),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    atus(500).json({ error: error.message });
  }
};
