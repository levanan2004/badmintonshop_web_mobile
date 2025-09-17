

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,       // badmintonshop
  process.env.DB_USER,       // badminton
  process.env.DB_PASS,       // NewStrongPassls
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true, // không tự thêm 's'
      timestamps: false      // bảng dump của bạn không có createdAt/updatedAt
    },
    dialectOptions: { charset: 'utf8mb4' },
    timezone: '+07:00'
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Kết nối MySQL: OK'))
  .catch(err => console.error('❌ Lỗi kết nối CSDL:', err.message));

module.exports = sequelize;

