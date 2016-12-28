app.controller('usersController', ['$scope', '$timeout', '$http','toastr', '$filter', function ($scope, $timeout, $http,toastr, $filter) {
	
	//Create User
	$scope.createUser = function(){
		$http.post('http://dev.jewelbox.prismone.com:8081/html/jewelbox_api/v1/createUser', $scope.user).success(function(data){
			console.log(data);
			toastr.success('Success', '');
		});
	}
}]);