
var http=require('http');

var mysql=require('mysql');


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:"nodedb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

 var sql="INSERT INTO users ()"
});

/*create server*/

var server=http.createServer(function(request,response){

response.writeHead(200,

	{"Content-Type":"text/plain"});
response.end("helloWorld\n");


});

server.listen(4000);