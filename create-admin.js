// Script to create admin user
// Run this from the backend directory: node ../admin/create-admin.js

const axios = require('axios');

const createAdmin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Admin User',
      email: 'admin@silaimart.com',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('Admin created successfully:', response.data);
  } catch (error) {
    console.error('Error creating admin:', error.response?.data || error.message);
  }
};

createAdmin();