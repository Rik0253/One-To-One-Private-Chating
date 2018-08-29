
var express=require('express');

var app= express();
var http=require('http').Server(app);
var io=require('socket.io')(http);
var cookieParser=require('cookie-parser');
var bodyParser=require('body-parser');
var date=require('date-and-time');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');
var bcrypt= require('bcrypt');
var SocketIOFile = require('socket.io-file');


var users={};
var friends={};
var publicKeys={};
var privateKeys={};


require('dotenv').config();
app.use(express.static(__dirname + '/assets'));

app.set('views',__dirname+'/views');
app.set('view engine','ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var options={
host:process.env.DB_HOST,
user:process.env.DB_USER,
password:process.env.DB_PASSWORD,
database:process.env.DB_NAME

};
var sessionStore = new MySQLStore(options);
app.use(session({
  secret: 'nodetutorial',
  name: 'node-tutorial',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(
  function(username, password, done) {
   
   console.log(username);
   console.log(password);
   const db=require('./db.js');

   db.query("SELECT user_id,user_name,user_password FROM users WHERE user_email = ?",[username],
   	function(err,results){
		if(err) {done(err)};

		//console.log(results.length);
		 if(results.length == 0){
		 	return done(null,false,{message: 'Invalid UserName Or Password.'});
		 }

		 const hash = results[0].user_password;
		 console.log(results[0].user_password);

		 bcrypt.compare(password,hash,function(err,response){

		 	if(err){ return done(null,false,{message: 'Password Doesnot Matches'})}


		 		// db.query("SELECT * FROM friends WHERE user_id = ?",[results[0].user_id],function(err,results){
		 		// 		if(err) throw err;

		 		// 		console.log(results);

		 		// 		//$.each(results,function(key,value){

		 		// 			//console.log('Friend:'+value);

		 		// 		//});

		 		// });


		 	return done(null,{user_id: results[0].user_id,user_name: results[0].user_name,user_password: results[0].user_password});

		 });

   	}

   	);


     // return done(null, false,);
    
  }
));

//app.engine('html', require('ejs').renderFile);


io.on('connection',function(socket){
		const db=require('./db.js'); 

    socket.on('check key',function(id,callback){
      db.query("SELECT public_key,private_key FROM user_keys WHERE user_id=?",[id],function(err,result){
        if(err) throw err;
        if(result.length>0)
        {
          publicKeys[id]=result[0].public_key;
          privateKeys[id]=result[0].private_key;
        callback(result);

      }
      else
      {
        callback('nodata');
      }

      });
    });

    socket.on('set key',function(id,privatekey,publickey,callback){
      db.query("INSERT INTO user_keys (`user_id`,`public_key`,`private_key`,`created_on`) VALUES (?,?,?,?)",[id,publickey,privatekey,date.format(new Date(),'YYYY-MM-DD HH:mm:ss')],function(err,result){

        if(err) throw err;

        publicKeys[id]=publickey;
        privateKeys[id]=privatekey;
        callback('ok');

      });


    });

		

		 socket.on('add user',function(data,username){

//console.log(session.passport);

		 	// we store the username in the socket session for this client
			socket.username = data;
			// add the client's username to the global list
    		users[data] = [socket.id,username,publicKeys[data]];
    		// echo to client they've connected
    		socket.emit('updatechat', 'SERVER', 'you have connected');
   			 // echo globally (all clients) that a person has connected
    		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
   			 // update the list of users in chat, client-side
   			 console.log(users);
		io.emit('updateusers', users);

		 });

     socket.on('get p key',function(id,callback){
      callback(privateKeys[id]);

     });


		 socket.on('chat message',function(socketid,from,to,encmsg,callback){

		 	//console.log(socketid);
		 	console.log(encmsg);
		 	callback('ok');



		 	db.query("INSERT INTO chat_data (`chat_from`,`chat_to`,`chat_body`,`chat_at`,`chat_read`) VALUES (?,?,?,?,?)",[from,to,encmsg,date.format(new Date(),'YYYY-MM-DD HH:mm:ss'),'0'],function(err,result){
		 		if(err) throw err;

		 		io.to(socketid).emit('chat recieve',from,users[from][1],users[from][0],encmsg);


		 	});

		 	


		 });
		 var path = require('path');
		var count = 0;


		 /***************FILE UPLOADING**************************/
		  var uploader = new SocketIOFile(socket, {
        // uploadDir: {			// multiple directories
        // 	music: 'data/music',
        // 	document: 'data/document'
        // },
        uploadDir: {
          music: 'assets/uploads/audio',
          image: 'assets/uploads/images'



          },							// simple directory
        accepts: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'audio/mp3', 'audio/mp4', 'audio/mpeg'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
        maxFileSize: 10242880, 						// 4 MB. default is undefined(no limit)
        chunkSize: 10240,							// default is 10240(1KB)
        transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
        overwrite: true,
        rename: function(filename) {
		var file = path.parse(filename);
        var fname = file.name;
        var ext = file.ext;
	return `${fname}_${count++}.${ext}`;
} 							// overwrite file if exists, default is true.
    });
    uploader.on('start', (fileInfo) => {
        console.log('Start uploading');
        console.log(fileInfo);
    });
    uploader.on('stream', (fileInfo) => {
        console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
    });
    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.');
        console.log(fileInfo);
    });
    uploader.on('error', (err) => {
        console.log('Error!', err);
    });
    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo);
    });



		 /****************FILE UPLOADING ENDS********************/


socket.on('typing',function(msg,sockid,id){

io.to(sockid).emit('recieve typing',msg,id);
});

socket.on('data read',function(to,from,sock){

	db.query("UPDATE chat_data SET chat_read='1' WHERE chat_from=? AND chat_to=?",[from,to],function(err,result){

		if(err) throw err;

		console.log('data read');
		io.to(sock).emit('read','ok',to);
	});

});

socket.on('get_data',function(id1,id2,sock,callback){

	//console.log('ID1:'+id1+' , ID2:'+id2);
db.query("UPDATE chat_data SET chat_read='1' WHERE chat_from=? AND chat_to=?",[id1,id2],function(err,result){
});



	db.query("SELECT C.chat_from,C.chat_to,C.chat_at,C.chat_body,C.chat_read,U.user_name AS from_name,UT.user_name AS to_name FROM chat_data AS C JOIN users AS U ON C.chat_from=U.user_id JOIN users AS UT ON C.chat_to=UT.user_id  WHERE (C.chat_from=? OR C.chat_from=?) AND (C.chat_to=? OR C.chat_to=?)",[id1,id2,id1,id2],
function(err,result){

	callback(result,privateKeys[id1],privateKeys[id2]);

});
	io.to(sock).emit('read','ok',id2);

});



		 // when the user disconnects.. perform this
  		socket.on('disconnect', function(){
    		// remove the username from global usernames list
    		delete users[socket.username];
    		// update list of users in chat, client-side
    		io.emit('updateusers', users);
    		// echo globally that this client has left
    		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
});

		 			

		 		});



require('./router/main_app')(app,date);

http.listen(3000,function(){
  console.log('listening on *:3000');
});