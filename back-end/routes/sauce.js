const express = require('express');

const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/register-img');

// Routes
/* Ajouter une sauce */
router.post('/', auth, multer, sauceCtrl.createSauce);

/* Récupérer toutes les sauces */
router.get('/', auth, sauceCtrl.getAllSauces);

/* Récupérer une sauce déterminée */
router.get('/:id', auth, sauceCtrl.getOneSauce);

/* Modifier une sauce déterminée */
router.put('/:id', auth, sauceCtrl.updateSauce);

/* Supprimée une sauce déterminée*/
router.delete('/:id', auth, sauceCtrl.deleteSauce);

/* Liker ou disliker une sauce */
router.post('/:id/like', auth, sauceCtrl.likeOrDislike ); 

module.exports = router;