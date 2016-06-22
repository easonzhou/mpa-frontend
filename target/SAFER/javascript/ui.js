var simulation = require('./simulationEngine.js');
var $ = require('jquery');

module.exports = {
    dateDiv: $('.time-display-date'),
    timeDiv: $('.time-display-time'),
    playBtn: $('.btn-play'),
    forwardBtn: $('.btn-forward'),
    backwardBtn: $('.btn-backward'),
    fastForwardBtn: $('.btn-fast-forward'),
    bindPlayBtnAction : function() {
        this.playBtn.click(function(){
            if ($(this).hasClass('glyphicon-pause')) {
                simulation.stop();
                $(this).removeClass('glyphicon glyphicon-pause');
                $(this).addClass('glyphicon glyphicon-play');
            }
            else if ($(this).hasClass('glyphicon-play')) {
                simulation.play();
                $(this).removeClass('glyphicon glyphicon-play');
                $(this).addClass('glyphicon glyphicon-pause');
            }
        });
    },
    bindfastForwardBtnAction : function() {
        this.fastForwardBtn.click(simulation.changePlaybackSpeed.bind(simulation));
    },
    bindForwardBtnAction : function() {
        this.forwardBtn.click(simulation.playforward.bind(simulation));
    },
    bindBackwardBtnAction : function() {
        this.backwardBtn.click(simulation.playbackward.bind(simulation));
    },
    setUpBindingButtons : function() {
        this.bindPlayBtnAction();
        this.bindForwardBtnAction();
        this.bindBackwardBtnAction(); 
        this.bindfastForwardBtnAction();
    }
};
