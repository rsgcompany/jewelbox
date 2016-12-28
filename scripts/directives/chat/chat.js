'use strict';

angular.module('jewelbox')
	.directive('chat',function(){
		return {
        templateUrl:'scripts/directives/chat/chat.html',
        restrict: 'E',
        replace: true,
    	}
	});


