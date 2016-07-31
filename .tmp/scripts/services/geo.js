var latitude = document.getElementById('latitude'),
		longitude = document.getElementById('longitude');

		if(navigator.geolocation){

			function onSuccess(position){
				latitude.value = position.coords.latitude;
				longitude.value = position.cords.longitude;
			}
			function onError(error){
				alert("Error: " + error.code + ", Message: " + error.message);
			}

			navigator.geolocation.getCurrentPosition(onSuccess, onError);

		} else {
			alert("Your browser does not support geolocation");
		}

//# sourceMappingURL=geo.js.map
