const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
    });
    if (req.file && req.file.filename) {
        sauce.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }
    sauce.save()
        .then(() => {
            res.status(201).json({ message: "Objet enregistré !" })
        })
        .catch((error) => {
            console.log(error);
            res.status(400).json({ error });
        })
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({ error: error });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                if (req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                            .catch(error => res.status(401).json({ error }));
                    })
                } else {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                        .catch(error => res.status(401).json({ error }));
                }
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({ message: 'Objet supprimé !' })
                        })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error: error });
        });
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({ error: error });
        }
    );
};

exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch (req.body.like) {
                case 1:
                    if (!(sauce.usersLiked.includes(req.body.userId)) && !(sauce.usersDisliked.includes(req.body.userId))) {
                        sauce.likes++;
                        sauce.usersLiked.push(req.body.userId);
                    } else {
                        return res.status(403).json({ error: "Vous avez déjà noté cette sauce !" })
                    }
                    break;
                case 0:
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        const userIndex = sauce.usersLiked.findIndex(id => id == req.body.userId);
                        sauce.usersLiked.splice(userIndex, 1);
                        sauce.likes--;
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        const userIndex = sauce.usersDisliked.findIndex(id => id == req.body.userId);
                        sauce.usersDisliked.splice(userIndex, 1);
                        sauce.dislikes--;
                    }
                    break;
                case -1:
                    if (!(sauce.usersDisliked.includes(req.body.userId)) && !(sauce.usersLiked.includes(req.body.userId))) {
                        sauce.dislikes++;
                        sauce.usersDisliked.push(req.body.userId);
                    } else {
                        return res.status(403).json({ error: "Vous avez déjà noté cette sauce !" })
                    }
                    break;
                default:
                    return res.status(500).json({ error: "Une erreur inconnue est survenue !" });
            }
            Sauce.updateOne({ _id: req.params.id }, sauce )
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(401).json({ error })); 
        })
        .catch(error => {
            console.log(error);
            return res.status(500).json({ error })
        })
        
}