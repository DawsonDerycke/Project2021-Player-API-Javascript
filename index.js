const express = require('express');
const app = express();
const cors = require('cors');
const body_parser = require('body-parser');
const db = require('./bdd');

app.use(body_parser.urlencoded({ extended: false }));
app.use(cors());

const port = 3001;


app.listen(port, () => {
    console.log('Server started : ' + port);
});

function query(request, data) {
    return new Promise((resolve, reject) => {
        db.query(request, (data || []), (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

// Récuperer tous les utilisateurs
app.get('/index/utilisateurs', async (req, res) => {
    try {
        const users = await query('Select * from utilisateur');
        res.json(users);
    } catch (e) {
        res.status(400).json({ error: 'Impossible d\'obtenir la liste des utilisateurs !' });
    }
});

// Récuperer toutes les classes créees
app.get('/index/classes', async (req, res) => {
    try {
        const classes = await query('Select * from classe');
        res.json(classes);
    } catch (e) {
        res.status(400).json({ error: 'Impossible de récuperer les classes !' });
    }
});

// Ajouter un utilisateur
app.post('/index/utilisateur', function (req, res) {
    const data = req.body;  // Recupération des informations inscrites

    if (data.age <= 4 || data.age >= 110) {
        return res.status(400).json({ error: 'Veuillez saisir votre âge !' });
    } else if(data.pseudo.length >= 15 ) {
        return res.status(400).json({ error: 'Votre pseudo ne peut pas contenir plus de 15 caractères.' });
    } else {
        db.query('Insert into utilisateur (nom, prenom, age, pseudo) values (?, ?, ?, ?)',
            [data.nom, data.prenom, data.age, data.pseudo], (error, result) => {
            if (error) {
                return res.status(400).json({ 
                    error: 'Votre pseudo : ' + data.pseudo + ' n\'est pas disponible. Veuillez en insérer un autre.'
                });
            }
            const id = result.insertId;

            db.query('Select * from utilisateur where id = ?', [id], function (error, result) {
                if (error) {
                    return res.status(400).json({ error: 'Impossible d\'obtenir l\'utilisateur !' });
                }

                const new_user = result.shift();

                if (new_user) {
                    return res.json(new_user);
                } res.status(404).json({ error: 'L\'utilisateur n\'a pas été retrouvé.' });
            });
        });
    }
});