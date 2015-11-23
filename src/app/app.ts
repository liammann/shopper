/*
 * Angular 2 decorators and services
 */
import {Directive, Component, View, ElementRef, NgZone} from 'angular2/angular2';
import {RouteConfig, Router} from 'angular2/router';
import {Http, Headers} from 'angular2/http';

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';



/*
 * Directive
 * XLarge is a simple directive to show how one is made
 */

/*
 * App Component
 * Top Level Component
 */
@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'app'
  selector: 'app', // <app></app>
  // We need to tell Angular's compiler which directives are in our template.
  // Doing so will allow Angular to attach our behavior to an element
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES ],
  // Our list of styles in our component. We may add more to compose many styles together
  styles: [`
    .title {
      font-family: Arial, Helvetica, sans-serif;
    }
    main,body {
      margin: 0;
      padding: 0;

    }
     #map {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
    }
    input {
      width: 75%;
    }
  `],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'tmpl.html'
})
export class App {
  // These are member type
  strokeOpacity;
  title: string;
  uid;
  address: string = 'po5 1he';
  map;
  shops = [];
  customerDetails = [];
  data; // default data
  markers = [];
  zone: NgZone;
  distance;
  lines;
  greenMax;
  redMin;
  cusPostCode;

  constructor(public http: Http, zone:NgZone) {
    this.data = "hello";
      this.greenMax = parseFloat(2).toFixed(2);
      this.redMin = parseFloat(5).toFixed(2);
    var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(50.81926335, -1.0844131),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

  }
  changeInfoPanel(i){
console.log("hi");
  }
  addMarkers (marks){
    this.lines = []
    for (var i = 0; i < marks.length; ++i) {

      // if(marks[i].location == ""){
      //   this.customerDetails[i].location = this.getAddress(marks[i].postcode, i);

      //   marks[i].location = this.customerDetails[i].location;
      //   this.addMarkers([marks[i]]);

      // } else {
        this.markers[i] = new google.maps.Marker({
            map: this.map,
            position: marks[i].location,
            title: marks[i].name,
            icon: marks[i].icon
        });
        this.markers[i].setMap(this.map);
         
        
        if( marks[i].shopLocation !== undefined){
         
          this.customerDetails[i].distance = this.calDistanceToShop( marks[i].location, marks[i].shopLocation)*0.000621371192;
          this.markers[i].uid = i;

            this.lines[i] = new google.maps.Polyline({
              path: [
                  marks[i].location, 
                  marks[i].shopLocation
              ],
              strokeColor: this.calulateColour(marks[i].distance),
              strokeOpacity: this.strokeOpacity / 100,
              strokeWeight: 2,
              map: this.map
            });
          this.lines[i].uid = i;

            this.zone = zone;

          var that = this;
          this.lines[i].addListener('mouseover',  (function(){
             this.setOptions({strokeWeight: 7, strokeOpacity: 0.95 });

          }));
          this.lines[i].addListener('mouseout',  (function(){
            console.log(this);
             this.setOptions({strokeWeight: 1, strokeOpacity: that.strokeOpacity / 100 });

          }));
          this.lines[i].addListener('click',  (function(){
            that.updateInfo(this.uid );
          }));
          this.markers[i].addListener('click',  (function(){
              that.updateInfo(this.uid );
          }));
      } 
    }
  }
  rad (x) {
    return x * Math.PI / 180;
  }

  updateInfo(uid) {
    this.zone.run(() => {    
      this.distance = "" + parseFloat(Math.round( this.customerDetails[uid].distance * 100) / 100).toFixed(2).toString() + " Miles"; 
      this.cusPostCode = this.customerDetails[uid].postcode;
      this.uid = uid;
    });
  }
  calulateColour(distance){
    switch (true) {
      case (0 <= distance &&  distance < this.greenMax): 
        return "GREEN"
      break;
      case (this.greenMax <= distance &&  distance < this.redMin): 
        return "ORANGE";
      break;
      case (this.redMin <= distance &&  distance < 999): 
        return "RED";
      break;
    }
  }
  recalulateColour (val, colour){
    if (colour === "green"){
      this.greenMax = parseFloat(val).toFixed(2);
    } else if(colour === "red"){  
      this.redMin = parseFloat(val).toFixed(2);
    }
    else if(colour === "opacity"){  
      this.strokeOpacity = val ;
    }
  
    for (var i = 0; i < this.customerDetails.length; ++i) {
      this.lines[i].setOptions({strokeColor: this.calulateColour(this.customerDetails[i].distance),
        strokeOpacity: this.strokeOpacity /100 });
    }
  }

  calDistanceToShop (p1, p2){
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = this.rad(p2.lat - p1.lat);
    var dLong = this.rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; 
  }

  onInit() {

    this.http.get('shops.json')
      .map(res => res['_body'])
      .subscribe(
       data => this.shops = JSON.parse(data),
       err => this.errorMessage(err),
       () => this.addMarkers(this.shops)
    );

    this.http.get('customerDetails.json')
      .map(res => res['_body'])
      .subscribe(
       data => this.customerDetails = JSON.parse(data),
      err => this.errorMessage(err),
      () => this.addMarkers(this.customerDetails)
    );
  }
  errorMessage(err) {
    console.log(err);
  

  }
}