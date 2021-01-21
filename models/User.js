const mongoose = require('mongoose');

// Omogucava nam da NASLOV npr. bude umesto ID-a u URL-u
const slugify = require('slugify');

const UserSchema = new mongoose.Schema({
  ime: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  lozinka: {
    type: String,
    required: true
  },
  slug: {
    type:String,
    required:true,
    unique:true
  }
});

// VALIDACIJA -> treba nam next da bi otiso na sledecu funkciju
UserSchema.pre('validate', function(next){
  if(this.ime){
      // STRICT -> Oznacava da ce da izbrise nedozvoljene karaktere iz stringa kako bi ga upotrebili u URL-u
      this.slug = slugify(this.ime, {lower:true, strict:true})
  }

  next();
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
