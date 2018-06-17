const express = require('express');
const router = express.Router();

// Bring in Article model
let Article = require('../models/article');

// Add route
router.get('/add', function(req, res)
{
    res.render('add_article', {
        title:'Add Article'
    });
});

// Add submit POST route
router.post('/add', function(req, res)
{
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
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
        article.author = req.body.author;
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
router.get('/edit/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        res.render('edit_article', {
            title:'Edit Article',
            article:article
        });
    });
});

// Update submit POST route
router.post('/edit/:id', function(req, res)
{
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
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
});

// Delete route
router.delete('/:id', function(req, res) {
    let query = {_id:req.params.id};

    Article.remove(query, function(error) {
        if (error) {
            console.log(error);
        }
        else {
            req.flash('success', 'Article deleted');
            res.send('Success');
        }
    })
});

// Get single article
router.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        res.render('article', {
            article:article
        });
    });
});

module.exports = router;