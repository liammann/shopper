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
  `],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'tmpl.html'
})
export class App {
  // These are member type
  title: string;
  address: string = 'po5 1he';
  map;
  shops = [];
  customerDetails = [];
  data; // default data
  unjsondata; // default data
  markers = [];
  zone: NgZone;
  mid: int;
  distance;

  constructor(public http: Http, zone:NgZone) {
    this.data = "hello";
    var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(50.7926335, -1.0844131),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

  }
  changeInfoPanel(i){
console.log("hi");
  }
  addMarkers (marks){
    var lines = []
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
         
         this.markers[i].distance = this.calDistanceToShop( marks[i].location, marks[i].shopLocation)*0.000621371192;

         this.customerDetails[i].distance =  this.markers[i].distance;
        
        if( marks[i].shopLocation !== undefined){
            lines[i] = new google.maps.Polyline({
              path: [
                  marks[i].location, 
                  marks[i].shopLocation
              ],
              strokeColor: this.calulateColour(marks[i].distance),
              strokeOpacity: 0.5,
              strokeWeight: 2,
              map: this.map
            });

            this.zone = zone;

          var that = this;
          this.markers[i].addListener('click',  (function(){
            that.updateDistance(this.distance);
          })
        );
      } 
    }
  }
  rad (x) {
    return x * Math.PI / 180;
  }

  updateDistance(distance) {
    this.zone.run(() => {    this.distance = "" + parseFloat(Math.round( distance * 100) / 100).toFixed(2).toString() + " Miles"; });
  }
  calulateColour(distance){
    switch (true) {
      case (0 <= distance &&  distance < 1.5): 
        return "GREEN"
      break;
      case (1.5 <= distance &&  distance < 5): 
        return "ORANGE";
      break;
      case (5 <= distance &&  distance < 30000): 
        return "RED";
      break;
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

  serverData(data, currentCustomer) {
    this.unjsondata = data._body; 
    this.data = JSON.parse(this.unjsondata).results[0].geometry.location;
    this.customerDetails[currentCustomer].location = this.data;
  }

  errorMessage(err) {
    console.log(err);
  }





// not needed

  

  enterAddress($event, newAddress) {
     if($event.which === 13) { // ENTER_KEY

        var length = this.customerDetails.push({    
          "location": "", 
          "postcode": newAddress.value,
          "shop": "Tesco 1",
          "date": "20/2/2014",
          "icon": "customerIcon.png"
        });

        this.customerDetails[length-1].location = this.getAddress(newAddress.value, length-1);

        this.addMarkers(this.customerDetails);

        newAddress.value = '';

     }
  }

  getAddress(newAddress, currentCustomer){

    this.http
      .get('https://maps.googleapis.com/maps/api/geocode/json?address=' + newAddress + '&key=AIzaSyBZVOSPh0Z4mv9jljJWzZNSug6upuec7Sg')
      .subscribe(
        // onNext callback
        data =>  this.serverData(data, currentCustomer),
        // onError callback
        err  => this.errorMessage(err),
        // onComplete callback
        ()   =>  this.addMarkers(this.customerDetails)
      );//end http

  }
}