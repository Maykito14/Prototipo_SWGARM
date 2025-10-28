const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password, rol = 'adoptante' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Campos incompletos' });

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'El usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create(email, hash, rol);
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.idUsuario, rol: user.rol },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.idUsuario, email: user.email, rol: user.rol } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en login' });
  }
};
