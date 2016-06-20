/**
 * Created by yinsheng on 22/2/16.
 */
/**
 * Created by yinsheng on 6/2/15.
 */
var d3 = require('d3');
var topojson = require('topojson');
var $ = require('jquery');

var sgGisMap = sgGisMap || {
        topo: null,
        path: null,
        infrasLayer: null,
        vesselLayer: null,
        trajectoryLayer: null,
        alertLayer: null,
        tooltip: null,
        tooltipEclipse: null,
        gm: null,
        projection: null,
        defaultZoomLevel: 12,
        coord1: null,
        coord2: null,
        viewBounds: null,
		canvasDataContainer: null,
		image: null,
        rFactor: 0.2,
        defaultFactor: 0.2,
        zoomDiff: 1,
        imageShiftInPixels: 0,
        gisRectWH: 10,
        rectRoundCornerSize: 2,
        radius: 5,

        drawSvgOverlay: function(cb){
            sgGisMap.gm = {
                opt: { center: new google.maps.LatLng(1.3667,103.8),
                    zoom: sgGisMap.defaultZoomLevel,
                    minZoom: 0,
                    maxZoom: 20,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                },
                ov: new google.maps.OverlayView()
            };
            sgGisMap.gm.map = new google.maps.Map($("#gmap")[0], sgGisMap.gm.opt);
            sgGisMap.viewBounds = sgGisMap.gm.map.getBounds();
            sgGisMap.gm.map.set('styles', [
                {
                    "featureType": "all",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "simplified"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#ffffff"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "color": "#000000"
                        },
                        {
                            "lightness": 13
                        }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#000000"
                        }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#144b53"
                        },
                        {
                            "lightness": 14
                        },
                        {
                            "weight": 1.4
                        }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [
                        {
                            "color": "#08304b"
                        },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "landscape.man_made",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "landscape.natural",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#0c4152"
                        },
                        {
                            "lightness": 5
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#000000"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#0b434f"
                        },
                        {
                            "lightness": 25
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#000000"
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#0b3d51"
                        },
                        {
                            "lightness": 16
                        }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#000000"
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [
                        {
                            "color": "#146474"
                        },
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [
                        {
                            "color": "#021019"
                        }
                    ]
                }
            ]);

            sgGisMap.rFactor = sgGisMap.defaultFactor * 2 * 2;
            google.maps.event.addListener(sgGisMap.gm.map, 'bounds_changed', function(ev){
                //console.log("google map bounds changed");
                // update the view bounds
                sgGisMap.viewBounds = sgGisMap.gm.map.getBounds();
                var simulationEngine = require('./simulationEngine.js');
                if (simulationEngine.isPause()){
                    // when the simulationEngine is paused, it will rerender the vessels and alerts if the bounds_changed. Because the bounds changed, so the vessel filtering must be reapply to the vessels and alerts based on the new bounds.
                    simulationEngine.renderObjectsAtTime(null, true);
                    simulationEngine.renderAllAlertsAtTime(true);
                }
            });
            google.maps.event.addListener(sgGisMap.gm.map, 'zoom_changed', function(ev){
                //console.log("zoom changed in Google map called");
                // when the zoom-in level changes, this function will be called, so we need to reupdate all the layers' objects' locations based on new projection with new zoom-in level
                sgGisMap.infrasLayer.selectAll("path").attr("transform","translate("+(-sgGisMap.coord1[0])+" "+(-sgGisMap.coord1[1])+")").attr("d",sgGisMap.path);
                sgGisMap.trajectoryLayer.selectAll("path").attr("transform","translate("+(-sgGisMap.coord1[0])+" "+(-sgGisMap.coord1[1])+")").attr("d",sgGisMap.path);
                var simulationEngine = require('./simulationEngine.js');
                if (!simulationEngine.isPause()) {
                    // if the simulation is playing, we have to remove the current vessels and let the next animate interval to replace the vessels according to the new projection of the new zoom level, because the these are moving objects and without removing it will move strangely.
                    //sgGisMap.vesselLayer.selectAll(".vessel").remove();
                    sgGisMap.alertLayer.selectAll("circle").remove();
                }
            });

            sgGisMap.gm.ov.onAdd = function() {
                //console.log("onAdd in Google map called");
                var layer = d3.select(this.getPanes().overlayMouseTarget)
                    .append("div")
                    .attr("class", "base");

                sgGisMap.gm.svg = layer.append("svg");

                sgGisMap.projection = googleProjection(sgGisMap.gm.ov.getProjection());
                sgGisMap.path = d3.geo.path().projection(sgGisMap.projection);
                //initialize the svg overlay style and display box
                sgGisMap.coord1 = sgGisMap.projection([98.503418,4.653080]);
                sgGisMap.coord2 = sgGisMap.projection([108.259277,-1.450040]);
                w = sgGisMap.coord2[0] - sgGisMap.coord1[0];
                h = sgGisMap.coord2[1] - sgGisMap.coord1[1];
                sgGisMap.gm.svg.style("position", "absolute")
                    .style("top", sgGisMap.coord1[1]+"px")//firefox requires to explicitely to mention "px" in the end
                    .style("left", sgGisMap.coord1[0]+"px")//firefox requires to explicitely to mention "px" in the end
                    .style("width", w +"px")//firefox requires to explicitely to mention "px" in the end
                    .style("height", h +"px")//firefox requires to explicitely to mention "px" in the end
                    .attr("viewBox","0 0 "+w+" "+h);

                sgGisMap.infrasLayer = sgGisMap.gm.svg.append("g");
                sgGisMap.trajectoryLayer = sgGisMap.gm.svg.append("g");
                sgGisMap.vesselLayer = sgGisMap.gm.svg.append("g");
                sgGisMap.alertLayer = sgGisMap.gm.svg.append("g");

                //sgGisMap.drawStationsAndLines();
                sgGisMap.drawMPAPolygons();

                //setting mode callback in simulation.js
                cb();
            };

            sgGisMap.gm.ov.draw = function() {
                //console.log("google map overlay draw function called");
            };

            function googleProjection(prj) {
                return function(lnglat) {
                    ret = prj.fromLatLngToDivPixel(new google.maps.LatLng(lnglat[1],lnglat[0]));
                    return [ret.x, ret.y];
                };
            }

            sgGisMap.gm.ov.setMap(sgGisMap.gm.map);
        },
		initCanvasOverlay: function() {
			var CanvasLayer = require("./CanvasLayer.js");
			var canvasLayer;
			var context;
			var resolutionScale = window.devicePixelRatio || 1;

			// Create a d3 selection for the detached container. We won't
			// actually be attaching it to the DOM.
			var dataContainer;
			// initialize the canvasLayer
			var canvasLayerOptions = {
				map: this.gm.map,
				resizeHandler: resize,
				animate: true,
				updateHandler: update,
				resolutionScale: resolutionScale
			};
			canvasLayer = new CanvasLayer(canvasLayerOptions);
			context = canvasLayer.canvas.getContext('2d');
			this.canvasDataContainer = d3.select("body").append("custom");
			this.image = new Image();
			this.image.src = '/images/ship/ship_sprites.png';
			//this.image.src = '/images/ship/ship0.png';
			function resize() {
				// nothing to do here
			}
			function update() {
				// clear previous canvas contents
				var canvasWidth = canvasLayer.canvas.width;
				var canvasHeight = canvasLayer.canvas.height;
				context.clearRect(0, 0, canvasWidth, canvasHeight);
				// we like our rectangles hideous
				//context.fillStyle = 'rgba(230, 77, 26, 1)';

				/* We need to scale and translate the map for current view.
				 * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
				 */
				var mapProjection = sgGisMap.gm.map.getProjection();
				/**
				 * Clear transformation from last update by setting to identity matrix.
				 * Could use context.resetTransform(), but most browsers don't support
				 * it yet.
				 */
				context.setTransform(1, 0, 0, 1, 0, 0);

				// scale is just 2^zoom
				// If canvasLayer is scaled (with resolutionScale), we need to scale by
				// the same amount to account for the larger canvas.
				var scale = Math.pow(2, sgGisMap.gm.map.zoom) * resolutionScale;
				context.scale(scale, scale);
				/* If the map was not translated, the topLeft corner would be 0,0 in
				 * world coordinates. Our translation is just the vector from the
				 * world coordinate of the topLeft corder to 0,0.
				 */
				var offset = mapProjection.fromLatLngToPoint(canvasLayer.getTopLeft());
				context.translate(-offset.x, -offset.y);
				var elements = sgGisMap.canvasDataContainer.selectAll("custom.rect");
				elements.each(function(d) {
					context.save();
					var node = d3.select(this);
					context.fillStyle = node.attr("fillStyle");
					var width = node.attr("width") / scale;
					var worldPoint = mapProjection.fromLatLngToPoint(new google.maps.LatLng(node.attr("y"),node.attr("x")));
					var deg = Math.floor(node.attr("deg")) % 360;
					context.drawImage(sgGisMap.image, 0, 260 * deg + deg, 260, 260, worldPoint.x - width/2, worldPoint.y - width/2, width, width); 
					//context.translate(worldPoint.x, worldPoint.y);
					//context.rotate((Math.PI / 180) * deg);
					//context.translate(-worldPoint.x, -worldPoint.y);
					//context.drawImage(sgGisMap.image, worldPoint.x - width/2, worldPoint.y - width/2, width, width); 
					context.restore();
				});
			}
		},

        drawSgGisMap: function(callback){
            if(sgGisMap.topo === null) {
                d3.json("data/mpa_topo.json", function (error, data) {
                    if (error) return console.error(error);

                    sgGisMap.topo = data;
                    sgGisMap.drawSvgOverlay(callback);
                });
            }
            else{
                callback();
            }
        },

        drawMPAPolygons: function(){
            var polygons = this.infrasLayer.selectAll(".mpa_polygon")
                .data(topojson.feature(this.topo, this.topo.objects.mpa_geojson).features)
                .enter().append("path")
                .attr("class", function(d){ return "mpa_polygon " + d.properties.Type; })
                .attr("transform","translate("+(-sgGisMap.coord1[0])+" "+(-sgGisMap.coord1[1])+")")
                .attr("d", this.path);

            this.tooltipEclipse = this.infrasLayer.append("svg:ellipse");
            this.tooltip = this.infrasLayer.append("svg:text");

            polygons
                .on("mouseover", function(d, i) {
                    var mouse = d3.mouse(sgGisMap.infrasLayer.node()).map( function(d) { return parseInt(d); } );
                    var str = d.properties.Name;
                    var n = str.length;
                    var w = 5 * n;
                    sgGisMap.tooltipEclipse.style("visibility","visible");
                    sgGisMap.tooltipEclipse.attr("cx",mouse[0] + w/2 + 30).attr("cy", mouse[1])
                        .attr("rx", w.toString()).attr("ry", "25").attr("fill","white");
                    sgGisMap.tooltip.style("visibility","visible");
                    sgGisMap.tooltip.attr("x",mouse[0] + 20).attr("y", mouse[1]).attr("dy", ".31em")
                        .text(str);
                })
                .on("mouseout",  function(d,i) {
                    sgGisMap.tooltipEclipse.style("visibility","hidden");
                    sgGisMap.tooltip.style("visibility","hidden");
                });
        },
};

module.exports = sgGisMap;
