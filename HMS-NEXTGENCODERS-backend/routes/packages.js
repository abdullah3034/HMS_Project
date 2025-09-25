import express from 'express';
import Package from '../models/Package.js';

const router = express.Router();

// GET all packages
router.get('/', async (req, res) => {
    try {
        console.log('📦 GET /api/packages - Fetching all packages');
        const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
        console.log(`📦 Found ${packages.length} packages`);
        res.json(packages);
    } catch (error) {
        console.error('❌ Error fetching packages:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET single package
router.get('/:id', async (req, res) => {
    try {
        console.log('📦 GET /api/packages/:id - Fetching package:', req.params.id);
        const packageDoc = await Package.findById(req.params.id);
        if (!packageDoc || !packageDoc.isActive) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json(packageDoc);
    } catch (error) {
        console.error('❌ Error fetching package:', error);
        res.status(500).json({ message: error.message });
    }
});

// CREATE new package
router.post('/', async (req, res) => {
    try {
        console.log('📦 POST /api/packages - Creating package:', req.body);
        const { name, description, pricePerChild, category, features } = req.body;
        
        // Validation
        if (!name || !pricePerChild || !category) {
            return res.status(400).json({ message: 'Name, price, and category are required' });
        }
        
        if (pricePerChild <= 0) {
            return res.status(400).json({ message: 'Price must be greater than 0' });
        }
        
        const packageDoc = new Package({
            name,
            description,
            pricePerChild: parseFloat(pricePerChild),
            category,
            features: features || []
        });
        
        const savedPackage = await packageDoc.save();
        console.log('✅ Package created with ID:', savedPackage._id);
        res.status(201).json(savedPackage);
    } catch (error) {
        console.error('❌ Error creating package:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'Package name already exists' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// UPDATE package
router.put('/:id', async (req, res) => {
    try {
        console.log('📦 PUT /api/packages/:id - Updating package:', req.params.id);
        const { name, description, pricePerChild, category, features } = req.body;
        
        // Validation
        if (!name || !pricePerChild || !category) {
            return res.status(400).json({ message: 'Name, price, and category are required' });
        }
        
        if (pricePerChild <= 0) {
            return res.status(400).json({ message: 'Price must be greater than 0' });
        }
        
        const packageDoc = await Package.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            {
                name,
                description,
                pricePerChild: parseFloat(pricePerChild),
                category,
                features: features || []
            },
            { new: true, runValidators: true }
        );
        
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }
        
        console.log('✅ Package updated successfully');
        res.json(packageDoc);
    } catch (error) {
        console.error('❌ Error updating package:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE package (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        console.log('📦 DELETE /api/packages/:id - Deleting package:', req.params.id);
        const packageDoc = await Package.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            { isActive: false },
            { new: true }
        );
        
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }
        
        console.log('✅ Package deleted successfully');
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting package:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;