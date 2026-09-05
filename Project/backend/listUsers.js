// List all users in database
// Run: node listUsers.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  fullName: String,
  avatar: String,
  coverImage: String,
  password: String,
  refreshToken: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('username email fullName createdAt');
    
    if (users.length === 0) {
      console.log('📭 No users found in database');
    } else {
      console.log(`👥 Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Full Name: ${user.fullName}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
