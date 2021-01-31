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
        try {
            if (age <= 4 || age >= 110) {
                return res.status(404).json({ error: 'Veuillez saisir votre âge !' });
            } if (pseudo.length >= 15) {
                return res.status(404).json({ error: 'Votre pseudo ne peut pas contenir plus de 15 caractères.' });
            } /* Si pseudo déjà prit
            else if(error){
                return res.status(404).json({ error: 'Votre pseudo est déjà utilisé. Veuillez en insérer un autre !' });
            }*/
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
                res.json('Le joueur contenant l\'id n°' + id + ' a été supprimé !');
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

        try {
            const [user] = await queryPromise('Select nom, prenom, age from utilisateur where id = ?', [id]);
            if (user == null) {
                return res.status(404).json({ error: 'L\'utilisateur n\'a pas été retrouvé.' });
            }
            user.nom = nom;
            user.prenom = prenom;
            user.age = age;

            if (user.age <= 4 || user.age >= 110) {
                return res.status(404).json({ error: 'Veuillez saisir votre âge !' });
            }
            const { affectedRows } = await queryPromise('Update utilisateur set nom = ?, prenom = ?, age = ? where id = ?', [
                user.nom, user.prenom, user.age, [id]
            ]);
            if(affectedRows == 0){
                throw "Update failed !";
            }
            res.json(user);
        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: 'Impossible de modifier l\'utilisateur !' });
        }
    });
}