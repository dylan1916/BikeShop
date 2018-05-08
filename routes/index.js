var express = require('express');
var stripe  = require("stripe")("sk_test_EEzCfVLN0pT0SdZHxbuPygXh");

var router = express.Router();



// Ici, je définis les bons identifiants
var validEmail    = 'dylantordjman@hotmail.fr';
var validPassword = 'papamaman'

// J'aurais aussi pu faire un tableau d'identifiants valides
// var validCredentials = [
//   {email: 'stringerbell@gmail.com', password: 'thewire'},
//   {email: 'tsankara@gmail.com', password: 'victory'}
// ]

var dataBike = [
  {name: "Model BIKO45", url:"/images/bike-1.jpg", price: 679},
  {name: "Model ZOOK7", url:"/images/bike-2.jpg", price: 799},
  {name: "Model LIKO89", url:"/images/bike-3.jpg", price: 839},
  {name: "Model GEWO", url:"/images/bike-4.jpg", price: 1206},
  {name: "Model TITAN5", url:"/images/bike-5.jpg", price: 989},
  {name: "Model AMIG39", url:"/images/bike-6.jpg", price: 599}
]

/* GET home page. */
// Ici, je définis ma route home page, je définis "index(.ejs)" comme étant la vue à appeler, et je lui donne l'accès aux 2 variables : dataBike qui correspond à une liste de vélo et isLoggedin qui nous indique si le user est connecté ou non.
router.get('/', function(req, res, next) {
  if(req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }
  res.render('index', { dataBike:dataBike, isLoggedIn: req.session.isLoggedIn });
});

router.post('/add-card', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardBike.push(req.body);
  res.render('shop', {dataCardBike : req.session.dataCardBike});
});

router.get('/delete-card', function(req, res, next) {
  console.log(req.query);
  req.session.dataCardBike.splice(req.query.position, 1)
  res.render('shop', {dataCardBike: req.session.dataCardBike});
});

// Ici, je définis ma route "/login" en méthode GET, à qui j'attribue la vue "login(.ejs)". Pour vulgariser, j'y accède depuis la barre d'adresse de mon navigateur
router.get('/login', function(req, res, next) {
  res.render('login');
});

// Ici, je définis ma route "/login" en méthode POST, elle est différente de celle définie ci-dessus, car la méthode n'est pas la même. Pour vulgariser, j'y accède depuis l'envoi d'un formulaire en method="POST" et en action="/login"
router.post('/login', function(req, res, next) {

  console.log('req.body ===>', req.body);
  // Ici, je véfie que l'email et le mot de passe entrés dans le formulaire correspondent bien aux emails et passwords valides définis plus haut.
  if (req.body.email == validEmail && req.body.password == validPassword) {
    // Si c'est le cas, je définis la propriété isLoggedIn, contenu dans req.session à true (vrai).
    req.session.isLoggedIn = true;
    // Ici, je lui passe la vue index(.ejs), je donne à ma vue l'accès aux variables dataBike et isLoggedIn
    res.render('index', {
      dataBike: dataBike,
      isLoggedIn: req.session.isLoggedIn
    });
  } else {
    // Dans le cas contraire, si les identifiants son incorrectes, isLoggedIn est définie à false et je réaffiche ma page de login (jusqu'à ce que ces identifiants soient corrects)
    req.session.isLoggedIn = false;
    res.render('login');
  }
});

// Ici, je définis ma route '/logout' en GET, qui vous l'aurez compris, me sert à me déconnecter
router.get('/logout', function(req, res, next) {
  // Je définis simplement ma propriété "isLoggedIn" à false
  req.session.isLoggedIn = false;
  // Et je réaffiche ma vue index avec les variables qu'on a l'habitude le lui passer
  res.render('index', { isLoggedIn: req.session.isLoggedIn, dataBike: dataBike });
});

router.post('/update-card', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardBike[req.body.position].quantity = req.body.quantity;
  res.render('shop', {dataCardBike: req.session.dataCardBike});
});

router.post('/checkout', function(req, res, next) {

  var token = req.body.stripeToken;
  var totalCmd = 0;
  var productList= {};
  for(var i=0; i<req.session.dataCardBike.length; i++) {
    totalCmd = totalCmd + (req.session.dataCardBike[i].price*req.session.dataCardBike[i].quantity * 100);
    productList[req.session.dataCardBike[i].name] = req.session.dataCardBike[i].quantity;
  }


  stripe.customers.create({
    source: token,
    email: 'TEST.user@example.com',
  }).then(function(customer){
    var charge = stripe.charges.create({
      amount:totalCmd,
      currency: 'eur',
      description: 'Example charge',
      customer: customer.id,
      metadata: productList
    })
  }).then(function() {
    res.render('cmd-confirm');
  })



});


module.exports = router;
