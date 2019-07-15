import React from 'react';
export default class Hub { 
    constructor(coordinate, location, ghostmarker, geohash, stats, id) {
        this.coordinate = coordinate;
        this.location = location;
        this.geohash = geohash;
        this.stats = stats;
        this.key = id;
        this.ghostMarker = ghostmarker;
    }
  }