require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Tasks API running at http://localhost:${PORT}`);
});

// Last line of defence: log instead of silently dying
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
