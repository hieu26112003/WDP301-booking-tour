import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['callback', 'feedback'],
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    name: String,
    email: String,
    address: String,
    feedback: String,

    called: {
        type: Boolean,
        default: false,
    },
    calledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // liên kết với collection User
        default: null,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;
