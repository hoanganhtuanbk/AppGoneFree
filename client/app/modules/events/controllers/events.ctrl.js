/*jshint sub:true*/
'use strict';
angular.module('com.module.events')
  .controller('EventsCtrl', function($scope, $state, $stateParams, CoreService,
                                     Event, gettextCatalog) {

    var eventId = $stateParams.id;

    var splitDate = function() {
      var event = $scope.event;
      event.sDate = event.sTime = event.startTime;
      event.eDate = event.eTime = Date.parse(event['end_time']);
      //      event['start_time'] =  event['end_time'] = null;
    };

    if (eventId) {
      $scope.event = Event.findById({
        id: eventId
      }, function() {
        splitDate();
      }, function(err) {
        console.log(err);
      });
    } else {
      $scope.event = {};
    }

    function loadItems() {
      $scope.events = Event.find();
    }

    loadItems();

    $scope.delete = function(id) {
      CoreService.confirm(gettextCatalog.getString('Are you sure?'),
        gettextCatalog.getString('Deleting this cannot be undone'),
        function() {
          Event.deleteById(id, function() {
            CoreService.toastSuccess(gettextCatalog.getString(
              'Event deleted'), gettextCatalog.getString(
              'Your event is deleted!'));
            loadItems();
            $state.go('app.events.list');
            console.log();
          }, function(err) {
            CoreService.toastError(gettextCatalog.getString(
              'Error deleting event'), gettextCatalog.getString(
              'Your event is not deleted: ') + err);
          });
        },
        function() {
          return false;
        });
    };

    var dateOpen = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      this.opened = true;
    };

    $scope.formFields = [{
      key: 'name',
      label: gettextCatalog.getString('Name'),
      type: 'text',
      required: true
    },  {
      key: 'author',
      type: 'text',
      label: gettextCatalog.getString('Author'),
      required: true
    }, {
      key: 'rate',
      type: 'text',
      label: gettextCatalog.getString('Rate'),
      required: true
    },{
      key: 'value',
      type: 'text',
      label: gettextCatalog.getString('Value')
    },{
        key: 'urlImage',
        type: 'text',
        label: gettextCatalog.getString('urlImage')
      },{
      key: 'what',
      type: 'text',
      label: gettextCatalog.getString('What'),
      required: true
    }, {
      key: 'why',
      type: 'text',
      label: gettextCatalog.getString('Why'),
      required: true
    },   {
      key: 'sDate',
      required: true,
      label: gettextCatalog.getString('Start Date'),
      type: 'date',
      format: gettextCatalog.getString('dd/MM/yyyy'),
      opened: false,
      switchOpen: dateOpen
    }, {
      key: 'sTime',
      required: true,
      label: gettextCatalog.getString('Start Time'),
      type: 'time',
      hstep: 1,
      mstep: 5,
      ismeridian: true
    }, {
      key: 'eDate',
      label: gettextCatalog.getString('End'),
      type: 'date',
      format: gettextCatalog.getString('dd/MM/yyyy'),
      opened: false,
      switchOpen: dateOpen
    }, {
      key: 'eTime',
      required: true,
      label: gettextCatalog.getString('End Time'),
      type: 'time',
      hstep: 1,
      mstep: 5,
      ismeridian: true
    }

    ];

    $scope.formOptions = {
      uniqueFormId: true,
      hideSubmit: false,
      submitCopy: gettextCatalog.getString('Save')
    };
    $scope.alerts = [];

    $scope.onSubmit = function() {
      var event = $scope.event;


      Event.upsert($scope.event, function() {
        CoreService.toastSuccess(gettextCatalog.getString('Event saved'),
          gettextCatalog.getString('Your event is safe with us!'));
        $state.go('^.list');
      }, function(err) {
        $scope.alerts.push({
          type: 'danger',
          msg: err.data.error.message
        });
        CoreService.toastError(gettextCatalog.getString(
          'Event not added'), err.data.error.message);
        console.log(err);
      });
    };


  })
// http://angulartutorial.blogspot.com/2014/03/rating-stars-in-angular-js-using.html



    .controller('RatingController', RatingController)
    .directive('starRating', starRating);

  function RatingController() {
    this.rating1 = 5;
    this.rating2 = 2;
    this.isReadonly = true;
    this.rateFunction = function(rating) {
      console.log('Rating selected: ' + rating);
    };
  }

  function starRating() {
    return {
      restrict: 'EA',
      template:
      '<ul class="star-rating" ng-class="{readonly: readonly}">' +
      '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
      '    <i class="fa fa-star"></i>' + // or &#9733
      '  </li>' +
      '</ul>',
      scope: {
        ratingValue: '=ngModel',
        max: '=?', // optional (default is 5)
        onRatingSelect: '&?',
        readonly: '=?'
      },
      link: function(scope, element, attributes) {
        if (scope.max == undefined) {
          scope.max = 5;
        }
        function updateStars() {
          scope.stars = [];
          for (var i = 0; i < scope.max; i++) {
            scope.stars.push({
              filled: i < scope.ratingValue
            });
          }
        };
        scope.toggle = function(index) {
          if (scope.readonly == undefined || scope.readonly === false){
            scope.ratingValue = index + 1;
            scope.onRatingSelect({
              rating: index + 1
            });
          }
        };
        scope.$watch('ratingValue', function(oldValue, newValue) {
          if (newValue) {
            updateStars();
          }
        });
      }
    };
  }
