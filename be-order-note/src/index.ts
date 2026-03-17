import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
// Import models to ensure they are registered with Sequelize
import './models/User';
import './models/Order';
import './models/ClothesType';
import './models/OrderItem';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import clothesTypeRoutes from './routes/clothesTypeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/clothes-types', clothesTypeRoutes);

app.get('/', (req, res) => {
  res.send('NoteOrder API is running');
});

async function startServer() {
  try {
    // Authenticate with the database
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all defined models to the DB
    // Note: alter: true helps update the table schema to match models
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
