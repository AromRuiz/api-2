const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
  const { user, pass } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, mascota FROM login WHERE nombre = ? AND clave = ?',
      [user, pass]
    );
    if (rows.length > 0) {
      res.json({
        success: true,
        user_id: rows[0].id,
        nombre: rows[0].nombre,
        mascota: rows[0].mascota
      });
    } else {
      res.json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
app.post('/register', async (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM login WHERE nombre = ?', [user]);

    if (existing.length > 0) {
      return res.json({ success: false, message: 'Usuario ya existe' });
    }

    await db.query('INSERT INTO login (nombre, clave) VALUES (?, ?)', [user, pass]);
    res.json({ success: true, message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error('Error en /register:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});
app.post('/puntajes', async (req, res) => {
  const { id_usuario, modulo, puntaje } = req.body;

  if (id_usuario == null || modulo == null || puntaje == null) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    await db.query(
      'INSERT INTO puntajes (id_usuario, modulo, puntaje) VALUES (?, ?, ?)',
      [id_usuario, modulo, puntaje]
    );
    console.log('[API] /puntajes guardado:', { id_usuario, modulo, puntaje });
    return res.status(200).json({ mensaje: 'Puntaje guardado correctamente' });
  } catch (err) {
    console.error('Error al guardar puntaje:', err);
    return res.status(500).json({ error: 'Error al guardar puntaje' });
  }
});
app.get('/ranking', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT login.nombre, puntajes.puntaje, puntajes.modulo, puntajes.fecha
      FROM puntajes
      JOIN login ON puntajes.id_usuario = login.id
      ORDER BY puntajes.puntaje DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en /ranking:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ranking' });
  }
});
app.get('/mis-puntajes/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  const [rows] = await db.query(
    'SELECT modulo, puntaje, fecha FROM puntajes WHERE id_usuario = ? ORDER BY fecha DESC',
    [id_usuario]
  );
  res.json({ success: true, data: rows });
});
app.post("/guardar_mascota", async (req, res) => {
  const { id_usuario, mascota } = req.body;
  try {
    await db.query("UPDATE login SET mascota = ? WHERE id = ?", [mascota, id_usuario]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error en /guardar_mascota:", err);
    res.sendStatus(500);
  }
});
app.post("/modulo-completado", async (req, res) => {
  const { id_usuario, modulo } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO modulos_completados (id_usuario, modulo) VALUES (?, ?)",
      [id_usuario, modulo]
    );
    res.json({ success: true, message: "Módulo marcado como completado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al guardar módulo" });
  }
});