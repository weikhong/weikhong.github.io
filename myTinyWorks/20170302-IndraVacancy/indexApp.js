var app = angular.module('myApp', ['angularMoment']);
		// http://stackoverflow.com/questions/20858395/how-to-use-ng-repeat-with-filter-and-index
		app.filter('_customFilterByPosition', function() {
			return function (arr, targetIndexes) {
				return arr.filter(function(arrItem, arrPosIndex) {
					_targetIndexesArray = targetIndexes.split(',');
					for (var i = 0; i < _targetIndexesArray.length; i++) {
						var starshipUrl = arrItem.url;
						var starshipId = starshipUrl.match(/\/([^\/]+)\/?$/)[1];
						if(_targetIndexesArray[i]===starshipId) {
							//console.log(arrPosIndex, starshipId)
							return true;
						}
					}
					//console.log(div);
					//return arrPosIndex % div === (val || 0);
					return false;
				});
			};
		});
		app.service('_customRestService', [
			'$http', '$q',
			function($http, $q) {
				var _this = this;
				this.fetch = function (targetedRestUrl, callDepth) {
					var _deferred = $q.defer();

					if(callDepth===undefined) callDepth = 0;

					console.log(targetedRestUrl);
					$http.get(targetedRestUrl)
						.then(function(response) {
							var _resultsArray = response.data.results;
							var _next = response.data.next;

							//console.log(callDepth, _resultsArray.length, response.data);
							if(_next!==null) {
								callDepth++;
								//console.log(_next.replace("http", "https"));
								_this.fetch(_next.replace("http", "https"), callDepth).then(function(returnedResultArray) {
									_resultsArray = _resultsArray.concat(returnedResultArray);
									_deferred.resolve(_resultsArray);
								});
							}
							else {
								_deferred.resolve(_resultsArray);
							}
		        });

						return _deferred.promise;
				}
			}
		]);
		// =========================================
		app.controller('myCtrl', function($scope, $http, $filter, _customRestService) {
			_customRestService
				.fetch('https://swapi.co/api/starships')
				.then(function(returnedResultArray) {
					//$scope.starships = $filter('filter')(returnedResultArray, {crew: '5'})[0];
					// for (var i = 0; i < returnedResultArray.length; i++) {
					// 	returnedResultArray[i].crewAsInt = parseInt(returnedResultArray[i].crew);
					// 	returnedResultArray[i].crewAsIntHidden = parseInt(returnedResultArray[i].crew);
					// }
					$scope.starships = returnedResultArray;
					$scope.isJsonReady = true;
				});

			$scope.starships = [];
			$scope.firstName= "Wei Khong";
			$scope.lastName= "Teh";
			$scope.isJsonReady = false;
			$scope.orderByFunction = function(starship) {
				return parseInt(starship.crew);
			};
		});