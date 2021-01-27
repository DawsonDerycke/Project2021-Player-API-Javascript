module.exports = function (app, queryPromise) {

    // Récuperer toutes les classes créees
    app.get('/index/classes', async (req, res) => {
        try {
            const classes = await queryPromise(
                'Select c.*, u.pseudo from classe as c join utilisateur as u on u.id = c.id_utilisateur'
            );
            res.json(classes);
        } catch (e) {
            res.status(400).json({ error: 'Impossible de récuperer les classes !' });
        }
    });

    // Récupérer une classe
    app.get('/index/classe/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const classe = await queryPromise('Select * from classe where id = ?', [id]);
            res.json(classe);
        } catch (e) {
            console.log(e);
            res.status(400).json({ error: 'Impossible d\'obtenir la classe !' });
        }
    });
    // Ajouter une classe
    app.post('/index/classe', (req, res) => {
        const data = req.body;  // Recupération des informations inscrites

        db.queryPromise('Insert into classe (nom_classe, sexe, niveau) values (?, ?, ?)',
            [data.nom_classe, data.sexe, data.niveau], (error, result) => {
                if (error) {
                    return res.status(400).json({ error: 'Impossible d\'enregistrer la classe' });
                }
                // Récupérer le nouvel Id
                const id = result.insertId;

                db.queryPromise('Select * from classe where id = ?', [id], (error, result) => {
                    if (error) {
                        return res.status(400).json({ error: 'Impossible d\'obtenir la classe !' });
                    }

                    const new_classe = result.shift();

                    if (new_classe) {
                        return res.json(new_classe);
                    } res.status(404).json({ error: 'La classe n\'a pas été retrouvée.' });
                });
            });

    });

    // Supprimer une classe
    app.delete('/index/classe/:id', (req, res) => {
        const id = req.params.id;

        db.queryPromise('Delete from classe where id = ?', [id], (error, result) => {
            if (result.affectedRows === 1) {
                res.json('La classe n°' + id + ' est supprimée !');
                return res.status(204).send();
            } else if (error) {
                return res.status(400).json({ error: 'La classe n\'a pas pu être supprimée !' });
            } return res.status(404).json({ error: 'La classe n\'existe pas !' });
        });
    });

    // Modifier une classe
    app.post('/index/classe/:id', (req, res) => {
        const id = req.params.id;
        const nom_classe = req.body.nom_classe;
        const sexe = req.body.sexe;
        const niveau = req.body.niveau;

        db.queryPromise('Select nom_classe, sexe, niveau from classe where id = ?', [id], (error, result) => {
            if (error) {
                return res.status(400).json({ error: 'Impossible de modifier la classe.' });
            }
            if (result.length != 1) {
                return res.status(404).json({ error: 'La classe n\'a pas été retrouvée.' });
            }

            const classe = result[0];
            classe.nom_classe = nom_classe;
            classe.sexe = sexe;
            classe.niveau = niveau;

            db.queryPromise('Update classe set nom_classe = ?, sexe = ?, niveau = ? where id = ?', [
                classe.nom_classe, classe.sexe, classe.niveau, [id]
            ], (error) => {
                if (error) {
                    return res.status(400).json({ error: 'La mise à jour de la classe à échouée !' });
                }
                res.json(classe);
            });
        });
    });
}

