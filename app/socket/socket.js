module.exports = function (io) {
  io.on('connection', function(socket){
    console.log('connected')
    socket.on('add menuitem', function(menuitemId){
      console.log(menuitemId)
      // we tell the client to execute 'new message'
      socket.broadcast.emit('add menuitem', menuitemId);
    });
    socket.on('disconnect', function(){
      console.log('disconnect')
    });
  });
}