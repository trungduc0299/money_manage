const path = require('path')
const express = require('express')

const configViewEngine = (app) => {
    app.use(express.static(path.join('./src/', 'public')))
    app.set('views', path.join('./src/', 'views'));
    app.set('view engine', 'ejs');
    //config req.body
    app.use(express.json());
    app.use(express.urlencoded({ extends: true }));
}

module.exports = configViewEngine;