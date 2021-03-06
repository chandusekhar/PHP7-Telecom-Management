angular
	.module('app')
	.controller('Cucm.Pktloss.CDR.Controller', ['cucmCdrService', '$location', '$timeout', '$interval', '$state', '$scope', function(cucmCdrService, $location, $timeout, $interval, $state, $scope) {
	
		var vm = this;
		
		getdatetime();
		initController();
		
		vm.siteForm = {};
		
		vm.refresh = function (){
			$state.reload();
		};
		
		// Match the window permission set in login.js and app.js - may want to user a service or just do an api call to get these. will decide later. 
		vm.permissions = window.telecom_mgmt_permissions;

		if(!vm.permissions.read.CucmCDR){
			$location.path('/accessdenied');
		}

		vm.messages = 'Loading...';

		vm.loading = true;
		
		function initController() {
			vm.getactivecalls = cucmCdrService.list_last_24hr_calls_with_loss()
				.then(function(res){
					vm.message = "";
					// Check for errors and if token has expired. 
					if(res.data.message){
						console.log(res);
						vm.message = res.data.message;
						console.log(vm.message);
						
						if(vm.message == "Token has expired"){
							// Send user to login page if token expired. 
							$location.path('/logout');
						}

						return vm.message;
					}
					

					var callarray = res.data.result;
					vm.callarray = callarray
					//console.log(vm.callarray)

					// Convert DB Timestamp to local PC Time. 
					angular.forEach(callarray, function(call) {

						// Convert UTC to local time
						var dateString = call.dateTimeStamp;
						date_start = moment().utc().format(dateString);
						date_start = moment.utc(date_start).toDate();
						call.start_time_local = date_start.toLocaleString()

						call.raw = JSON.stringify(call)
						/*
						// Convert UTC to local time
						var dateString = call.disconnect_time;
						date_disconnect = moment().utc().format(dateString);
						date_disconnect = moment.utc(date_disconnect).toDate();
						call.disconnect_time_local = date_disconnect.toLocaleString()
						*/
						
						console.log(call)
						
					});
					

					if(vm.callarray.length == 0){
						// If no active calls returned then set the noactivecalls variable to display the message to the user. 
						vm.noactivecalls = true;
					}
					
					// Stop Loading 
					vm.loading = false;
					
					//$timeout(initController,5000); 
						
				}, function(err){
					alert(err);
				});
		}
		
		var pull = $interval(initController,60000); 
		
		// Get current local Date and Time to display on page
		function getdatetime(){
			date = new Date();
			vm.datetime = date.toLocaleString()
		}	
		
		// Update the date and time every second. 
		var updatetime = $interval(getdatetime,1000); 
		
		// Stop polling when you leave the page. 
		$scope.$on('$destroy', function() {
			//console.log($scope);
            $interval.cancel(pull);
			$interval.cancel(updatetime);
		});

	}])

