'use strict';

app.factory('ProfileService', function(FURL, $firebase, $q) {
    var ref = new Firebase(FURL);

    var ProfileService = {

        addUserInfo: function(uid,obj) {
            var updateUrl = $firebase(ref.child('profile').child(uid))
            return updateUrl.$update(obj)
        }
    };

    return ProfileService;
});

//# sourceMappingURL=profileService.js.map
