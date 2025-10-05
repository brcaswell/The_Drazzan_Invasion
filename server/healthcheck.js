const http = require('http')

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET'
}

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0) // Healthy
  } else {
    process.exit(1) // Unhealthy
  }
})

req.on('error', () => {
  process.exit(1) // Unhealthy
})

req.setTimeout(3000, () => {
  req.destroy()
  process.exit(1) // Timeout
})

req.end()