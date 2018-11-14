var express = require('express'); //use express to create api
var request = require('request'); //use request to make requests
var app = express(); //create app
var port = process.env.PORT || 3000; //use port 3000

app.listen(port); //put server online on port 3000

//variables for get parameters
var pickup;
var dropoff;
var passengers;

var arg_format = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/; //regex formatting for latitude, longitude
//array of car types
var car_types = ['STANDARD','EXECUTIVE','LUXURY','PEOPLE_CARRIER','LUXURY_PEOPLE_CARRIER','MINIBUS'];
//url for apis
var api_url = "https://techtest.rideways.com/";
//supplier names
var supplier_dave = "dave";
var supplier_eric = "eric";
var supplier_jeff = "jeff";
var supplier = ["dave", "eric", "jeff"];
//parameters for pickup and dropoff
var parameter_pickup = "";
var parameter_dropoff = "";
//request url to use when querying daves api
var request_url = "";

//get request for the cheapest supplier for each vehicle
app.get('/Cheapest', function(req, res) {

  //set up variables
  var out_array = [];
  var counter = 0;
  var responses = [];

  //get parameters
  pickup = req.query.pickup;
  dropoff = req.query.dropoff;

  //check that required parameters are present
  if (typeof pickup == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Pickup parameter is required.", "/cheapest"));
  if (typeof dropoff == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Dropoff parameter is required.", "/cheapest"));

  //check that parameters are in the correct format
  if (!arg_format.test(pickup)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Pickup parameter is incorrectly formatted, format is latitude,longitude.", "/cheapest"));
  if (!arg_format.test(dropoff)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Dropoff parameter is incorrectly formatted, format is latitude,longitude.", "/cheapest"));

  //set up parameters and request url
  parameter_pickup = "pickup=" + pickup;
  parameter_dropoff = "dropoff=" + dropoff;

  function processResponses(array){ //process our responses and print the best offer for each vehicle type

    car_types.forEach(function (type){ //for each car type

      var temp_lowest_price = -1;  //temp variables for cheapest option
      var temp_supplier = "";

      array.forEach(function (body){ //for each request response

        if (body != null) { //if there is a body there (there was an actual response)

          body.options.forEach(function (option){ //for each option

            if (option.car_type == type){ //if the type matches the current one

              if (temp_lowest_price == -1) { //if we have no set a cheapest option yet

                temp_lowest_price = option.price; //set this to be the cheapest option
                temp_supplier = body.supplier_id;

              } else if (option.price < temp_lowest_price) { //if it is the cheapest option

                temp_lowest_price = option.price; //set this to be the cheapest option
                temp_supplier = body.supplier_id;

              }
            }
          });
        }
      });

      if (temp_supplier != "") { //if we have a result actually returned
        //create a json output and add it to our output array
        var out_obj = new Object();
        out_obj.car_type = type;
        out_obj.supplier = temp_supplier;
        out_obj.price = temp_lowest_price;
        out_array.push(JSON.stringify(out_obj));
      }
    });

    var out = new Object();
    out.options = out_array; //build json payload

    res.send(JSON.stringify(out)); //respond with json payload

  }

  function callback(options) { //callback to store the responses
    counter++; //increment a counter for each response
    responses.push(options); //push the response onto the array of responses
    if (counter == 3) { //when we have a response (or nothing) from all 3 suppliers
      processResponses(responses); //process the responses
    }
  }

  function doRequest(supplier_name, callback) {
    //create the request url
    request_url = api_url+supplier_name+'?'+parameter_pickup+'&'+parameter_dropoff;
    //make the request
    request(request_url, {timeout:2000}, function (error, response, body) {

      if (error != null) { //if there is an error

        if (error.code == 'ESOCKETTIMEDOUT') { //if the request times out

          //res.send(errorResponse(500, "Timed Out", supplier_name+"'s API took longer than 2 seconds to respond.", "/"+supplier_name));

        } else { //if some other unexpected error occurs

          //res.send(errorResponse(500, "Unknown", "An unknown error occurred connecting to "+supplier_name+"'s api", "/"+supplier_name));

        }

        callback(null); //callback with a null so we know the request failed

      } else { //if there is no error

        body = JSON.parse(body); //parse the body of the response

        if(response.statusCode == 400) { //if we get code 400 (client error)

          callback(null); //callback with null so we know the request failed

        } else {

          if(response.statusCode == 500) { //if we get code 500 (server error)

            callback(null); //callback with null so we know the request failed

          } else {

            callback(body); //return the response using a callback

          }
        }
      }
    });
  }

  supplier.forEach(function(supplier_name) { //for each supplier, query their api
    doRequest(supplier_name, callback); //use the callback to process the responses
  });
});

//get request for sorted (descending) options from dave's api
app.get('/Dave', function(req, res) {

  //read in parameters (passengers is available)
  pickup = req.query.pickup;
  dropoff = req.query.dropoff;
  passengers = req.query.passengers;

  //check that required parameters are present
  if (typeof pickup == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Pickup parameter is required.", "/dave"));
  if (typeof dropoff == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Dropoff parameter is required.", "/dave"));

  //check that parameters are in the correct format
  if (!arg_format.test(pickup)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Pickup parameter is incorrectly formatted, format is latitude,longitude.", "/dave"));
  if (!arg_format.test(dropoff)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Dropoff parameter is incorrectly formatted, format is latitude,longitude.", "/dave"));

  //set passengers to 0 if it is not given or is formatted incorrectly.
  if (typeof passengers == 'undefined') {
    passengers = 0;
  }

  //set up parameters and request url
  parameter_pickup = "pickup=" + pickup;
  parameter_dropoff = "dropoff=" + dropoff;
  request_url = api_url+supplier_dave+'?'+parameter_pickup+'&'+parameter_dropoff;

  //make request to the crafted url
  request(request_url, {timeout:2000}, function (error, response, body) {
    //if there is an error with the request (mainly timeouts), handle it
    if (error != null) {
      //if we have a timeout error, print some stuff out
      if (error.code == 'ESOCKETTIMEDOUT') {
        //send code 500 error for time out error
        res.send(errorResponse(500, "Timed Out", "Dave's API took longer than 2 seconds to respond", "/dave"));

      } else {
        //send code 500 error for unknown error
        res.send(errorResponse(500, "Unknown", "An unknown error occured connecting to dave's api", "/dave"));

      }

    } else {

      body = JSON.parse(body); //parse the response

      if (response.statusCode == 400) {
        //send code 400 error
        res.send(errorResponse(400, body.error, body.message, "/dave"));

      } else {

        if (response.statusCode == 500) {
          //send code 500 error
          res.send(errorResponse(500, body.error, body.message, "/dave"));

        } else {
          //send options back
          body.options.sort(function(a,b) { return parseFloat(b.price) - parseFloat(a.price) } );
          body.options = body.options.filter(filter); //apply filter
          res.send(body.options);

        }
      }
    }
  });
});

app.get('/Eric', function(req, res) {

  //read in parameters (passengers is available)
  pickup = req.query.pickup;
  dropoff = req.query.dropoff;
  passengers = req.query.passengers;

  //check that required parameters are present
  if (typeof pickup == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Pickup parameter is required.", "/eric"));
  if (typeof dropoff == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Dropoff parameter is required.", "/eric"));

  //check that parameters are in the correct format
  if (!arg_format.test(pickup)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Pickup parameter is incorrectly formatted, format is latitude,longitude.", "/eric"));
  if (!arg_format.test(dropoff)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Dropoff parameter is incorrectly formatted, format is latitude,longitude.", "/eric"));

  //set passengers to 0 if it is not given or is formatted incorrectly.
  if (typeof passengers == 'undefined') {
    passengers = 0;
  }

  //set up parameters and request url
  parameter_pickup = "pickup=" + pickup;
  parameter_dropoff = "dropoff=" + dropoff;
  request_url = api_url+supplier_eric+'?'+parameter_pickup+'&'+parameter_dropoff;

  //make request to the crafted url
  request(request_url, {timeout:2000}, function (error, response, body) {
    //if there is an error with the request (mainly timeouts), handle it
    if (error != null) {
      //if we have a timeout error, print some stuff out
      if (error.code == 'ESOCKETTIMEDOUT') {
        //send code 500 error for time out
        res.send(errorResponse(500, "Timed Out", "Eric's API took longer than 2 seconds to respond", "/eric"));

      } else {
        //send code 500 error for unknown error
        res.send(errorResponse(500, "Unknown", "An unknown error occured connecting to eric's api", "/eric"));

      }

    } else {

      body = JSON.parse(body); //parse the response

      if (response.statusCode == 400) {
        //send code 400 error
        res.send(errorResponse(400, body.error, body.message, "/eric"));

      } else {

        if (response.statusCode == 500) {
          //send code 500 error
          res.send(errorResponse(500, body.error, body.message, "/eric"));

        } else {
          //send options back
          body.options.sort(function(a,b) { return parseFloat(b.price) - parseFloat(a.price) } );
          body.options = body.options.filter(filter); //apply filter
          res.send(body.options);

        }
      }
    }
  });
});

app.get('/Jeff', function(req, res) {

  //read in parameters (passengers is available)
  pickup = req.query.pickup;
  dropoff = req.query.dropoff;
  passengers = req.query.passengers;

  //check that required parameters are present
  if (typeof pickup == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Pickup parameter is required.", "/jeff"));
  if (typeof dropoff == 'undefined') res.send(errorResponse(400, "Missing Parameters", "Dropoff parameter is required.", "/jeff"));

  //check that parameters are in the correct format
  if (!arg_format.test(pickup)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Pickup parameter is incorrectly formatted, format is latitude,longitude.", "/jeff"));
  if (!arg_format.test(dropoff)) res.send(errorResponse(400, "Incorrectly Formatted Parameters", "Dropoff parameter is incorrectly formatted, format is latitude,longitude.", "/jeff"));

  //set passengers to 0 if it is not given or is formatted incorrectly.
  if (typeof passengers == 'undefined') {
    passengers = 0;
  }

  //set up parameters and request url
  parameter_pickup = "pickup=" + pickup;
  parameter_dropoff = "dropoff=" + dropoff;
  request_url = api_url+supplier_jeff+'?'+parameter_pickup+'&'+parameter_dropoff;

  //make request to the crafted url
  request(request_url, {timeout:2000}, function (error, response, body) {
    //if there is an error with the request (mainly timeouts), handle it
    if (error != null) {
      //if we have a timeout error
      if (error.code == 'ESOCKETTIMEDOUT') {
        //send time out error
        res.send(errorResponse(500, "Timed Out", "Jeff's API took longer than 2 seconds to respond", "/jeff"));

      } else {
        //send unknown error
        res.send(errorResponse(500, "Unknown", "An unknown error occured connecting to jeff's api", "/jeff"));

      }

    } else {

      body = JSON.parse(body); //parse the response

      if (response.statusCode == 400) {
        //send code 400 error
        res.send(errorResponse(400, body.error, body.message, "/jeff"));

      } else {

        if (response.statusCode == 500) {
          //send code 500 error
          res.send(errorResponse(500, body.error, body.message, "/jeff"));

        } else {
          //send options back
          body.options.sort(function(a,b) { return parseFloat(b.price) - parseFloat(a.price) } );
          body.options = body.options.filter(filter); //apply filter
          res.send(body.options);

        }
      }
    }
  });
});

function errorResponse(code, short_msg, long_msg, path) {
  //build error response json payload
  var resp = new Object();
  resp.status = code;
  resp.error = short_msg;
  resp.message = long_msg;
  resp.path = path;
  return JSON.stringify(resp);
}

function filter(entry) { //filter function for number of passengers
  if (passengers > 4) {
    //remove entries for <=4 passengers
    if (entry.car_type == "STANDARD") return false;
    if (entry.car_type == "EXECUTIVE") return false;
    if (entry.car_type == "LUXURY") return false;
  }
  if (passengers > 6) {
    //remove entries for <=6 passengers
    if (entry.car_type == "PEOPLE_CARRIER") return false;
    if (entry.car_type == "LUXURY_PEOPLE_CARRIER") return false;
  }
  if (passengers > 16) {
    //no entries can handle > 16 passengers
    return false;
  }
  return true;
}
