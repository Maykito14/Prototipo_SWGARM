const app = require('./backend/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor SWGARM corriendo en http://localhost:${PORT}`);
  console.log(`📝 API disponible en http://localhost:${PORT}/api`);
});

