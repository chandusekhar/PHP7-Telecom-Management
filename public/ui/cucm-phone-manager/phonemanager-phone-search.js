angular
	.module('app')
	.controller('phoneManagerSearch.Controller', ['telephonyService', 'LDAPService','sitePhonePlanService', 'siteService', 'cucmService', 'cupiService', 'PageService', 'cucmReportService', '$timeout', '$location', '$state', '$stateParams', function(telephonyService, LDAPService, sitePhonePlanService, siteService, cucmService, cupiService, PageService, cucmReportService, $timeout, $location, $state, $stateParams) {
		
		// This controller does planning and systems provisioning. 
		
		var vm = this;

		vm.refresh = function (){
			// jQuery Hack to fix body from the Model. 
			$(".modal-backdrop").hide();
			$('body').removeClass("modal-open");
			$('body').removeClass("modal-open");
			$('body').removeAttr( 'style' );
			// End of Hack */
			//console.log(vm.newphones);
			$state.reload();
		};
		
		
		vm.firstlettertoupper = function(string){
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
		
		vm.isArray = angular.isArray;

		vm.messages = 'Loading sites...';
		
		var id = $stateParams.id;
		vm.sitecode = id;
		
		vm.deviceForm = {}
		vm.deviceForm.sitecode = id; 
		
		// Match the window permission set in login.js and app.js - may want to user a service or just do an api call to get these. will decide later. 
		vm.permissions = window.telecom_mgmt_permissions;

		if(!vm.permissions.read.PhoneMACD){
			$location.path('/accessdenied');
		}

		vm.getavailablenumbers = telephonyService.getAvailableDidsbySitecode(id)
			.then(function(res){
				// Check if Token has expired. If so then direct them to login screen. 
				if(res.message == "Token has expired"){
					vm.tokenexpired = true;
					//alert("Token has expired, Please relogin");
					//alert(res.message);
					$state.go('logout');
				}

				vm.availablenumbers = res.data.response;
				
				
				//console.log(vm.availablenumbers);
				
				
			}, function(err){
				//Error
			});
		
		vm.searchkeys = ['name',
							'description',
							//'protocol',
							//'callingSearchSpaceName',
							//'devicePoolName',
							//'securityProfileName',
						]
			
		vm.submitDevice = function(phone) {
			console.log("Submit Triggered!")
			
			if(phone.device == "IP Communicator"){
				phone.name = "CIPC_" + phone.dn;
			}
			console.log(phone)
			var path = '/phone/site/'+ id + '/create/'+ phone.device + '&' + phone.name + '&' + phone.dn + '&' + phone.usenumber
			$location.path(path);
			
		}
		
		vm.checkname = function(phone){
			

			if(phone.name){
				vm.nameinvalid = false;
				if(phone.device != "IP Communicator"){
					
					// Check if valid MAC
					var regexp = /^[0-9a-f]{1,12}$/gi;
					if(!phone.name.match(regexp)){
						console.log("NO REGEX MATCH FOUND ON NAME")
						vm.nameinvalid = true;
					}
					if(phone.name.length != 4){
						vm.nameinvalid = true;
					}
				}
				//console.log(vm.nameinvalid)
			}
			
			if(phone.name && !vm.nameinvalid){
				//console.log("Hitting Here")
				if(phone.device == "ATA 190" || phone.device == "ATA 187" || phone.device == "ATA 186"){
					vm.checkphoneusage('ATA'+phone.name)
				}
				else if(phone.device != "IP Communicator"){
					vm.checkphoneusage('SEP'+phone.name)
				}
				
			}
			
		}
		
		
		vm.getcallforwardinfo = function(uuid){
			//console.log(uuid)
			var forward = false;
			if(uuid){
				angular.forEach(vm.phone.line_details, function(value,key) {
					if(key == uuid){
						//console.log("CallForward:")
						//console.log(value.callForwardAll.destination)
						forward = value.callForwardAll.destination
						return forward
						
					}
				});
			}
			//console.log(forward)
			return forward
			
		}
		
		
		vm.checkphoneusage = function(form){
			var key = form.key
			
			if(key == 'name'){
				var search = form.name;
			}
			if(key == 'description'){
				var search = form.description;
			}
			
			if(search){
				//console.log(phone)
				
				cucmService.searchphones(key, search)
					.then(function(res){
						result = res.data.response;
						

						//console.log(result);

						// Must do the push inline inside the API Call or callbacks can screw you with black objects!!!! 
						if(result){
							vm.phones = result;
							console.log(vm.phones)
						}else{
							vm.phones = false;
						}
						

					}, function(err){
						// Error
					});
			}
		}
		
		vm.deletephone = function(phone){
			if(phone){
				console.log("Deleting Phone")
				console.log(phone)
				var phonename = angular.copy(phone)
				console.log(phonename)
				
				cucmService.deletephone(phone)
					.then(function(res){
						result = res.data.response;
						
						if(result){
							vm.phone = ""
							vm.checkphoneusage(phonename)
							console.log(phonename)
						}

					}, function(err){
						// Error
					});
			}
		}
		

		
		vm.checkAllcucmphones = function() {
			console.log("Hitting check all")
			angular.forEach(vm.cucmphones, function(phone) {
			  phone.select = vm.selectAll;
			  //console.log(phone);
			  //vm.cucmphoneselecttouched();
			});
		  };
		  
		
		vm.deletecucmphone = function(phone) {
			
			name = phone.name;
			cucmService.deletephone(name)
				.then(function(res) {
					
					
					if(res.data.deleted_uuid){
						console.log(name + " Successfully Deleted")
						phone = null;
					}
					//console.log(res)
					
					
			  }, function(error) {
					alert('An error occurred');
			  });
			
		}
		
		vm.cucmphonedeleteselected = function(phones){
			angular.forEach(phones, function(phone) {
				if(phone.select == true){
					//console.log(phone);
					vm.deletecucmphone(phone);
				}

			});
			
			$timeout(function(){
				vm.checklineusage(vm.deviceForm.dn)
			}, 500);
				
		}
		
		vm.cucmphonecheckAll = function() {
			angular.forEach(vm.linedetails.device_details, function(phone) {
			  phone.select = vm.cucmphoneselectAll;
			  //console.log(phone);
			  //vm.selecttouched();
			});
		  };

		
	}])
	
	
