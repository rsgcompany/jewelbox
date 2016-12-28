app.controller('projectsController', ['$scope', '$timeout', '$http','toastr', '$filter', function ($scope, $timeout, $http,toastr, $filter) {

	$scope.purchaseorder_list = [{'purchase_order':'','version':[],'comments':''}];
	$scope.lineitems_list = [{'number':'','name':'','material_type':[], 'container_type':'', 'quantity':'','client_po':''}];
	//CREATE PROJECT
	$scope.createproject = function(project){
		
		if(!project.code || !project.name || !project.type || !project.start_date || !project.end_date){
			$scope.error_message_create_project = true;
			toastr.error('Please enter  all required fields', '');
			return false;
			
		}
		else {
		$http.post('/api/project', $scope.project).success(function(data){
			$scope.project = data;
			$scope.project_selected = true;
			toastr.success('Project Created', '');
			$scope.project_view_mode = true;
			$scope.$watch('project.start_date', function (newDate) {
    $scope.project.start_date = $filter('date')(newDate, 'MM/dd/yyyy');
	});
				$scope.$watch('project.end_date', function (newDate) {
    $scope.project.end_date = $filter('date')(newDate, 'MM/dd/yyyy');
	});
		});
		};
	};

$scope.purchase_order_new_before_crate_list = [{'name': '', 'version': [], 'comments': ''}];
	//ADDING PURCHASE ORDERS BELOW THE PROJECT DETAILS
	$scope.add_purchase_order_item = function(){
	//alert("Hello");
		$scope.purchase_order_new_before_crate_list.push({'name': '', 'version': [], 'comments': ''});
		//this.purchaseorder.po_item_create_mode_null=true;
		/*$scope.purchaseorder_list.push({'purchase_order':'','version':['1','2','3'],'comments':''});
*/		this.purchaseorder.po_item_create_mode_null =true;
		
	};
$scope.error_message_create_purchase_order_uniq = false;
	//CREATING PURCHASE ORDER FOR PROJECT
	$scope.client_po_list = [];
	$scope.purchaseorder_list_data = [];
	$scope.create_purchase_order = function(purchaseorder){
		
		if(!purchaseorder.purchase_order){
			$scope.error_message_create_purchase_order = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
		$scope.purchse_order_data = 		{
			'purchase_order':purchaseorder.purchase_order,
			'version': purchaseorder.version,
			'comments': purchaseorder.comments,
			'project_id':$scope.project._id
		};

		$http.post('/api/po', $scope.purchse_order_data).success(function(data){
			if(data.state == 'FAILURE'){
				$scope.error_message_create_purchase_order_uniq = true;
				toastr.error(data.msg, '');
			}
			else {
				console.log(data);
				purchaseorder.po_item_create_mode_null ="DUMMY DATS";	$scope.client_po_list.push(data.purchase_order+'-'+data.version);
			$scope.project.purchase_orders.push(data);
			$scope.purchaseorder_list_data.push( data);
			$scope.purchaseorder.purchase_order = "";
			$scope.purchaseorder.comments = "";
			
			$scope.purchase_order_view_mode = true;
			$scope.purchase_order_selected = true;
			}
		
		}).error(function(data){
			toastr.error(data.message, '');
		});
		}
	};

	//ADDING LINE ITEMS BELOW THE PURCHASE ORDERS
	$scope.add_line_item_create_project = function(){
		$scope.lineitems_list.push({'number':'','name':'','material_type':[], 'container_type':'', 'quantity':'','client_po':''});
		this.lineitem.line_item_create_mode_null = true;
	};
	$scope.lineitems_list_data = [];

$scope.container_type_change_select = function(item){
		$scope.container_type = item;
	}
	$scope.error_message_create_line_item = false;
	//CREATING LINE ITEM FOR PURCHASE ORDER
	$scope.create_line_item = function(lineitem){
		if(!lineitem.name || !$scope.container_type || !lineitem.quantity){
			$scope.error_message_create_line_item = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
	$scope.line_item_data = 		{
			'name':lineitem.name,
			'material_type': lineitem.material_type,
			'container_type': $scope.container_type,
			'quantity': lineitem.quantity,
			'client_po': lineitem.client_po,
			'project_id':$scope.project._id
		};

		$http.post('/api/lineitem', $scope.line_item_data).success(function(data){
			$scope.lineitems_list_data.push(data);
			toastr.success('Line Item Created', '');
			$scope.line_item_view_mode = true;
			$scope.lineitem = "";
			lineitem.line_item_create_mode_null="DUMMY DATS";

		});
		}
	};

	//Adding Container types in list
	$scope.container_type_list = [];
	$scope.getContainerTypes = function(){
		$http.get("/api/config/type/container").success(function(data){
			$scope.container_type_list = data;
			console.log(data);
		}); 
	};
	$scope.getContainerTypes();
	$scope.add_container_type_to_the_list = function(container_type_data){
		$scope.container_data_to_post = {
			'label':container_type_data.container_type_to_add_model,'value':container_type_data.container_type_to_add_model,
			'type':'container'
		};
		$http.post('/api/config/type', $scope.container_data_to_post).success(function(data){
			//alert(container_type_data.container_type_to_add_model);
			$scope.container_type_list.push(container_type_data.container_type_to_add_model);
		toastr.success('Container Type Created', '');
	
			
			//Testing
			var last = Number($scope.container_type_list[$scope.container_type_list.length - 1].value) + 1;
    var newElem = {
      label: container_type_data.container_type_to_add_model,
      value: last.toString()
    };
    $scope.container_type_list.push(newElem);
    $timeout(function() {
      	console.log($scope.containertypes);
		$scope.container_type = newElem.label;
		$scope.lineitemdatatoclone_update.container_type = newElem.label;
      
    }, 0);
				container_type_data.container_type_to_add_model = '';
			$scope.getContainerTypes();
			//end of dummy data
		});

	}

	//DELETE PURCHASE ORDER

	$scope.delete_purchase_order_create_project  =function(purchaseorderdata, $index){
		swal({
   title: "Are you sure?",
		text: "Purchase Order : "+purchaseorderdata.purchase_order + " & Version : " + purchaseorderdata.version,
   type: "warning",
   showCancelButton: true,
   confirmButtonColor: "#DD6B55",
   confirmButtonText: "Yes, delete it!",
   closeOnConfirm: true},
function(){
			$http.delete('/api/po/'+purchaseorderdata._id).success(function(data){
		//	$scope.purchaseorder_list_data = data;
			$scope.purchaseorder_list_data.splice($index,1);
			toastr.success('Purchase Order Deleted', '');


		});





   swal("Purchase Order Deleted!");
});

	};
	//DELETE LINE ITEM

	$scope.delete_line_item_create_project  =function(lineitemdata, $index){

		swal({
   title: "Are you sure?",
			text: "Line Item Name : "+lineitemdata.name,
   type: "warning",
   showCancelButton: true,
   confirmButtonColor: "#DD6B55",
   confirmButtonText: "Yes, delete it!",
   closeOnConfirm: true},
function(){
		$http.delete('/api/lineitem/'+lineitemdata._id).success(function(data){
		//	$scope.purchaseorder_list_data = data;
			$scope.lineitems_list_data.splice($index,1);
			toastr.success('Line Item Deleted', '');
			if($scope.lineitems_list_data.length < 1){
		$scope.line_item_view_mode = false;

	}

		});

   swal("Line Item Deleted!");
});

	};
	//PROJECT EDIT MODE
	$scope.edit_project = function(project){
		$scope.project_edit_mode = true;
	}

	//UPDATE PROJECT
	$scope.update_project = function(project){
		if(!project.code || !project.name || !project.type || !project.start_date || !project.end_date){
			$scope.error_message_create_project = true;
			toastr.error('Please enter  all required fields', '');
			
		}
		else {
		$http.put('/api/project/'+project._id, {code: $scope.project.code,name:$scope.project.name, type: $scope.project.type, start_date: $scope.project.start_date, end_date: $scope.project.end_date }).success(function(data){
			toastr.success('Project Updated', '');
			$scope.project_edit_mode = false;
			//$scope.projectdata = data;
		});
		};

	};
//$scope.purchase_order_new_before_crate_list = [];
	//EDIT PURCHASE ORDER
	$scope.edit_purchase_order = function(){
		
		//$scope.purchase_order_data_to_update = purchaseorderitemviewdata;
		this.purchaseorderitemview.purchase_order_edit_mode=true;
	};
	$scope.add_po_section_in_edit_project = function(){
		
		$scope.add_new_po_section_mode = true;
		
	};

	$scope.update_purchase_order = function(purchaseorderitemview){
		if(!purchaseorderitemview.purchase_order){
			$scope.error_message_edit_purchase_order = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
		$http.put('/api/po/'+purchaseorderitemview._id, {purchase_order: purchaseorderitemview.purchase_order,version:purchaseorderitemview.version, comments:purchaseorderitemview.comments, project_id: $scope.project._id}).success(function(data){
			if(data.state == 'FAILURE'){
				$scope.error_message_update_purchase_order_uniq = true;
				toastr.error(data.msg, '');	
			}
			else {
			toastr.success('Purchase Order Updated', '');
			purchaseorderitemview.purchase_order_edit_mode=false;
			//$scope.projectdata = data;
			};
		}).error(function(data){
			toastr.error(data.message, '');
		});
		};
	};

	//CLONE PURCHASE ORDER
	$scope.clone_purchase_order = function(purchaseorderdatafromclone){
			$scope.purchase_order_clone_mode = true;
		$scope.testDataPurchaseOrder = purchaseorderdatafromclone;

		$scope.purchaseorderdatatoclone_update = angular.copy($scope.testDataPurchaseOrder);
	};

	//CREATE PURCHASE ORDER BY CLONING
	$scope.create_purchase_order_from_clone = function(purchaseorderdatafromclone){
		if(!purchaseorderdatafromclone.purchase_order){
			$scope.error_message_create_purchase_order_clone = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
		$scope.purchse_order_data_clone_to_create = {
			'purchase_order':purchaseorderdatafromclone.purchase_order,
			'version': purchaseorderdatafromclone.version,
			'comments': purchaseorderdatafromclone.comments,
			'project_id':$scope.project._id
		};

		$http.post('/api/po', $scope.purchse_order_data_clone_to_create).success(function(data){
			if(data.state == 'FAILURE'){
				$scope.error_message_clone_purchase_order_uniq = true;
				toastr.error(data.msg, '');	
			}
			else {
			$scope.client_po_list.push(data.purchase_order+'-'+data.version);
			$scope.purchaseorder_list_data.push(data);

			toastr.success('Purchase Order Created', '');
			$scope.purchase_order_clone_mode = false;
			};
		}).error(function(data){
			toastr.error(data.message, '');
		});
		};

	};
	//CLONE LINE ITEM

	$scope.clone_line_item = function(lineitemdatafromclone){

		$scope.line_item_clone_mode = true;
		$scope.testDataLineItem = lineitemdatafromclone;
		$scope.lineitemdatatoclone_update = angular.copy($scope.testDataLineItem);

	}
$scope.error_message_line_item_clone_create = false;
	$scope.create_line_item_from_clone = function(lineitemdatatoclone_update){
		if(!lineitemdatatoclone_update.name || !lineitemdatatoclone_update.container_type || !lineitemdatatoclone_update.quantity){
			$scope.error_message_line_item_clone_create = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
			
			$scope.line_item_data_to_create_from_clone = 		{
			'name':lineitemdatatoclone_update.name,
			'material_type': lineitemdatatoclone_update.material_type,
			'container_type': lineitemdatatoclone_update.container_type,
			'quantity': lineitemdatatoclone_update.quantity,
			'client_po': lineitemdatatoclone_update.client_po,
			'project_id':$scope.project._id
		};

		$http.post('/api/lineitem', $scope.line_item_data_to_create_from_clone).success(function(data){
			$scope.lineitems_list_data .push(data);

			toastr.success('Line Item Created', '');
			$scope.line_item_clone_mode = false;

		}).error(function(data){
			toastr.error(data.message, '');
		});
		};

	}
	$scope.edit_line_item_edit_project = function(){
		this.linitemorderitemview.line_item_edit_mode=true;
		//$scope.line_item_data_to_update = lineitemitemview;

	};
	//UPDATE LINE ITEM IN EDIT PROJECT
		$scope.update_line_item = function(line_item_data_to_update){
			if(!line_item_data_to_update.name || !line_item_data_to_update.container_type || !line_item_data_to_update.quantity){
			$scope.error_message_line_item_update_create = true;
				toastr.error('Please enter  all required fields', '');
		}
		else {
		$http.put('/api/lineitem/'+line_item_data_to_update._id, {'name':line_item_data_to_update.name,
			'material_type': line_item_data_to_update.material_type,
			'container_type': line_item_data_to_update.container_type,
			'quantity': line_item_data_to_update.quantity,
			'client_po': line_item_data_to_update.client_po, }).success(function(data){
			toastr.success('Line Item Updated', '');
			line_item_data_to_update.line_item_edit_mode=false;
			//$scope.projectdata = data;
		});
		};
	};
}]);
app.controller('projectsListController', ['$scope', '$timeout', '$http','toastr', '$filter', '$stateParams', function ($scope, $timeout, $http,toastr, $filter,$stateParams) {
	//GET ALL PROJECTS

	$scope.getprojects = function(){

		$http.get('/api/projects').success(function(data){
		$scope.projects= data;
		$scope.show_projects = true;

		});
	};
	$scope.getprojects();
	$scope.getMyName = function(){
		console.log($scope.myname);
	};
	//DELETE PROJECT
	$scope.delete_project  =function(projectdata, $index){
		swal({
   title: "Are you sure?",
	text: 'Project Name : '+ projectdata.name,
   type: "warning",
   showCancelButton: true,
   confirmButtonColor: "#DD6B55",
   confirmButtonText: "Yes, delete it!",
   closeOnConfirm: true},
function(){
			$http.delete('/api/project/'+projectdata._id).success(function(data){
				$scope.projects.splice($index,1);

			toastr.success('Project Deleted', '');

		});
   swal("Project Deleted!");
});

	};

}]);
app.controller('projectViewController', ['$scope', '$timeout', '$http','toastr', '$filter', '$stateParams', function ($scope, $timeout, $http,toastr, $filter, $stateParams) {
	$scope.getprojectdata = function(){
		$http.get('/api/project/'+$stateParams.id).success(function(data){
			$scope.projectdata = data;
			$scope.$watch('projectdata.start_date', function (newDate) {
    $scope.projectdata.start_date = $filter('date')(newDate, 'MM/dd/yyyy');
	});
				$scope.$watch('projectdata.end_date', function (newDate) {
    $scope.projectdata.end_date = $filter('date')(newDate, 'MM/dd/yyyy');
	});
		});

	};
	$scope.getprojectdata();
	$scope.edit_project = function(project){
		$scope.project_edit_mode = true;
	}
	$scope.update_project = function(projectdata){
		if(!$scope.projectdata.code || !$scope.projectdata.name || !$scope.projectdata.start_date || !$scope.projectdata.end_date){
			//toastr.error('please enter required fields', '');
			$scope.error_message_edit_project = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
			$http.put('/api/project/'+projectdata._id, {code: $scope.projectdata.code,name:$scope.projectdata.name, type: $scope.projectdata.type, start_date: $scope.projectdata.start_date, end_date: $scope.projectdata.end_date }).success(function(data){
			toastr.success('Project Updated', '');
			$scope.project_edit_mode = false;
			//$scope.projectdata = data;
		});
		};
		
		


	};
	//Adding Container types in list
	//Adding Container types in list
	$scope.container_type_list = [];
	$scope.getContainerTypes = function(){
		$http.get("/api/config/type/container").success(function(data){
			$scope.container_type_list = data;
			console.log(data);
		});
	};
	$scope.getContainerTypes();
	$scope.add_container_type_to_the_list = function(container_type_data){
		$scope.container_data_to_post = {
			'label':container_type_data.container_type_to_add_model,'value':container_type_data.container_type_to_add_model,
			'type':'container'
		};
		$http.post('/api/config/type', $scope.container_data_to_post).success(function(data){
			$scope.container_type_list.push(container_type_data.container_type_to_add_model);
			$scope.getContainerTypes();
			$scope.newly_added_container_type = data;
			//Testing
			var last = Number($scope.container_type_list[$scope.container_type_list.length - 1].value) + 1;
    var newElem = {
      label: container_type_data.container_type_to_add_model,
      value: last.toString()
    };
    $scope.container_type_list.push(newElem);
    $timeout(function() {
      	
		$scope.container_type = newElem.label;
		//$scope.line_item_create_edit_project.container_type = newElem.label;
		$scope.lineitemdatatoclone_update.container_type = newElem.label;
      
    }, 0);
			
			//end of dummy data
		toastr.success('Container Type Created', '');
		container_type_data.container_type_to_add_model = '';
		});
	}
	$scope.edit_purchase_order = function(){
		//$scope.purchase_order_data_to_update = purchaseorderitemviewdata;
		this.purchaseorderitemview.purchase_order_edit_mode=true;
	}
	$scope.purchase_order_new_before_crate_list = [{'name': '', 'version': [], 'comments': ''}];
	$scope.add_po_section_in_edit_project = function(){
		$scope.add_new_po_section_mode = true;
		this.purchaseorder.po_item_create_mode_null=true;
		$scope.purchase_order_new_before_crate_list.push({'name': '', 'version': [], 'comments': ''});
	}

	$scope.update_purchase_order = function(purchaseorderitemview){
		if(!purchaseorderitemview.purchase_order){
			$scope.error_message_edit_purchase_order = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
			
		$http.put('/api/po/'+purchaseorderitemview._id, {purchase_order: purchaseorderitemview.purchase_order,version:purchaseorderitemview.version, comments:purchaseorderitemview.comments, project_id: $scope.projectdata._id}).success(function(data){
			if(data.state == 'FAILURE'){
				$scope.error_message_update_purchase_order_uniq = true;
				toastr.error(data.msg, '');	
			}
			else {
			toastr.success('Purchase Order Updated', '');
			purchaseorderitemview.purchase_order_edit_mode=false;
			};
			//$scope.projectdata = data;
		}).error(function(data){
			toastr.error(data.message, '');
		});
		};
		
	};

	//CREATING PURCHASE ORDER FOR PROJECT
	$scope.client_po_list = [];
	$scope.purchaseorder_list_data = [];
	$scope.create_purchase_order = function(purchaseorder){
		if(!purchaseorder.purchase_order){
			$scope.error_message_create_purchase_order = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
		$scope.purchse_order_data = 		{
			'purchase_order':purchaseorder.purchase_order,
			'version': purchaseorder.version,
			'comments': purchaseorder.comments,
			'project_id':$scope.projectdata._id
		};

		$http.post('/api/po', $scope.purchse_order_data).success(function(data){
			if(data.state == 'FAILURE'){
				$scope.error_message_create_purchase_order_uniq = true;
				toastr.error(data.msg, '');	
			}
			else {
	$scope.projectdata.purchase_orders.push(data);		$scope.client_po_list.push(data.purchase_order);
			$scope.purchaseorder_list_data.push( data);
			$scope.purchaseorder = "";
			$scope.purchaseorder.purchase_order = "";
			purchaseorder.po_item_create_mode_null="DUMMY DATS";
			toastr.success('Purchase Order Created', '');
			//$scope.add_new_po_section_mode  = false;
			};

		}).error(function(data){
			toastr.error(data.message, '');
		});
		};
	};
	//DELETE PURCHASE ORDER

	$scope.delete_purchase_order_create_project  =function(purchaseorderdata, $index){
		swal({
   title: "Are you sure?",
	text: "Purchase Order : "+purchaseorderdata.purchase_order + " & Version : " + purchaseorderdata.version,
   type: "warning",
   showCancelButton: true,
   confirmButtonColor: "#DD6B55",
   confirmButtonText: "Yes, delete it!",
   closeOnConfirm: true},
function(){
			$http.delete('/api/po/'+purchaseorderdata._id).success(function(data){
		//	$scope.purchaseorder_list_data = data;
			$scope.projectdata.purchase_orders.splice($index,1);
			toastr.success('Purchase Order Deleted', '');


		});


   swal("Purchase Order Deleted!");
});

	};
	$scope.line_item_data_to_update = '';
	$scope.edit_line_item_edit_project = function(){
		this.linitemorderitemview.line_item_edit_mode=true;
		//$scope.line_item_data_to_update = lineitemitemview;

	};
	$scope.clone_line_item_create_project = function(lineitemitemview){
		//$scope.projectdata.line_items.push(angular.copy(lineitemitemview));

		$scope.line_item_data_to_create = lineitemitemview;
		$scope.line_item_clone_mode = true
	};
	$scope.line_items_list_create_line_item = [{name:'', material_type: '', container_type: '', quantity: '', client_po: ''}];
	
	$scope.add_line_item_edit_project = function(){
		$scope.add_line_item_mode = true;		$scope.line_items_list_create_line_item.push({name:'', material_type: '', container_type: '', quantity: '', client_po: ''});
		this.lineitem.line_item_create_mode_null=true;
	};
	
	
	$scope.lineitems_list_data = [];

	$scope.container_type_change_select = function(item){
		$scope.container_type = item;
	}
	$scope.error_message_create_line_item = false;
	//CREATING LINE ITEM FOR PURCHASE ORDER
	$scope.create_line_item = function(lineitem){
		//$( "#myselect option:selected" ).text();
		//var container_type_value_using_id = $(".container_type_create_li option:selected" ).val();

		//alert($scope.container_type);

		if(!lineitem.name || !$scope.container_type || !lineitem.quantity){
			$scope.error_message_create_line_item = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
			$scope.line_item_data = 		{
			'name':lineitem.name,
			'material_type': lineitem.material_type,
			'container_type': $scope.container_type,
			'quantity': lineitem.quantity,
			'client_po': lineitem.client_po,
			'project_id':$scope.projectdata._id
		};

		$http.post('/api/lineitem', $scope.line_item_data).success(function(data){
			$scope.projectdata.line_items.push(data);
			toastr.success('Line Item Created', '');
			$scope.add_line_item_mode  = false;
			$scope.lineitem = "";
			lineitem.line_item_create_mode_null="DUMMY DATS";
			$scope.container_type = '';

		});
		};
	};
	//CREATING LINE ITEM FOR PURCHASE ORDER BY ClONE
	$scope.create_line_item_by_clone = function(lineitemclone){
		console.log($scope.line_item_data_to_update);
		console.log(lineitemclone);
	$scope.line_item_data = 		{
			'name':lineitemclone.name,
			'material_type': lineitemclone.material_type,
			'container_type': lineitemclone.container_type,
			'quantity': lineitemclone.quantity,
			'client_po': lineitemclone.client_po,
			'project_id':$scope.projectdata._id
		};

		$http.post('/api/lineitem', $scope.line_item_data).success(function(data){
			$scope.projectdata.line_items.push(data);
			toastr.success('Line Item Created', '');
			$scope.add_line_item_mode  = false;
			$scope.lineitem = "";

		});
	};
	//DELETE LINE ITEM

	$scope.delete_line_item_edit_project  =function(lineitemdata, $index){
		swal({
   title: "Are you sure?",
				text: "Line Item Name : "+lineitemdata.name,
   type: "warning",
   showCancelButton: true,
   confirmButtonColor: "#DD6B55",
   confirmButtonText: "Yes, delete it!",
   closeOnConfirm: true},
function(){
		$http.delete('/api/lineitem/'+lineitemdata._id).success(function(data){
		//	$scope.purchaseorder_list_data = data;
			$scope.projectdata.line_items.splice($index,1);
			toastr.success('Line Item Deleted', '');
			if($scope.projectdata.line_items.length < 1){
		$scope.line_item_view_mode = false;

	}

		});

   swal("Line Item Deleted!");
});

	};
	$scope.update_line_item = function(line_item_data_to_update){
		if(!line_item_data_to_update.name || !line_item_data_to_update.container_type || !line_item_data_to_update.quantity){
			$scope.error_message_line_item = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
		
		$http.put('/api/lineitem/'+line_item_data_to_update._id, {'name':line_item_data_to_update.name,
			'material_type': line_item_data_to_update.material_type,
			'container_type': line_item_data_to_update.container_type,
			'quantity': line_item_data_to_update.quantity,
			'client_po': line_item_data_to_update.client_po, }).success(function(data){
			toastr.success('Line Item Updated', '');
			line_item_data_to_update.line_item_edit_mode=false;
			//$scope.projectdata = data;
		});
		};
	};

	//CLONE PURCHASE ORDER
	$scope.clone_purchase_order = function(purchaseorderdatafromclone){
			$scope.purchase_order_clone_mode = true;
		$scope.testDataPurchaseOrder = purchaseorderdatafromclone;

		$scope.purchaseorderdatatoclone_update = angular.copy($scope.testDataPurchaseOrder);
	};
$scope.error_message_create_purchase_order_from_clone = false;
	//CREATE PURCHASE ORDER BY CLONING
	$scope.create_purchase_order_from_clone = function(purchaseorderdatafromclone){
		if(!purchaseorderdatafromclone.purchase_order){
			$scope.error_message_create_purchase_order_from_clone = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
		
		$scope.purchse_order_data_clone_to_create = {
			'purchase_order':purchaseorderdatafromclone.purchase_order,
			'version': purchaseorderdatafromclone.version,
			'comments': purchaseorderdatafromclone.comments,
			'project_id':$scope.projectdata._id
		};

		$http.post('/api/po', $scope.purchse_order_data_clone_to_create).success(function(data){
			if(data.state == 'FAILURE'){
				toastr.error(data.msg, '');	
			}
			else {
			$scope.client_po_list.push(data.purchase_order);
			$scope.projectdata.purchase_orders.push(data);

			toastr.success('Purchase Order Created', '');
			$scope.purchase_order_clone_mode = false;
			};
		}).error(function(data){
			toastr.error(data.message, '');
		});
		};

	};
	//CLONE LINE ITEM

	$scope.clone_line_item = function(lineitemdatafromclone){
		$scope.line_item_clone_mode = true;
		$scope.testDataLineItem = lineitemdatafromclone;
		$scope.lineitemdatatoclone_update = angular.copy($scope.testDataLineItem);

	}
$scope.error_message_line_item_clone_create = false;
	$scope.create_line_item_from_clone = function(lineitemdatatoclone_update){
		if(!lineitemdatatoclone_update.name || !lineitemdatatoclone_update.container_type || !lineitemdatatoclone_update.quantity){
			$scope.error_message_line_item_clone_create = true;
			toastr.error('Please enter  all required fields', '');
		}
		else {
			$scope.line_item_data_to_create_from_clone = 		{
			'name':lineitemdatatoclone_update.name,
			'material_type': lineitemdatatoclone_update.material_type,
			'container_type': lineitemdatatoclone_update.container_type,
			'quantity': lineitemdatatoclone_update.quantity,
			'client_po': lineitemdatatoclone_update.client_po,
			'project_id':$scope.projectdata._id
		};

		$http.post('/api/lineitem', $scope.line_item_data_to_create_from_clone).success(function(data){
			$scope.projectdata.line_items.push(data);

			toastr.success('Line Item Created', '');
			$scope.line_item_clone_mode = false;

		}).error(function(data){
			toastr.error(data.message, '');
		});
		};

	};
	
	$scope.activeTab = 1;
	$scope.setActiveTab = function(tabToSet){
		$scope.activeTab = tabToSet;	
		$scope.get_consolidated_projects_list();
	};
	
	$scope.consolidated_line_items_list = [];
	$scope.consolidated_line_items_list_counted = [];
	$scope.get_consolidated_projects_list = function(){
		$scope.getprojectdata();
		$scope.consolidated_line_items_list = $scope.projectdata.line_items;

		var objs = {};
angular.forEach($scope.consolidated_line_items_list, function(item) {
    objs[item.name] = objs[item.name] || { name: item.name, material_type: item.material_type, quantity: 0 };
    objs[item.name].quantity = objs[item.name].quantity + item.quantity;
})
$scope.line_items_list_merged = [];
angular.forEach(objs, function(item) {
    $scope.line_items_list_merged.push(item);
})
	

		//angular.extend($scope.consolidated_line_items_list, $scope.projectdata.line_items);

	}
	
}]);

