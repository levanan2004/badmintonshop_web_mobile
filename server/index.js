require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/db/index.js");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = [
  process.env.CLIENT_ORIGIN,         // ví dụ: http://kientienonline.site
  process.env.API_CLIENT,            // ví dụ: http://202.92.6.72:3001 (nếu có)
  "http://kientienonline.site",
  "https://kientienonline.site",
  "http://202.92.6.72",
  "http://202.92.6.72:3001",
  "http://localhost:3001"
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // Cho phép request không có Origin (curl, Postman) hoặc Origin thuộc whitelist
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "src", "app", "uploads"))
);

const {
  getRepliesByComment,
  addReply,
  deleteReply,
} = require("./src/app/controller/CommentReplyContronller.js");
const {
  getCommentsByProduct,
  addComment,
  deleteComment,
} = require("./src/app/controller/CommentController");
const privateSiteRoutes = require("./src/routes/privateSiteRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const authenticateJWT = require("./src/Common/Authentication.js");
const authorize = require("./src/Common/Authorize");
const authRoutes = require("./src/routes/authenRoutes");
const productRoutes = require("./src/routes/productRoutes");
const {
  getAllAccountsUser,
  getProfileUser,
  updateProfileUser,
  changePasswordUser,
  getOrderDetails,
  getOrderUser,
} = require("./src/app/controller/AccountUserController.js");
const cartRoutes = require("./src/routes/cartRoutes");
const checkoutRoutes = require("./src/routes/checkoutRoutes");
const {
  getAllBranches,
  getCourtsByBranch,
  getAllTimeSlots,
  createBooking,
  getBookedSlots,
  getBookingHistory,
  cancelManyBookings,
} = require("./src/app/controller/BookingController.js");
//Account routes
app.get(
  "/accountmanagementUser",
  authenticateJWT,
  authorize(["Người dùng"]),
  getAllAccountsUser
);
app.get(
  "/profileUser",
  authenticateJWT,
  authorize(["Người dùng"]),
  getProfileUser
);
app.put(
  "/updateprofileUser",
  authenticateJWT,
  authorize(["Người dùng"]),
  updateProfileUser
);
app.put(
  "/profile/changepasswordUser",
  authenticateJWT,
  authorize(["Người dùng"]),
  changePasswordUser
);
///
app.use("/privatesite", privateSiteRoutes);
app.use("/brands", brandRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
//comments
app.get("/comments/:productId", getCommentsByProduct);
app.post("/comments", addComment);
app.delete("/comments/:commentId", deleteComment);
//replies
app.post("/comments/reply", addReply); // <-- Thêm dòng này!
app.get("/comments/:commentId/replies", getRepliesByComment); // <-- Đúng RESTful hơn
app.delete("/comments/reply/:replyId", deleteReply);

//payment
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
//booking
app.get("/branches", getAllBranches);
app.get("/courts", getCourtsByBranch);
app.get("/timeslots", getAllTimeSlots);
app.get("/booked-slots", getBookedSlots);
app.get("/booking-history", getBookingHistory);
app.put("/booking/cancel-many", cancelManyBookings);

app.post("/booking", authenticateJWT, authorize(["Người dùng"]), createBooking);
//order
app.get("/order", authenticateJWT, authorize(["Người dùng"]), getOrderUser);
app.get(
  "/order/:orderId",
  authenticateJWT,
  authorize(["Người dùng"]),
  getOrderDetails
);

app.listen(PORT, () => {
  console.log(`🚀 Server listen on 127.0.0.1:${PORT} (proxy qua /api)`);
});
