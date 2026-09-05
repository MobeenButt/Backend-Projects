// Request Logger Middleware

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log('\n' + '='.repeat(60));
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log(`🌐 IP: ${req.ip}`);
  console.log(`🔑 User: ${req.user?.username || 'Not authenticated'}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('🔍 Query:', req.query);
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.log('🎯 Params:', req.params);
  }

  // Capture response
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    console.log(`📤 Status: ${res.statusCode}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (res.statusCode >= 400) {
      console.log('❌ Error Response:', typeof data === 'string' ? data.substring(0, 500) : data);
    } else {
      console.log('✅ Success');
    }
    
    console.log('='.repeat(60) + '\n');
    
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    const duration = Date.now() - startTime;
    
    console.log(`📤 Status: ${res.statusCode}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (res.statusCode >= 400) {
      console.log('❌ Error Response:', data);
    } else {
      console.log('✅ Success');
    }
    
    console.log('='.repeat(60) + '\n');
    
    return originalJson.call(this, data);
  };

  next();
};
