/*global angular, _, openFB */
angular.module('push.controllers')
  .controller('FriendshipsCtrl', function ($scope, EventBus, Friend, FriendRequest, SentFriendRequest) {
    $scope.friendEmail = '';
    $scope.message = '';
    $scope.contacts = [];

    var pendingRequestIds = SentFriendRequest.allFbids();
    $scope.pending = function(id) {
      return _.contains(pendingRequestIds, id);
    };

    openFB.api({
      path: '/v2.2/me/friends',
      success: function (response) {
        console.log('getting fb friends: ', response.data);
        $scope.contacts = response.data;
      },
      error: function (response) {
        console.log('err getting FB friends!', response);
        if(response.code === 190) {
          EventBus.trigger('loginRequired');
        }
      }
    });

    // $scope.pickContact = function () {
    //   Contacts
    //     .pickContact()
    //     .then((contact) => {
    //       $scope.message = 'Inviting ' + contact.displayName;
    //     }, (failure) => {
    //       console.log("Bummer.  Failed to pick a contact");
    //     });
    // };

    $scope.challengeContact = function (contact) {
      pendingRequestIds.push(contact.id);
      FriendRequest.createForContact(contact);
    };

    $scope.inviteFriend = function (email) {
      console.log('inviting', email);
      Friend.inviteFriend(email).then(function (friends) {
        $scope.friendEmail = '';
        $scope.message = 'Sent!';
      });
    }
  });
