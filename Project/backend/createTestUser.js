// Quick script to create a test user
// Run: node createTestUser.js

const userData = {
  fullName: "Test User",
  username: "testuser",
  email: "hacker.iran.hacker@gmail.com",
  password: "123456"
};

fetch('http://localhost:8000/api/v1/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(userData)
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ User created successfully!');
    console.log('User data:', data);
    console.log('\n📝 Login credentials:');
    console.log('Email/Username:', userData.email, 'or', userData.username);
    console.log('Password:', userData.password);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
