var mongoose=require('mongoose');

var  farnellSchema=new mongoose.Schema({
    title:{
        type : String,
        default: ' '
      },
    thumbnail:{
        type : String,
        default: ' '
      },
    datasheet :{
        type : String,
        default: ' '
      },
    datasheetTitle : {
        type : String,
        default: ' '
      },
    description:{
      type : String,
      default: ' '
    },
    price  : {
      type : String,
      default : '0'
    }
  });

mongoose.model('FarnellDB-connectors',farnellSchema);
