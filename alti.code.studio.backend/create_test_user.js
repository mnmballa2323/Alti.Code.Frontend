import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './config/index.js';
import UserModel from './src/app/modules/auth/auth.model.js';

async function createTestUser() {
  try {
    await mongoose.connect(config.database_local);
    
    const email = 'test@alti.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await UserModel.deleteOne({ email });
    
    await UserModel.create({
      email,
      password: hashedPassword,
      role: 'user', 
    });
    
    console.log(`Test user created: ${email} / ${password}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createTestUser();
