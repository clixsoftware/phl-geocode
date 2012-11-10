var http = require('http');
var _ = require('underscore');

function PHLGeolocate(opts) {
  this.defaultSettings = {
    geoHost: 'http://services.phila.gov',
    locationPath: '/ULRS311/Data/Location/',
    liAddressKeyPath: '/ULRS311/Data/LIAddressKey/',
    minConfidence: 85,
    responseBody: undefined
  };

  this.settings = opts ? _.defaults(opts, this.defaultSettings) : this.defaultSettings;
}

PHLGeolocate.prototype.getCoordinates = function (address, callback) {
  var url = this.settings.geoHost + this.settings.locationPath + encodeURI(address);
  this.callAPI(url, callback);
};

PHLGeolocate.prototype.callAPI = function (url, callback) {
  var self = this;
  var result;

  http.get(url, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      self.settings.responseBody += chunk;
    });
    res.on('end', function() {
      result = self.parseLocations(JSON.parse(self.settings.responseBody.Locations));
      callback(result);
    });
  });
};

PHLGeolocate.prototype.parseLocations = function (locs) {
	var self = this;
	var locations = [];
	var locLength = locs.length;
	var loc;
	var i;

	for (i=0; i<locLength; i++) {
    var geometry;
		loc = locs[i];

		if (loc.Address.Similarity >= self.settings.minConfidence) {
			geometry = {
        address: loc.Address.StandardizedAddress,
        similarity: loc.Address.Similarity,
        latitude: loc.YCoord,
        longitude: loc.XCoord
      };

			locations.push(geometry);
		}
	}

	return locations;
};

module.exports = function(opts) {
  return new PHLGeolocate(opts);
};