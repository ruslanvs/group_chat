var express = require("express");
var app = express();

var bodyParser = require('body-parser');
var path = require("path");
var session = require( "express-session" );

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./static")));
app.use( session( {secret: "codingdojorocks"} ) );

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render( "index" );
})

app.get('/chat', function(req, res) {
    res.render( "chat" );
})

var server = app.listen( 8000, function() {
    console.log( "listening on port 8000" );
});

var io = require( "socket.io" ).listen( server );

var chat = [];
var users_dict = {};

io.sockets.on( "connection", function( socket ){
    console.log( "Client/socket is connected");
    console.log( "Client/socket id is: ", socket.id );
    users_dict[socket.id] = "user";

    socket.on( "user_joined", function( data ){
        chat.push( {name: data, message: "*** joined ***"})
        users_dict[socket.id] = data;
        io.emit( "new_message", chat, users_dict )
        console.log( "USERS: ", users_dict );
    })

    socket.on( "message", function( data ){
        chat.push( {name: data.name, message: data.message} )
        console.log( "CHAT ARRAY: ", chat);
        io.emit( "new_message", chat, users_dict )
    })

    socket.on( "disconnect", function(){
        console.log( socket.id + " HAS DISCONNECTED" );
        chat.push( {name: users_dict[socket.id], message: "*** user has disconnected ***"} )
        delete users_dict[socket.id];
        console.log( "USERS: ", users_dict );
        io.emit( "new_message", chat, users_dict )
    })

})