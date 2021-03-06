const Sauce = require('../models/Sauce');
const fs = require('fs');

// Création d'une nouvelle sauce (Post)
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        // Création de l'URL de l'image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: "0",
        dislikes: "0",
        usersLiked: [`First`],
        usersDisliked: [`First`]

    });
    // Enregistrement de l'objet sauce dans la base de données
    sauce.save()
        .then(() => res.status(201).json({
            message: 'Sauce enregistré !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
}

// Lecture de toutes les sauces dans la base de données (Get)
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({
            error
        }));
};

// Lecture d'une sauce avec son ID (Get/:id)
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({
            error
        }));
};


// Modification d'une sauce (Update)
exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file ?
        // Si image true
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

        Sauce.updateOne({ _id: req.params.id }, {
            ...sauceObject,
            _id: req.params.id
        })
        .then(() => res.status(200).json({
            message: 'Objet modifié !'
        }))
        .catch(error => res.status(400).json({ error }));
};

// Suppression d'une sauce (Delete)
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            // Récupération du nom du fichier
            const filename = sauce.imageUrl.split('/images/')[1];
            // Suppression du fichier (unlink)
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Élément supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Création like ou dislike (Post/:id/like)
exports.likeOrDislike = (req, res, next) => {
    // Si l'utilisateur aime la sauce
    if (req.body.like === 1) {
        // On ajoute 1 like et on l'envoie dans le tableau "usersLiked"
        Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: req.body.like++ },
                $push: { usersLiked: req.body.userId }
            })
            .then(() => res.status(200).json({ message: 'Like ajouté !' }))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like === -1) {
        // Si l'utilisateur n'aime pas la sauce
        // On ajoute 1 dislike et on l'envoie dans le tableau "usersDisliked"
        Sauce.updateOne({
                _id: req.params.id }, {
                $inc: { dislikes: req.body.like * -1 },
                $push: { usersDisliked: req.body.userId }
            })
            .then(() => res.status(200).json({ message: 'Dislike ajouté !' }))
            .catch(error => res.status(400).json({ error }));
    } else {
        // recherche si l'utilisateur est déjà dans le tableau usersLiked
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                // Si le tableau "userLiked" contient l'ID de l'utilisateur
                if (sauce.usersLiked.includes(req.body.userId)) {
                    // On enlève un like du tableau "userLiked" 
                    Sauce.updateOne({
                            _id: req.params.id }, {
                            $pull: { usersLiked: req.body.userId },
                            $inc: { likes: -1 } })
                        .then(() => { res.status(200).json({ message: 'Like supprimé !' }) })
                        .catch(error => res.status(400).json({ error }))
                } else if (sauce.usersDisliked.includes(req.body.userId)) {
                    // Si le tableau "userDisliked" contient l'ID de l'utilisateur
                    // On enlève un dislike du tableau "userDisliked" 
                    Sauce.updateOne({
                            _id: req.params.id
                        }, {
                            $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                        .then(() => {
                            res.status(200).json({ message: 'Dislike supprimé !' })
                        })
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(400).json({ error }));
    }
};