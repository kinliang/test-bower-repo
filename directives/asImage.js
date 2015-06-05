(function($angular) {

    "use strict";

    var app = $angular.module('asImage', []);

    /**
     * @directive appspaceContent
     * @type {Function}
     */
    app.directive('asImage', 
        ['$parse', '$http', '$compile', '$templateCache', '$sce', '$window', '$timeout', 
        function ($parse, $http, $compile, $templateCache, $sce, $window, $timeout) {

        return {

            /**
             * @property restrict
             * @type {String}
             */
            restrict: "EA",

            /**
             * @property scope
             * @type {Object}
             */
            scope: {
                id : '=elemId',
                estyle : '=estyle',
                loadsrc : '=loadsrc',
                defaultsrc : '=defaultsrc',
                src : '=src',
                resource: '=resource'
            },

            /**
             * @property template
             * @type {String}
             */
            template: '<div style="position:relative;display:block;width:100%;height:100%;">'+ 
                '<img' +
                ' ng-src1="{{trustResource(src, true)}}"' +
                ' style="display:none;height:100%;background-repeat:none;padding:0px;position:absolute;left:0px;top:0px;width:100%;display:block;"' +
                //' class="hidden"' +
                ' ng-attr-id="{{getElemId(elemId)}}"' +
                //' ng-attr-style="{{getStyle(estyle)}}"' +
                ' />' +
                //the loading gif
                '<img' +
                ' ng-src="{{trustResource(loadsrc, false)}}"' +
                ' ng-attr-id="{{getLoadingElemId(elemId)}}"' +     
                ' style="position:absolute;left:0px;display:none"' +           
                ' />' +
                '</div>'
                ,

            /**
             * @method link
             * @param scope {Object}
             * @param element {Object}
             * @param attrs {Object}
             * @return {void}
             */
            link: function (scope, element, attrs) {
                //console.log(scope.imgurl);
                
                scope.$on('$destory', function destoryOn() {
                    console.log("destory");
                });

                scope.$watch('src', function() {
                    //console.log("refresh???");
                    //console.log("link!");
                    var img = $('<img id="imageLoader'+ scope.imgId +'"" stlye="display:none" />'); //Equivalent: $(document.createElement('img'))

                    img
                    .load(function(){
                        //console.log("Image loaded: " + scope.imgurl);
                        scope.resize(this.width, this.height);
                        scope.fadeOut();
                        img.focus();
                        img.remove();                        
                    })
                    .error(function(){
                        //img.remove();
                        //replace with defaultimg
                        scope.imgurl = scope.defaultsrc;
                        scope.fadeOut();
                        img.remove();
                        //console.log('Image failed to load: ' + scope.imgurl);
                        //loadingItem = null;
                        //scope.onmediaerror();
                    });

                    img.appendTo($("head"));
                    img.attr('src', scope.imgurl);                

                    //resize the loading image
                    scope.resize(0,0);

                    
                    $("#"+scope.imgId+"").css("background-image", "");
                    $("#"+scope.imgId).removeAttr("src");
                    if (!scope.loadsrc) {
                        //console.log("show ??");
                        $("#"+scope.imgloadingId+"").hide();
                    } else {
                        //console.log("show it");
                        $("#"+scope.imgloadingId+"").show();
                    }                
                    $("#"+scope.imgId).hide();                
                    
                    //console.log("start loading...");
                });

                $("#"+scope.imgloadingId+"").load(function() {
                    $scope.resize();
                });
            },


            /**
             * @property controller
             * @type {Array}
             */
            controller: ['$scope', '$window', 
                function controller($scope, $window) {

                $scope.loadingImgurl = null;

                $scope.imgurl = null;
                /**
                 * @property isStartup
                 * @type {Boolean}
                 */
                $scope.isStartup = true;

                /**
                 * @property iframeId
                 * @type {String}
                 */
                $scope.iframeId = "appspaceContentIframe" + $scope.$id;

                $scope.imgId = "imagecontent" + $scope.$id;

                $scope.imgloadingId = $scope.imgId + "-loading";

                $scope.containerFrame = {};
                /**
                 * @method trustResource
                 * @param resourceUrl {String}
                 * @return {Object}
                 */
                $scope.trustResource = function (resourceUrl, isMainImg) {

                    //console.log(isMainImg);
                    //console.log(resourceUrl);
                    if (isMainImg == true) {
                        $scope.imgurl = resourceUrl;
                    }
                    return resourceUrl;
                    //return $sce.trustAsResourceUrl(resourceUrl);
                };

                $scope.applyAspectRatio = function(frame, ratio) {
                    if (ratio == 0 || ratio == null)
                        return frame;

                    var frameW2H = 1;
                    var newWidth;
                    var newHeight;

                    if (frame.height > 0)
                        frameW2H = frame.width / frame.height;

                    if (frameW2H > ratio) {
                        newHeight = frame.height;
                        newWidth = frame.height * ratio;
                    }
                    else {
                        newWidth = frame.width;
                        newHeight = frame.width / ratio;
                    }
                    var newFrame = new Frame(frame.left + ((frame.width - newWidth) / 2), frame.top + ((frame.height - newHeight) / 2), newWidth, newHeight);

                    return newFrame;
                }                


                $scope.getStyle = function(id) {
                    return id;
                };

                $scope.getLoadingElemId = function(id) {
                    return $scope.imgloadingId;
                };

                $scope.getElemId = function(id) {
                    return $scope.imgId;
                };

                $scope.resize = function(imgWidth, imgHeight) {
                    var myWidth = 0;

                    //console.log(imgWidth + "----"+imgHeight);
                    //img -> div -> image-content -> container
                    var container = $($("#"+$scope.imgId+"").parent().parent().parent());

                    var containerHeight = container.height();
                    var containerWidth = container.width();

                
                    if (containerHeight == 0 || containerWidth == 0) {
                        if (containerHeight == 0) 
                            containerHeight = $(window).height();

                        if (containerWidth == 0)
                            containerWidth = $(window).width();
                    } else {
                        if (imgWidth && imgHeight) {
                            var imgDom = $("#"+$scope.imgId);
                            var frame = $scope.applyAspectRatio(
                                {width : containerWidth, height : containerHeight, top : 0, left : 0}, 
                                imgWidth / imgHeight);
                            //console.log(frame);
                            imgDom.css("left", frame.left);
                            imgDom.css("top", frame.top);
                            imgDom.css("height", frame.height);
                            imgDom.css("width", frame.width);
                            //console.log(containerWidth + "x" + containerHeight);
                            //console.log(imgWidth/imgHeight);
                            //console.log(frame);
                            //$("#"+$scope.imgId).height(containerHeight);
                            //reposition the image
                        } 
                    }
                    var loadingImgDom = $("#"+$scope.imgloadingId+"");
                    //reposition the loadding icon
                    loadingImgDom.css("padding-left", (containerWidth / 2));
                    loadingImgDom.css("padding-top", (containerHeight / 2));
                };

                $scope.fadeOut = function() {
                    $("#"+$scope.imgId).fadeOut(500, "linear", function() {
                        $scope.fadeIn();
                    });

                    //$("#"+$scope.imgloadingId+"").show();
                    //$("#"+$scope.imgId).hide();
                };
          
                $scope.fadeIn = function() {

                    //playingItem = loadingItem; 

                    //if (playingItem != null && playingItem.type.toLowerCase() != "video") {
                    //$("#"+$scope.imgId).css("background-image", "url('" + $scope.imgurl + "')");
                    $("#"+$scope.imgId).attr("src", $scope.imgurl);
                    //}

                    if ($scope.loadsrc) {
                        $("#"+$scope.imgloadingId+"").fadeOut(500);
                    } else {
                        $("#"+$scope.imgloadingId+"").hide();
                    }

                    $scope.resize();

                    //Reset content load time for watchdog
                    //contentLoadTime = new Date();

                    // fading in
                    $("#"+$scope.imgId).fadeIn(500, "linear", function() {
                        /*
                        loadingItem = null;
                        if (playingItem != null) {
                            // if video autoplay
                            if (playingItem.type.toLowerCase() == "video") {
                                $("#idmedia video").show();
                                videoPlayer.play();
                                var d = videoPlayer.duration;
                                if(isNaN(d) == false) {
                                    playingItem.duration = Math.ceil(d);
                                }
                                else {
                                    playingItem.duration = d = autoDuration;
                                }
                                console.log("Video duration: " + d);
                            }
                            else { //for images set the timeout
                                // timeeout
                                if(autoDuration != null) {
                                $scope.mediaSettimeout = setTimeout($scope.onmediacomplete, autoDuration);
                                playingItem.duration = autoDuration / 1000;
                                }
                            }
                        }
                        */
                    });
                };          

            }]
        };

    }]);

})(window.angular);