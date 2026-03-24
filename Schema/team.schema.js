import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true // stores image path, e.g., "/team/SubodhKumar.png"
  },
  description: {
    type: String,  // Store as HTML, Markdown, or plain text
    required: true
  },
  border: {
    type: String,
    enum: ['orange', 'blue'],
    default: 'orange'
  }
}, {
  timestamps: true
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;