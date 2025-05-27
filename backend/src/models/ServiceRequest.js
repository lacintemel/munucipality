const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['maintenance', 'repair', 'installation', 'inspection', 'streetlight', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0]
    },
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      }
    }
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: String,
    enum: ['Water Works Association', 'Electric Association', 'Gas Association', 'Parks and Recreation', 'Municipality', 'Governorship', 'Ministry of Education', 'Ministry of Sport', 'Ministry of Health', 'Other'],
    required: false
  },
  statusComment: {
    type: String,
    default: ''
  },
  statusHistory: [{
    status: {
      type: String,
      required: true,
      enum: ['pending', 'in-progress', 'resolved', 'rejected']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    text: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  mimetype: {
    type: String
  },
  originalname: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
  }],
  actualCompletionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add index for location queries
serviceRequestSchema.index({ 'location': '2dsphere' });

// Add method to update status
serviceRequestSchema.methods.updateStatus = async function(status, changedBy, comment) {
  this.status = status;
  this.statusComment = comment || '';
  this.statusHistory.push({
    status,
    changedBy,
    comment: comment || 'Status updated',
    timestamp: new Date()
  });
  
  if (status === 'resolved') {
    this.actualCompletionDate = new Date();
  }
  
  // Add a comment to the comments array if a comment is provided
  if (comment && comment.trim() !== '') {
    this.comments.push({
      text: `Status changed to ${status}: ${comment}`,
      user: changedBy,
      createdAt: new Date()
    });
  }
  
  return this.save();
};

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest; 