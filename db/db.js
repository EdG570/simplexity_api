module.exports = function () {
    const mongoose = require('mongoose')
    const config = require('../config/config')
    const debug = require('debug')('Database:Connection')

    const dbUrl = `mongodb://${ config.db.host }:${ config.db.port }/${ config.db.name }`

    mongoose.connect(dbUrl, { useNewUrlParser: true })
        .then(() => {
            debug(`Successfully connected to MongoDB: ${ dbUrl }`)
        }).catch((error) => {
            debug(`An error occurred connecting to MongoDB. Error: ${ error }`)
        })
        
    const db = mongoose.connection;

    db.on('connected', function () {
        debug('Watching MongoDB connection...')
    });

    db.on('error',function (err) {  
        debug('Mongoose default connection error: ' + err);
    }); 
    
    db.on('disconnected', function () {  
        debug('Mongoose default connection disconnected'); 
    });
    
    // If the Node process ends, close the Mongoose connection 
    db.on('SIGINT', function() {  
        mongoose.connection.close(function () { 
        debug('Mongoose default connection disconnected through app termination'); 
        process.exit(0); 
        }); 
    });

}