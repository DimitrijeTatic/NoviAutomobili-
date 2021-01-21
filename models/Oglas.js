const mongoose = require('mongoose');

// Omogucava nam da NASLOV npr. bude umesto ID-a u URL-u
const slugify = require('slugify');





const oglasSchema = new mongoose.Schema({
    naslov:{
        type: String,
        requred: true
    },
    datum:{
        type: Date,
        default: Date.now
    },
    model:{
        type:String,
        required:true
    },
    cena:{
        type: String,
        required: true  
    },
    godiste:{
        type: String,
        required: true  
    },
    karoserija:{
        type: String,
        required: true  
    },
    gorivo:{
        type: String,
        required: true  
    },
    grad:{
        type: String,
        required: true  
    },
    opis:{
        type: String,
        required:true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    slika: {
        type: Array,
        value: [String],
        required: true
    },
    user_slug:{
        type:String,
        required:true
    }
})

// VALIDACIJA -> treba nam next da bi otiso na sledecu funkciju
oglasSchema.pre('validate', function(next){
    if(this.naslov){
        // STRICT -> Oznacava da ce da izbrise nedozvoljene karaktere iz stringa kako bi ga upotrebili u URL-u
        this.slug = slugify(this.naslov, {lower:true, strict:true})
    }

    next();
});

module.exports = mongoose.model('Oglas', oglasSchema);