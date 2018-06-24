const express = require('express');
const router = express.Router();

// Bring in models
let Article = require('../models/article');
let User = require('../models/user');

// Add route
router.get('/add', ensureAuthenticated, function(req, res) {
    res.render('add_article', {
        title:'Add Article'
    });
});

// Add submit POST route
router.post('/add', function(req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get errors
    let errors = req.validationErrors();
    if ( errors ) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(error)
        {
            if (error) {
                console.log(error);
                return;
            } else {
                req.flash('success', 'Article added');
                res.redirect('/');
            }
        });
    }
});

// Load edit form for a single article
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not authorized');
            res.redirect('/');
        } else {
            res.render('edit_article', {
                title:'Edit Article',
                article:article
            });
        }
    });
});

// Update submit POST route
router.post('/edit/:id', function(req, res)
{
    if (!req.user || !req.user._id) {
        res.status(500).send();
    } else {
        let article = {};
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
    
        let query = {_id:req.params.id};
    
        Article.update(query, article, function(error)
        {
            if (error)
            {
                console.log(error);
                return;
            }
            else
            {
                req.flash('success', 'Article updated');
                res.redirect('/');
            }
        });
    }
});

// Delete route
router.delete('/:id', ensureAuthenticated, function(req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = {_id:req.params.id};
    Article.findById(req.params.id, function(err, article) {
        if (article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, function(error) {
                if (error) {
                    console.log(error);
                }
                else {
                    req.flash('success', 'Article deleted');
                    res.send('Success');
                }
            });
        }
    });    
});

// Get single article
router.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (article) {
            User.findById(article.author, function(err, user) {
                if (user) {
                    res.render('article', {
                        article:article,
                        author: user.name
                    });
                }
            });
        }
    });
});

// Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;