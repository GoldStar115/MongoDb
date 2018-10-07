var mongoose = require('mongoose');
var interfaceSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ' '
    },
    subTitle: {
        type: String,
        default: ' '
    },
    subTitleLink: {
        type: String,
        default: ' '
    },
    content: {
        type: String,
        default: ' '
    },
    contentLink: {
        type: String,
        default: ' '
    },
    elementTitle: {
        type: String,
        default: ' '
    },
    elementLink: {
        type: String,
        default: ' '
    },
    elementNum : {
        type : Number,
        default : 0
    }
});

mongoose.model('interface', interfaceSchema);
