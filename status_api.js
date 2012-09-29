var  request    = require('request')
    ,sets       = require('simplesets')
    ,events     = require('events')
    ,util       = require('util');


var StatusAPI = function( url, interval ) {
    
    events.EventEmitter.call(this);
    
    this.api_url            = url || 'http://status.bckspc.de/status.php?response=json';
 
    this.last_member_count  = 0;
    this.last_members       = new sets.Set();

    this.update_interval    = interval || 60*1000;
    this.interval           = false;

    this.start();
    this.check();
};

util.inherits(StatusAPI, events.EventEmitter);

StatusAPI.prototype.start = function() {
    var self = this;
    this.interval = setInterval( function() {
        self.check();
    }, this.update_interval );
};

StatusAPI.prototype.stop = function() {
    clearInterval( this.interval );
};

StatusAPI.prototype.check = function() {
    var self = this;
    request( { url: this.api_url, json: true }, function( err, resp, body ) {
        self.check_status( body );
    });
};

StatusAPI.prototype.check_status = function( data ) {

    // Check if member count has changed
    if( data.members != this.last_member_count ) {
        this.emit('member_count', data.members, data );    
    }

    // Check if member count changed to zero (no one there)
    if( data.members == 0 && this.last_member_count != 0 ) {
        this.emit('space_closed', data.members, data );
    }

    // Check if member count has changed from zero (someone's entered the space)
    if( data.members != 0 && this.last_member_count == 0 ) {
        this.emit('space_opened', data.members, data );    
    }

    // Squeeze member nicknames in another format
    var member_set = new sets.Set();
    data.members_present.forEach( function( val ){
        member_set.add( val.nickname );
    });


    // Check if members joined or left the space
    var  incoming = member_set.difference( this.last_members ).array()
        ,outgoing = this.last_members.difference( member_set ).array();

    if( incoming.length > 0 ) {
        this.emit('member_joined', incoming, data );    
    }

    if( outgoing.length > 0 ) {
        this.emit('member_parted', outgoing, data );    
    }


    this.last_member_count = data.members,
    this.last_members = member_set;
    
};

module.exports = StatusAPI;
