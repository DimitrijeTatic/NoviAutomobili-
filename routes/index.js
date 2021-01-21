const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Oglas = require('./../models/Oglas');
const multer = require('multer');
const fs = require('fs')

// Storage podesavanja za destinaciju i ime fajla koja prosledjujemo multeru
const storage = multer.diskStorage({
  destination: function(req,res,cb){
    cb(null,'./uploads/');
  },
  filename: function(req,file,cb){
    cb(null, Date.now() + file.originalname);
  }
});

//File filter sluzi da prihvatimo ili odbijemo fajl
const fileFilter = (req,file,cb)=>{
  // Ako je slika jpeg ili png prihvatamo, ako nije onda ne
  if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
    cb(null,true);
  } else {
    cb(null,false,{'error_msg':'Slika treba biti u JPEG/JPG ili PNG formatu!'});
  }

}
// Takodje stavljamo limit slike na 5mb
const upload = multer({
  storage: storage, 
  limits:{
  // 5mb
  fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter

});





router.get('/', async (req, res)=>
{
  const oglasi =await Oglas.find().sort({datum:'desc'}); 
  res.render('oglasi/index',{oglasi:oglasi,user:req.user});
});

router.get('/novi',ensureAuthenticated,(req,res)=>{
  // Prosledjujemo novi oglas jer u template-u novog oglasa imamo vrednosti oglasa u poljima da bi se ispisali ako nesto nije u redu
  res.render('oglasi/novi',{oglas: new Oglas(),user:req.user,novi:'novi'});
});

// Stranica jednog oglasa na osnovu SLUG-a 
router.get('/:slug',async (req,res)=>{
  const oglas = await Oglas.findOne({slug: req.params.slug});
  if(oglas==null){
    req.flash('error_msg','Traženi oglas ne postoji!');
    res.redirect('/');
  } 
  res.render('oglasi/oglas',{oglas:oglas,user:req.user});
});

// Asinhrona funkcija zbog cuvanja u bazi
router.post('/novi',ensureAuthenticated, upload.array('slika',10),async (req,res)=>{
  let oglas = new Oglas({
      naslov: req.body.naslov,
      model: req.body.model,
      cena: req.body.cena,
      godiste: req.body.godiste,
      karoserija: req.body.karoserija,
      gorivo: req.body.gorivo,
      grad: req.body.grad,
      opis: req.body.opis,
      user_slug: req.user.slug
  });

  let slika = '';
  req.files.forEach(function(files,index,arr){
    slika = slika + files.path + ',';
  });
  slika = slika.substring(0,slika.lastIndexOf(','));
  slika = slika.split(',');
  oglas.slika = slika;

  try{
      oglas = await oglas.save();
      req.flash('success_msg','Uspešno dodat oglas!');
      res.redirect(`/oglasi/${oglas.slug}`);
  } catch (e) {
      req.flash('error_msg','Došlo je do problema, pokušajte ponovo!');
      res.render('oglasi/novi',{oglas: oglas,errors:{msg:'Došlo je do problema pokušajte ponovo!'}});
  }
});

router.delete('/izbrisi/:id',ensureAuthenticated,async(req,res)=>{
  let slika = await Oglas.findById(req.params.id);
  for(i=0;i<slika.slika.length;i++){
    fs.unlink("./"+slika.slika[i], (err) => {
      if (err) {
          console.log("failed to delete local image:"+err);
      } else {
          console.log('successfully deleted local image');                                
      }
    });
  }
  await Oglas.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

router.get('/izmeni/:id',ensureAuthenticated,async(req,res)=>{
  const oglas = await Oglas.findById(req.params.id);
  res.render('oglasi/izmeni',{oglas:oglas,user:req.user});
}); 

router.put('/izmeni/:id',ensureAuthenticated,async(req,res)=>{
  let oglas = await Oglas.findById(req.params.id);
  oglas.naslov= req.body.naslov;
  oglas.model= req.body.model;
  oglas.cena= req.body.cena;
  oglas.godiste= req.body.godiste;
  oglas.karoserija= req.body.karoserija;
  oglas.gorivo= req.body.gorivo;
  oglas.grad= req.body.grad;
  oglas.opis= req.body.opis;
  oglas.user_slug=req.user.slug;
  try{
      oglas = await oglas.save();
      req.flash('success_msg','Uspešno izmenjen oglas!');
      res.redirect(`/oglasi/${oglas.slug}`);
  } catch (e) {
      res.render('oglasi/izmena',{oglas:oglas,error:"Došlo je do problema, pokušajte ponovo!"});
  }
});

router.get('/moji/:slug',ensureAuthenticated,async(req,res)=>{
  let oglasi = await Oglas.find({user_slug:req.params.slug});
  res.render('oglasi/moji',{oglasi:oglasi,user:req.user});
});


module.exports = router;
