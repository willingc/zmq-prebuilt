var zmq = require('..')
  , should = require('should')
  , semver = require('semver');

describe('socket.push-pull', function(){

  it('should support push-pull', function(done){
    var push = zmq.socket('push')
      , pull = zmq.socket('pull');

    var n = 0;
    pull.on('message', function(msg){
      msg.should.be.an.instanceof(Buffer);
      switch (n++) {
        case 0:
          msg.toString().should.equal('foo');
          break;
        case 1:
          msg.toString().should.equal('bar');
          break;
        case 2:
          msg.toString().should.equal('baz');
          pull.close();
          push.close();
          done();
          break;
      }
    });

    var addr = "inproc://stuff";

    pull.bind(addr, function(){
      push.connect(addr);

      push.send('foo');
      push.send('bar');
      push.send('baz');
    });
  });


  it('should not emit messages after pasue()', function(done){
      var push = zmq.socket('push')
        , pull = zmq.socket('pull');

      var n = 0;

      pull.on('message', function(msg){
        if(n++ === 0) {
          msg.toString().should.equal('foo');
        }
        else{
          should.not.exist(msg);
        }
      });

      var addr = "inproc://pause_stuff";

      pull.bind(addr, function(){
        push.connect(addr);

        push.send('foo');
        pull.pause()
        push.send('bar');
        push.send('baz');
      });

      setTimeout(function (){
        pull.close();
        push.close();
        done();
      }, 100);
  });



  it('should emit messages after resume()', function(done){
    var push = zmq.socket('push')
      , pull = zmq.socket('pull');

    var n = 0;

    function checkNoMessages(msg){
      should.not.exist(msg);
    }

    function checkMessages(msg){
      msg.should.be.an.instanceof(Buffer);
      switch (n++) {
        case 0:
          msg.toString().should.equal('foo');
          break;
        case 1:
          msg.toString().should.equal('bar');
          break;
        case 2:
          msg.toString().should.equal('baz');
          pull.close();
          push.close();
          done();
          break;
      }
    }

    pull.on('message', checkNoMessages)

    var addr = "inproc://resume_stuff";

    pull.bind(addr, function(){
      push.connect(addr);
      pull.pause()

      push.send('foo');
      push.send('bar');
      push.send('baz');

      setTimeout(function (){
        pull.removeListener('message', checkNoMessages)
        pull.on('message', checkMessages)
        pull.resume()
      }, 100)

    });

  });
});
