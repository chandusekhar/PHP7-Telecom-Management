﻿angular
	.module('app')
	.factory('sitePhonePlanService', ['$http', '$localStorage', '$stateParams', '$q', '$state', function($http, $localStorage, $stateParams, $q, $state){
		
		var self = {};


		// Get Dids by Block ID
		self.getsitephoneplans = function(id) {
			var defer = $q.defer();
			return $http.get('../api/site/'+id+'/phoneplans')
				.then(function successCallback(response) {
					defer.resolve(response);
					// Must return the promise to the controller. 
					return defer.promise;
					
			  }, function errorCallback(response) {
			
			});
		}
		
		// Update Block by ID
		self.getphoneplan = function(id) {
			var defer = $q.defer();
			return $http.get('../api/phoneplan/id/'+id)
				.then(function successCallback(response) {
					defer.resolve(response);
					
					// Must return the promise to the controller. 
					return defer.promise;
					
			  }, function errorCallback(response) {
					
			  });
		}
		
		// Update Block by ID
		self.getphoneplanphones = function(id) {
			var defer = $q.defer();
			return $http.get('../api/phoneplan/id/'+id+'/phones')
				.then(function successCallback(response) {
					defer.resolve(response);
					
					// Must return the promise to the controller. 
					return defer.promise;
					
			  }, function errorCallback(response) {
					
			  });
		}

		/*
		// Needs work! 
		self.getdidblocks = function() {
			var defer = $q.defer();
			return $http.get('../api/didblock')
				.then(function successCallback(response) {
					defer.resolve(response);
					
					// Must return the promise to the controller. 
					return defer.promise;
					
			  }, function errorCallback(response) {
					
			  });
		}
		*/
	
		
		
		// Create
		self.createphoneplan = function(phoneplan) {
			
			return $http.post('../api/phoneplan', phoneplan);
		}
		
		
		// Update by ID
		self.updatephoneplan = function(id, update) {
        
			return $http.put('../api/phoneplan/'+id, update).then(function(response) {

				var data = response.data;
				return data;

			 }, function(error) {return false;});
		}

		
		// Delete by ID
		self.deletephoneplan = function(id) {
			console.log('Service - Deleting ID: '+ id);
			return $http.delete('../api/phoneplan/'+id, id).then(function(response) {

				var data = response.data;
				return data;

			 });
		}


		return self

	}]);