const joi = require('joi');

module.exports = function (app, queryPromise) {

    // Récupérer tous les utilisateurs
    app.get('/index/utilisateurs', async (req, res) => {
        try {
            const users = await queryPromise('Select * from utilisateur');
            res.json(users);
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible d\'obtenir la liste des utilisateurs !' });
        }
    });

    // Récupérer les utilisateurs sans doublon
    app.get('/index/utilisateurs/noDuplicate', async (req, res) => {
        try {
            const classes = await queryPromise(
                'Select id, pseudo from utilisateur group by pseudo order by id'
            );
            res.json(classes);
        } catch (e) {
            res.status(400).json({ error: 'Impossible de récuperer les utilisateurs !' });
        }
    });

    // Récupérer un utilisateur
    app.get('/index/utilisateur/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const [user] = await queryPromise('Select * from utilisateur where id = ?', [id]);
            if (user) {
                return res.json(user);
            }
            return res.status(404).json({ error: 'Utilisateur non trouvé !' });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible d\'obtenir l\'utilisateur !' });
        }
    });

    // Ajouter un utilisateur
    app.post('/index/utilisateur', async (req, res) => {
        const { nom, prenom, age, pseudo } = req.body;  // Recupération des informations inscrites
        
        const schema = joi.object({
            nom: joi.string().alphanum().min(2).max(20).required(),
            prenom: joi.string().alphanum().min(2).max(20).required(),
            age: joi.number().integer().min(5).max(110).required(),
            pseudo: joi.string().min(3).max(15).required(),
        });

        const { error } = schema.validate(req.body);

        if (error != null) {
            const firstError = error.details[0];
            return res.status(404).json({ error: firstError.message });
        }
        
        try {
            const [unique] = await queryPromise(
                'Select count(pseudo) as count from utilisateur where pseudo = ?', [pseudo]
            );
            if (unique.count > 0) {
                return res.status(404).json({ error: 'Votre pseudo est déjà utilisé. Veuillez en insérer un autre !' });
            }
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Une erreur est survenue !' });
        }
        try {
            const { insertId } = await queryPromise('Insert into utilisateur (nom, prenom, age, pseudo) ' +
                'values (?, ?, ?, ?)', [nom, prenom, age, pseudo]);
            if (insertId != null) {
                const [user] = await queryPromise('Select * from utilisateur where id = ?', [insertId]);
                if (user) {
                    return res.json(user);
                }
            } res.status(404).json({ error: 'L\'utilisateur n\'a pas été retrouvé.' });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible d\'obtenir l\'utilisateur !' });
        }
    });

    // Supprimer un utilisateur
    app.delete('/index/utilisateur/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const result = await queryPromise('Delete from utilisateur where id = ?', [id]);
            if (result.affectedRows === 1) {
                return res.status(204).send();
            }
            return res.status(404).json({ error: 'L\'utilisateur n\'existe pas !' });
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible de supprimer l\'utilisateur !' });
        }
    });

    // Modifier un utilisateur
    app.post('/index/utilisateur/:id', async (req, res) => {
        const id = req.params.id;
        const { nom, prenom, age } = req.body;  // Recupération des informations inscrites

        const schema = joi.object({
            nom: joi.string().alphanum().min(2).max(20).required(),
            prenom: joi.string().alphanum().min(2).max(20).required(),
            age: joi.number().integer().min(5).max(110).required(),
        });

        const { error } = schema.validate(req.body);

        if (error != null) {
            const firstError = error.details[0];
            return res.status(404).json({ error: firstError.message });
        }
        try {
            const [user] = await queryPromise('Select nom, prenom, age from utilisateur where id = ?', [id]);
            if (user == null) {
                return res.status(404).json({ error: 'L\'utilisateur n\'a pas été retrouvé.' });
            }
            user.nom = nom;
            user.prenom = prenom;
            user.age = age;

            const { affectedRows } = await queryPromise('Update utilisateur set nom = ?, prenom = ?, age = ? where id = ?', [
                user.nom, user.prenom, user.age, [id]
            ]);
            if (affectedRows == 0) {
                throw "Update failed !";
            }
            res.json(user);
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible de modifier l\'utilisateur !' });
        }
    });
}