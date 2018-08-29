
var passport = require('passport');

const auth=require('../Middlewares/AuthMiddleware.js')

module.exports = function(app,date)
{
	
	const bcrypt = require('bcrypt');
     app.get('/',function(req,res){
     	console.log(req.user);
     	console.log(req.isAuthenticated());
     	//console.log("Error:"+req.flash('error'));

        res.render('index',{success: 'no',message: req.flash('error')});
     });

     app.get('/Dashboard',auth(),function(req,res){
     	res.render('dashboard',{message: 'Welcome',users: req.user});
     });



      app.post('/register',function(req,res){

      	var user_name=req.body.full_name;
      	var user_gender=req.body.gender;
      	var user_address=req.body.address;
      	var user_email=req.body.email;
      	var user_password=bcrypt.hashSync(req.body.password,15);
      	var user_created_at=date.format(new Date(),'YYYY-MM-DD HH:mm:ss');   
      	const db=require('../db.js');  

      	db.query("INSERT INTO users (`user_name`,`user_password`,`user_email`,`user_gender`,`user_address`,`user_created_at`) VALUES (?,?,?,?,?,?)",[user_name,user_password,user_email,user_gender,user_address,user_created_at],
      		function(err,result){
      			if(err) throw err;
      			
      			//db.query("SELECT LAST_INSERT_ID() as user_id",function(err,result){
      				//if(err) throw err;
      				//console.log(result[0]);

      				//var data=[result[0],user_email,user_password];

      				//req.login(data,function(err){
      					//if(err) throw err;
      					res.redirect('/');
      				//});


      				
      			//});
      			// res.render('index',{success: 'yes'});

      		});


        
     });

      app.post('/login',passport.authenticate(
      		'local',{
      			successRedirect: "/Dashboard",
      			failureRedirect: "/",      			
      			failureFlash: true
      		}


      )

      );


      app.get('/logout',function(req,res){

      		req.logout();
      		req.session.destroy();
      		res.redirect('/');

      })

     
}

 passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
 
    done(null,user_id);
  
});