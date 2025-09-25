import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    pricePerChild: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['general', 'family', 'kids', 'adults']
    },
    features: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Use mongoose.models to avoid OverwriteModelError
const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);

export default Package;