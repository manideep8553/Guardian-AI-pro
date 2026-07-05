import mongoose from 'mongoose';
import { config } from './config';
import { User } from './models/User';

const seedUsers = [
  {
    email: 'admin@guardianai.com',
    password: 'Admin@123',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    department: 'Management',
    employeeId: 'ADM001',
    isActive: true,
    isEmailVerified: true,
  },
  {
    email: 'supervisor@guardianai.com',
    password: 'Super@123',
    firstName: 'John',
    lastName: 'Supervisor',
    role: 'supervisor',
    department: 'Safety',
    employeeId: 'SUP001',
    isActive: true,
    isEmailVerified: true,
  },
  {
    email: 'safety@guardianai.com',
    password: 'Safety@123',
    firstName: 'Jane',
    lastName: 'Officer',
    role: 'safety_officer',
    department: 'Safety',
    employeeId: 'SOF001',
    isActive: true,
    isEmailVerified: true,
  },
  {
    email: 'worker@guardianai.com',
    password: 'Worker@123',
    firstName: 'Bob',
    lastName: 'Worker',
    role: 'worker',
    department: 'Production',
    employeeId: 'WRK001',
    isActive: true,
    isEmailVerified: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`User ${userData.email} already exists, skipping`);
        continue;
      }
      await User.create(userData);
      console.log(`Created user: ${userData.email} (${userData.role})`);
    }
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
