const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Connetti al database MongoDB
mongoose.connect('mongodb://localhost:27017/calciatori', { useNewUrlParser: true, useUnifiedTopology: true });

// Definisci lo schema e il modello per i calciatori
const playerSchema = new mongoose.Schema({
    name: String,
    presenceCount: { type: Number, default: 0 },
    dailyPresences: { type: Map, of: Number, default: {} } // Aggiungi questa linea
});

const Player = mongoose.model('Player', playerSchema);

// API per ottenere tutti i calciatori
app.get('/api/players', async (req, res) => {
    const players = await Player.find();
    res.json(players);
});

// API per aggiungere un nuovo calciatore
app.post('/api/players', async (req, res) => {
    const newPlayer = new Player({ name: req.body.name });
    await newPlayer.save();
    res.json(newPlayer);
});

// API per incrementare la presenza di un calciatore in un giorno specifico
app.post('/api/players/:id/increment/:date', async (req, res) => {
    const player = await Player.findById(req.params.id);
    if (player) {
        const date = req.params.date;
        // Incrementa la presenza per la data specifica
        if (player.dailyPresences.has(date)) {
            player.dailyPresences.set(date, player.dailyPresences.get(date) + 1);
        } else {
            player.dailyPresences.set(date, 1);
        }
        // Aumenta anche il conteggio totale delle presenze
        player.presenceCount += 1;
        await player.save();
        res.json(player);
    } else {
        res.status(404).send('Player not found');
    }
});

app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});
