const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Court = require('./Court'); // Adjust the path as necessary
const Customer = require('./Customer'); // Adjust the path as necessary
const TimeSlot = require('./TimeSlot'); // Adjust the path as necessary
const Branch = require('./branch'); // Adjust the path as necessary

const Booking = sequelize.define('Booking', {
  BookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },  
  CustomerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  CourtId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  TimeSlotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  BookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  Status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
}, {
  tableName: 'booking',
  freezeTableName: true,
  timestamps: false,
});

// Associations
// Booking
Booking.belongsTo(Customer, { foreignKey: 'CustomerId' });
Booking.belongsTo(Court, { foreignKey: 'CourtId' });
Booking.belongsTo(TimeSlot, { foreignKey: 'TimeSlotId' });

// Court
Court.belongsTo(Branch, { foreignKey: 'BranchId' });

module.exports = Booking;
