import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import ClothesType from '../models/ClothesType';
import { AuthRequest } from '../middleware/authMiddleware';

// Generate order number: ORD-YYYYMMDD-NNNN
async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `ORD-${dateStr}-`;
  
  const lastOrder = await Order.findOne({
    where: {
      orderNumber: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [['orderNumber', 'DESC']],
  });

  let nextNum = 1;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.orderNumber.split('-')[2]);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response) => {
  const { customerName, phoneNumber, address, items } = req.body;

  if (!customerName || !phoneNumber || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Semua field wajib diisi (Nama, Telp, Alamat, dan minimal 1 Item).' });
  }

  const t = await sequelize.transaction();

  try {
    const orderNumber = await generateOrderNumber();
    let totalAmount = 0;

    // Create the Order first
    const order = await Order.create({
      userId: req.user!.id,
      orderNumber,
      customerName,
      phoneNumber,
      address,
      totalAmount: 0, // Update after items
      status: 'pending',
    }, { transaction: t });

    // Create items and sum total
    const itemRecords = [];
    for (const item of items) {
      // Fetch current basePrice from Master Data
      const masterData = await ClothesType.findOne({ 
        where: { name: item.clothType, userId: req.user!.id } 
      });
      
      const basePrice = masterData ? Number(masterData.basePrice) : 0;
      const subtotal = Number(item.price) * Number(item.quantity);
      totalAmount += subtotal;
      
      itemRecords.push({
        orderId: order.id,
        clothType: item.clothType,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        basePrice,
        subtotal,
      });
    }

    await OrderItem.bulkCreate(itemRecords, { transaction: t });

    // Update total amount
    order.totalAmount = totalAmount;
    await order.save({ transaction: t });

    await t.commit();

    return res.status(201).json({
      message: 'Order berhasil dibuat.',
      order: {
        ...order.toJSON(),
        items: itemRecords,
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user!.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/orders/stats
export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const orders = await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, as: 'items' }],
    });

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    
    // Status counts
    const statusCounts = orders.reduce((acc: any, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Last 5 orders
    const recentOrders = orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Calculate total profit and monthly order counts for the current year
    const currentYear = new Date().getFullYear();
    const monthlyOrderCounts = new Array(12).fill(0);

    const totalProfit = orders.reduce((sum, o) => {
      // Monthly count for current year
      const orderDate = new Date(o.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        monthlyOrderCounts[orderDate.getMonth()]++;
      }

      const orderProfit = o.items?.reduce((pSum, item) => {
        const profitPerUnit = Number(item.price) - Number(item.basePrice);
        return pSum + (profitPerUnit * item.quantity);
      }, 0) || 0;
      return sum + orderProfit;
    }, 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyStats = monthNames.map((name, index) => ({
      name,
      count: monthlyOrderCounts[index]
    }));

    return res.status(200).json({
      totalOrders,
      totalAmount,
      totalProfit,
      totalCustomers: new Set(orders.map(o => o.customerName)).size,
      statusCounts,
      recentOrders,
      monthlyStats,
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// PATCH /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findOne({ where: { id, userId: req.user!.id } });
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan.' });

    order.status = status;
    await order.save();

    return res.status(200).json({ message: 'Status order diperbarui.', order });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ where: { id, userId: req.user!.id } });
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan.' });

    await order.destroy();
    return res.status(200).json({ message: 'Order berhasil dihapus.' });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
