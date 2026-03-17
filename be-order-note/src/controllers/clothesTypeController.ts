import { Response } from 'express';
import ClothesType from '../models/ClothesType';
import { AuthRequest } from '../middleware/authMiddleware';

// POST /api/clothes-types
export const createClothesType = async (req: AuthRequest, res: Response) => {
  const { name, sizes, basePrice, sellingPrice } = req.body;

  if (!name || !sizes || basePrice === undefined || sellingPrice === undefined) {
    return res.status(400).json({ message: 'Semua field wajib diisi.' });
  }

  try {
    const clothesType = await ClothesType.create({
      userId: req.user!.id,
      name,
      sizes,
      basePrice,
      sellingPrice,
    });
    return res.status(201).json({ message: 'Jenis pakaian berhasil dibuat.', clothesType });
  } catch (error) {
    console.error('Create clothes type error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// GET /api/clothes-types
export const getClothesTypes = async (req: AuthRequest, res: Response) => {
  try {
    const clothesTypes = await ClothesType.findAll({
      where: { userId: req.user!.id },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(clothesTypes);
  } catch (error) {
    console.error('Get clothes types error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// PUT /api/clothes-types/:id
export const updateClothesType = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, sizes, basePrice, sellingPrice } = req.body;

  try {
    const clothesType = await ClothesType.findOne({ where: { id, userId: req.user!.id } });
    if (!clothesType) return res.status(404).json({ message: 'Jenis pakaian tidak ditemukan.' });

    clothesType.name = name ?? clothesType.name;
    clothesType.sizes = sizes ?? clothesType.sizes;
    clothesType.basePrice = basePrice ?? clothesType.basePrice;
    clothesType.sellingPrice = sellingPrice ?? clothesType.sellingPrice;
    await clothesType.save();

    return res.status(200).json({ message: 'Jenis pakaian diperbarui.', clothesType });
  } catch (error) {
    console.error('Update clothes type error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// DELETE /api/clothes-types/:id
export const deleteClothesType = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const clothesType = await ClothesType.findOne({ where: { id, userId: req.user!.id } });
    if (!clothesType) return res.status(404).json({ message: 'Jenis pakaian tidak ditemukan.' });

    await clothesType.destroy();
    return res.status(200).json({ message: 'Jenis pakaian berhasil dihapus.' });
  } catch (error) {
    console.error('Delete clothes type error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
