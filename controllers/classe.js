module.exports = function (app, queryPromise) {

    // Récuperer toutes les classes créees
    app.get('/index/classes', async (req, res) => {
        try {
            const classes = await queryPromise(
                'Select c.*, u.pseudo, u.nom, u.prenom, u.age from classe as c inner join utilisateur as u on u.id = c.id_utilisateur ORDER BY u.id asc, c.nom_classe, c.id asc'
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
            const [classe] = await queryPromise('Select c.*, u.pseudo, u.nom, u.prenom, u.age from classe as c inner join utilisateur as u on u.id = c.id_utilisateur where c.id = ?', [id]);
            if (classe) {
                return res.json(classe);
            }
            return res.status(404).json({ error: 'Classe non trouvé !' });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible d\'obtenir la classe !' });
        }
    });

    // Ajouter une classe
    app.post('/index/classe', async (req, res) => {
        const { nom_classe, sexe, niveau, id_utilisateur } = req.body;  // Recupération des informations inscrites
        try {
            if (!['Archer', 'Assassin', 'Berseker', 'Chevalier', 'Soigneur'].includes(nom_classe)) {
                return res.status(404).json({ error: 'Veuillez insérer une classe existante !' });
            }
            if (!['F', 'M'].includes(sexe)) {
                return res.status(404).json({ error: 'Veuillez insérer M ou F en fonction de votre personnage !' });
            }
            if (niveau != parseInt(niveau) || niveau <= 0 || niveau > 100) {
                return res.status(404).json({ error: 'Votre niveau ne peut pas être supérieur à 100.' });
            }
            try {
                const [nb_id] = await queryPromise('Select count(id) as count from utilisateur where id = ?', [id_utilisateur]);
                if (nb_id != parseInt(nb_id) && nb_id.count == 0) {
                    return res.status(404).json({ error: 'Veuillez inscrire un ID existant.' });
                }
            } catch (e) {
                console.log(e);
                return res.status(400).json({ error: 'Une erreur est survenue !' });
            }
            const { insertId } = await queryPromise('Insert into classe (nom_classe, sexe, niveau, id_utilisateur) ' +
                'values (?, ?, ?, ?)', [nom_classe, sexe, niveau, id_utilisateur]);
            if (insertId != null) {
                const [classe] = await queryPromise('Select c.*, u.pseudo, u.nom, u.prenom, u.age from classe as c inner join utilisateur as u on u.id = c.id_utilisateur where c.id = ?', [insertId]);
                if (classe) {
                    return res.json(classe);
                }
            } res.status(404).json({ error: 'La classe n\'a pas été retrouvée.' });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible d\'obtenir La classe !' });
        }
    });

    // Supprimer une classe
    app.delete('/index/classe/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const result = await queryPromise('Delete from classe where id = ?', [id]);
            if (result.affectedRows === 1) {
                return res.status(204).send();
            }
            return res.status(404).json({ error: 'La classe n\'existe pas !' });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible de supprimer la classe !' });
        }
    });

    // Modifier une classe
    app.post('/index/classe/:id', async (req, res) => {
        const id = req.params.id;
        const { nom_classe, sexe, niveau } = req.body;  // Recupération des informations inscrites
        try {
            const [classe] = await queryPromise('Select c.*, u.pseudo, u.nom, u.prenom, u.age from classe as c inner join utilisateur as u on u.id = c.id_utilisateur where c.id = ?', [id]);
            if (classe == null) {
                return res.status(404).json({ error: 'La classe n\'a pas été retrouvée.' });
            }
            classe.nom_classe = nom_classe;
            classe.sexe = sexe;
            classe.niveau = niveau;

            if (!['Archer', 'Assassin', 'Berseker', 'Chevalier', 'Soigneur'].includes(nom_classe)) {
                return res.status(404).json({ error: 'Veuillez insérer une classe existante !' });
            }
            if (!['F', 'M'].includes(sexe)) {
                return res.status(404).json({ error: 'Veuillez insérer M ou F en fonction de votre personnage !' });
            }
            if (niveau != parseInt(niveau) || niveau <= 0 || niveau > 100) {
                return res.status(404).json({ error: 'Votre niveau ne peut pas être supérieur à 100.' });
            }
            const { affectedRows } = await queryPromise('Update classe set nom_classe = ?, sexe = ?, niveau = ? where id = ?', [
                classe.nom_classe, classe.sexe, classe.niveau, [id]
            ]);
            if (affectedRows == 0) {
                throw "Update failed !";
            }
            res.json(classe);
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible de modifier la classe !' });
        }
    });
}