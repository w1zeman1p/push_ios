/*global angular */
angular.module('push.controllers')
  .controller('WorkoutCtrl', function($scope, $state, $stateParams, $timeout, EventBus, Workout, WorkoutSet) {
    $scope.sets = [];
    $scope.reps = 0;
    $scope.workout = null;

    function getWorkout(id) {
      console.log('Getting Workout');
      Workout.get(id);
    }

    $scope.createWorkout = function() {
      console.log('Creating Workout');
      Workout
        .create()
        .then(function (workout) {
          $scope.workout = workout;
          console.log('workout created', workout);
        }, function () {
          console.log('uhoh workout not created', arguments);
        });
    };

    function setupWorkout() {
      if($stateParams.id === "new") {
        $scope.createWorkout();
      } else {
        getWorkout($stateParams.id);
      }
    }

    $scope.$on('$stateChangeSuccess', function(){
      setupWorkout();
    });

    EventBus.on('authChange', setupWorkout);

    $scope.pulse = false;
    $scope.push = function () {
      $scope.reps++;
      $scope.pulse = true;
      $timeout(() => {
        $scope.pulse = false;
      }, 1000)
    };

    $scope.completeSet = function () {
      var set = new WorkoutSet({
        reps: $scope.reps,
        workout_id: $scope.workout.get('id')
      });

      $scope.sets.push(set.attributes);
      $scope.workout.workout_sets.push(set);

      set.save().then((response) => {
        $scope.reps = 0;
        console.log('workout.workout_sets: ', $scope.workout.workout_sets);
      });
    };

    $scope.completeWorkout = function () {
      if($scope.reps > 0) {
        var set = new WorkoutSet({
          reps: $scope.reps,
          workout_id: $scope.workout.get('id')
        });

        $scope.sets.push(set);
        $scope.workout.workout_sets.push(set);
        $scope.reps = 0;
        set.save();
      }

      $scope.workout.set({ completed_date: new Date() });
      $scope.workout.save().then(() => {
        $scope.sets = [];
        $scope.reps = 0;
        $scope.workout = null;
        $state.go('tab.workouts', {}, { reload: true, inherit: false });
      });
    };
  });
