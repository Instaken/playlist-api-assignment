const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// -- In-Memory Database --
let counter = 6;
let playlist = [
  { id: 1, title: 'Blinding Lights', artist: 'Ahe XD', duration: '3:32' },
  { id: 2, title: 'Levitating', artist: 'Dua Aua', duration: '3:40' },
  { id: 3, title: 'Watermelon Sugar', artist: 'Ave Ado', duration: '3:34' },
  { id: 4, title: 'Save Your Tears', artist: 'Ahe XD', duration: '4:06' },
  { id: 5, title: 'Peaches', artist: 'Justin', duration: '3:35' }
];

// ---------- SWAGGER CONFIG ----------
/**
 * @swagger
 * components:
 *   schemas:
 *     Song:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         artist:
 *           type: string
 *         duration:
 *           type: string
 *     NewSong:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         artist:
 *           type: string
 *         duration:
 *           type: string
 */
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Playlist API (Grup 2)',
      version: '1.0.0',
      description: 'SE4458 Assignment 2 için Express.js ile hazırlanan Playlist API',
    },
  },
  apis: ['./index.js'],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ---------- ENDPOINTS ----------

app.get('/', (req, res) => {
    res.send('Playlist API is running!');
});

/**
 * @swagger
 * /songs:
 *   get:
 *     summary: Playlist'teki tüm şarkıları listeler
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: Başarılı. Şarkı listesi döndürülür.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Song'
 */
app.get('/songs', (req, res) => {
  res.json(playlist);
});

/**
 * @swagger
 * /songs:
 *   post:
 *     summary: Yeni bir şarkı ekler
 *     tags: [Songs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewSong'
 *     responses:
 *       201:
 *         description: Şarkı başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Song'
 */
app.post('/songs', (req, res) => {
  const newSong = { id: counter++, ...req.body };
  playlist.push(newSong);
  res.status(201).json(newSong);
});

/**
 * @swagger
 * /songs/search:
 *   get:
 *     summary: Şarkı başlığı veya sanatçı adına göre arama yapar
 *     tags: [Songs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Aranacak kelime (şarkı başlığı veya sanatçı)
 *     responses:
 *       200:
 *         description: Eşleşen şarkılar döndürülür
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Song'
 */
app.get('/songs/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const results = playlist.filter(
    song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
  );
  res.json(results);
});

/**
 * @swagger
 * /songs/{id}:
 *   put:
 *     summary: Belirli bir şarkıyı günceller
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek şarkının ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewSong'
 *     responses:
 *       200:
 *         description: Şarkı başarıyla güncellendi
 *       404:
 *         description: Şarkı bulunamadı
 */
app.put('/songs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const songIndex = playlist.findIndex(s => s.id === id);

  if (songIndex !== -1) {
    const updatedSong = { ...playlist[songIndex], ...req.body };
    playlist[songIndex] = updatedSong;
    res.json(updatedSong);
  } else {
    res.status(404).send('Şarkı bulunamadı');
  }
});

/**
 * @swagger
 * /songs/{id}:
 *   delete:
 *     summary: Belirli bir şarkıyı siler
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Şarkı başarıyla silindi
 *       404:
 *         description: Şarkı bulunamadı
 */
app.delete('/songs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const songIndex = playlist.findIndex(s => s.id === id);

  if (songIndex !== -1) {
    playlist.splice(songIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Şarkı bulunamadı');
  }
});

// ---------- SERVER START ----------
app.listen(port, () => {
  console.log(`Playlist API http://localhost:${port} adresinde çalışıyor`);
  console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
