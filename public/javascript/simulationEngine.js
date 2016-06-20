var map = require('./sgGisMap.js');
var d3 = require('d3');
var moment = require('moment');

var SimulationEngine = function() {
    this.playbackSpeed = 4;
    this.pause = true;
    this.minUnixSeconds = 0;//FIXME: time
    this.maxUnixSeconds = 0;//FIXME: time
    this.legendWidget = null;
    this.intervalInSeconds = 0;
    // number of times per second to recalculate trajectories of trains
    this.PERSECOND = 1;// in million-seconds
    this.playDirection = 1; // 1 forward play, -1 backward play
    this.lastTime = 0;
    this.trips = null;
    this.cohangout = null;
    this.transponder = null;
    this.speeding = null;
    this.radius = 10;
    this.idToNode = [];
    this.selectedVesselId = 0;
    this.zoomInScalingFactor = 2;
    this.mapValueToColor = null;
    this.strokeWidth = 2;
    this.incidents = [];
    this.currentIncidentIds = [];
    this.incidentLinks = [];
    this.incidentBeginningTime = 0;//in unixSeconds
    this.turnarounds = [];
    this.incidentFlashFlag = 0;
    this.timer = null;
    this.gisImageShift = 16;

//    this.playBtnKey = playBtnKey;
//    $(this.playBtnKey).click(this.triggerSimulation.bind(this));
//    this.ffBtn = ffBtn;
//    $(ffBtn).click(this.changePlaybackDirection.bind(this));
//    this.fbBtn = fbBtn;
//    $(fbBtn).click(this.changePlaybackDirection.bind(this));
//    this.dateDivKey = dateDivKey;
//    this.timeDivKey = timeDivKey;
//    this.playbackSpeedDivKey = playbackSpeedDivKey;
//    this.incidentTimerPanelDivKey = incidentTimerPanelDivKey;
//    this.incidentTimerTextDivKey = incidentTimerTextDivKey;
//    this.RestAPI = "";
//    this.callback = null;
//    this.filterMode = false;
};

SimulationEngine.prototype.getClockTime = function() {
    return this.lastTime;
};

SimulationEngine.prototype.isPause = function() {
    return this.pause;
};

SimulationEngine.prototype.stop = function(){
    this.pause = true;
};

SimulationEngine.prototype.play = function(){
    this.pause = false;
};

SimulationEngine.prototype.changePlaybackSpeed = function(){
    this.playbackSpeed == 4 ? this.playbackSpeed = 32 : this.playbackSpeed = 4; 
};

SimulationEngine.prototype.playforward = function(){
    this.playDirection = 1;
};

SimulationEngine.prototype.playbackward = function(){
    this.playDirection = -1;
};

SimulationEngine.prototype.calDurationPerSample = function(){
    return 1000 / (this.PERSECOND * this.playbackSpeed);
};

SimulationEngine.prototype.updatedX = function(d) {
    return map.projection(d.longlat)[0] - this.widthHeightWithZoomLevel(d) / 2; 
};

SimulationEngine.prototype.updatedY = function(d) {
    return map.projection(d.longlat)[1] - this.widthHeightWithZoomLevel(d) / 2; 
};

SimulationEngine.prototype.changeIcon = function(d){
    return "/images/ship/" + "ship" + (Math.floor(d.deg) % 360) + ".png";
};

SimulationEngine.prototype.widthHeightWithZoomLevel = function(d){
    //var zoomLevel = map.gm.map.getZoom();
    //var zoomDiff = zoomLevel - map.defaultZoomLevel;					
    //return 16 * Math.pow(2, zoomDiff);
    return d.dim * this.getPixelPerMeter(); 
};

SimulationEngine.prototype.getPixelPerMeter = function() {
    var lat = map.gm.map.getCenter().lat();
    var zoom = map.gm.map.getZoom();
    return Math.pow(2, zoom) / (156543.03392 * Math.cos(lat * Math.PI / 180));
};

SimulationEngine.prototype.handleVesselClick = function(d) {
    this.selectedVesselId = d.id;
    if (this.selectedVesselId == 530163) 
        this.filterVesselTrajectory(530164, "dash");
    else
        this.filterVesselTrajectory(this.selectedVesselId, "arc");
};

SimulationEngine.prototype.filterVesselTrajectory = function(id, type) {
    var data = this.trips.filter(function(trip) {
        return trip.id == id && trip.ts <= this.lastTime;
    }.bind(this));   
    this.updateVesselTrajectory(data, type);
};

SimulationEngine.prototype.filterVesselSpeedingTrajectory = function(id) {
    var data = this.trips.filter(function(trip) {
        return trip.id == id && trip.ts >= this.speeding.startTimeStamp && (this.lastTime < this.speeding.endTimeStamp ? trip.ts <= this.lastTime : trip.ts <= this.speeding.endTimeStamp);
    }.bind(this));   
    this.updateVesselTrajectory(data, 'speeding');
};

SimulationEngine.prototype.updateVesselTrajectory = function(trajectoryPoints, type) {
    var links = [];
    for(var i = 0, len = trajectoryPoints.length - 1; i < len; i++){
        links.push({
            type: "LineString",
            //id: data[i].id + " " + data[i + 1].id,
            coordinates: [
                [ trajectoryPoints[i].long, trajectoryPoints[i].lat ],
                [ trajectoryPoints[i+1].long, trajectoryPoints[i+1].lat ]
            ]
        });
    }

    // Standard enter / update
    var trajectories = map.trajectoryLayer.selectAll("." + type)
        .data(links);

    trajectories
        .attr("transform","translate("+(-map.coord1[0])+" "+(-map.coord1[1])+")")
        .attr("d", map.path) //reflect all the existing and to-be-added arcs
        .enter()
        .append("path")
        .attr("class", type)
        .attr("transform","translate("+(-map.coord1[0])+" "+(-map.coord1[1])+")")
        .attr("d", map.path);
        //d is the points attribute for this path, we'll draw
        //  an arc between the points using the arc function
    trajectories.exit().remove();
};

// change to canvas version
SimulationEngine.prototype.renderObjectsAtTime = function(unixSeconds, now) {
    var duration = now ? 0 : this.calDurationPerSample();
    if (!unixSeconds) { unixSeconds = this.lastTime; }
    //this.lastTime = unixSeconds;
    if (this.trips === null) 
        return;
    var active = 
        this.trips
            .filter(function (d) {
                return d.ts == unixSeconds && map.viewBounds.contains(new google.maps.LatLng(d.lat, d.long)); 
            }).map(function (d) {
                return {id: d.id, long: d.long, lat: d.lat, deg: d.deg, dim: d.dim};
            });

    var vessels = map.canvasDataContainer.selectAll('custom.rect').data(active, function (d) { return d.id; });

    if (now) {
        vessels.transition().duration(0)
            .attr('x', function(d) { return d.long; }) 
            .attr('y', function(d) { return d.lat; });
    } else {
        vessels.transition().duration(duration).ease('linear')
            .attr('x', function(d) { return d.long; }) 
            .attr('y', function(d) { return d.lat; });
    }

    vessels
        .attr("width", this.widthHeightWithZoomLevel.bind(this))
        .attr("height", this.widthHeightWithZoomLevel.bind(this))
		.attr("deg", function(d) { return d.deg; });

    vessels.enter().append('custom')
        .classed('rect', true)
		.attr('x', function(d) { return d.long; }) 
		.attr('y', function(d) { return d.lat; })
        .attr("width", this.widthHeightWithZoomLevel.bind(this))
        .attr("height", this.widthHeightWithZoomLevel.bind(this))
		.attr("deg", function(d) { return d.deg; })
		.attr("fillStyle", "red");

    vessels.exit().remove();
};

SimulationEngine.prototype.updateTimePanel = function(unixSeconds){
    var ui = require('./ui.js');
    var t = moment(unixSeconds * 1000).zone("+08:00");

    ui.dateDiv.text(function () {
        return t.format('dddd MM/DD/YYYY');
    });
    ui.timeDiv.text(function () {
        return t.format('h:mm a');
    });
};

SimulationEngine.prototype.alertRadiusWithZoomLevel = function(d) {
    return this.widthHeightWithZoomLevel(d) * 4;
};

SimulationEngine.prototype.filterCohangout = function(d) {
        return d.id == this.cohangout.a && unixSeconds == d.ts && unixSeconds >= this.cohangout.startTimeStamp && unixSeconds <= this.cohangout.endTimeStamp;
}

SimulationEngine.prototype.renderAllAlertsAtTime = function(now, unixSeconds) {
    if (!unixSeconds) { unixSeconds = this.lastTime; }

    var filterHangoutAlertA = function(d) {
        return d.id == this.cohangout.a && unixSeconds == d.ts && unixSeconds >= this.cohangout.startTimeStamp && unixSeconds <= this.cohangout.endTimeStamp;
    };

    this.renderAlertsAtTime('hangout-alertA', filterHangoutAlertA.bind(this), now);

    var filterHangoutAlertB = function(d) {
        return d.id == this.cohangout.b && unixSeconds == d.ts && unixSeconds >= this.cohangout.startTimeStamp && unixSeconds <= this.cohangout.endTimeStamp;
    };

    this.renderAlertsAtTime('hangout-alertB', filterHangoutAlertB.bind(this), now);

    var filterTransponder = function(d) {
        return d.id == this.transponder.id && unixSeconds == d.ts && unixSeconds >= this.transponder.startTimeStamp && unixSeconds <= this.transponder.endTimeStamp;
    };

    this.renderAlertsAtTime('transponder-alert', filterTransponder.bind(this), now);

    var filterSpeeding = function(d) {
        return d.id == this.speeding.id && unixSeconds == d.ts && unixSeconds >= this.speeding.startTimeStamp && unixSeconds <= this.speeding.endTimeStamp;
    };

    this.renderAlertsAtTime('speeding-alert', filterSpeeding.bind(this), now);
}

SimulationEngine.prototype.renderAlertsAtTime = function(alertClass, callback, now ) {
    var duration = now ? 0 : this.calDurationPerSample();

    if (this.trips === null) 
        return;
    
    var trip = 
        this.trips
            .filter(callback)
            .map(function (d) {
                return {id: d.id, longlat: [d.long, d.lat], dim: d.dim};
            }.bind(this));

    var alerts = map.alertLayer.selectAll("." + alertClass).data(trip, function (d) { return d.id; });

    if (now)
        alerts
            .attr('cx', function(d) {return map.projection(d.longlat)[0];})
            .attr('cy', function(d) {return map.projection(d.longlat)[1];})
            .attr("transform","translate("+(-map.coord1[0])+" "+(-map.coord1[1])+")");
    else
        alerts.transition().duration(duration).ease('linear')
            .attr('cx', function(d) {return map.projection(d.longlat)[0];})
            .attr('cy', function(d) {return map.projection(d.longlat)[1];});

    alerts
        .attr('r', this.alertRadiusWithZoomLevel.bind(this));

    alerts.enter().append('circle')
        .attr('class', function (d) { return alertClass; })
        .attr("transform","translate("+(-map.coord1[0])+" "+(-map.coord1[1])+")")
        .attr('r', this.alertRadiusWithZoomLevel.bind(this))
        .attr('cx', function(d) {return map.projection(d.longlat)[0];})
        .attr('cy', function(d) {return map.projection(d.longlat)[1];})
        .on("click", this.handleVesselClick.bind(this));

    alerts.exit().remove();
};

SimulationEngine.prototype.animate = function(data, minUnixSeconds, maxUnixSeconds, intervalInSeconds){
    this.trips = data.trips;
    if (minUnixSeconds !== undefined)
        this.lastTime = this.minUnixSeconds = minUnixSeconds;
    else
        this.lastTime = this.minUnixSeconds = data.minUnixSeconds;

    if (maxUnixSeconds !== undefined)
        this.maxUnixSeconds = maxUnixSeconds;
    else
        this.maxUnixSeconds = data.maxUnixSeconds;
    console.log(data.hangout);
    this.cohangout = data.hangout;
    this.transponder = data.transponder;
    this.speeding = data.speeding;
    this.intervalInSeconds = data.interval;
	this.renderObjectsAtTime(this.lastTime, true);
    this.animateHelper();
    this.pause = false;
};

SimulationEngine.prototype.animateHelper = function() {
    var render = this.renderObjectsAtTime.bind(this);
    if (!this.pause){
        if(this.lastTime > this.maxUnixSeconds)
            this.lastTime = this.minUnixSeconds;
        else if(this.lastTime < this.minUnixSeconds)
            this.lastTime = this.maxUnixSeconds;
        else
            this.lastTime = this.lastTime + this.intervalInSeconds * this.playDirection; 
        render(this.lastTime);
        this.updateTimePanel(this.lastTime);
        this.renderAllAlertsAtTime(false);
        if (this.selectedVesselId !== 0)
            this.filterVesselTrajectory(this.selectedVesselId, 'arc');
        if (this.selectedVesselId === this.speeding.id)
            this.filterVesselSpeedingTrajectory(this.selectedVesselId);
        if (this.selectedVesselId == 530163) 
            this.filterVesselTrajectory(530164, "dash");
    }
    this.timer = setTimeout(this.animateHelper.bind(this), this.calDurationPerSample());
};

var simulationEngine = new SimulationEngine();

module.exports = simulationEngine;
