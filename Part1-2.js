//use argparse to handle arguments
var ArgumentParser = require('argparse').ArgumentParser;
//setup an argument parser to parse the arguments to our application
var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'BookingGo Technical Test - '
});
//add pickup argument, required argument to specify the dropoff location
parser.addArgument(
  ['-p', '--pickup'],
  {
    help: 'REQUIRED Pickup location, specified in format " latitude,longitude "',
    required: true
  }
);
//add dropoff argument, required argument to specify the dropoff location
parser.addArgument(
  ['-d', '--dropoff'],
  {
    help: 'REQUIRED Dropoff location, specified in format "latitude,longitude"',
    required: true
  }
);
//add verbose option, we print out loads of stuff when verbose is enabled.
parser.addArgument(
  ['-verbose'],
  {
    help: 'Show detailed information',
    nargs: 0,
    action: 'storeTrue'
  }
);

var args = parser.parseArgs(); //parse arguments so we can reference them
if (args.verbose) { //print stuff if verbose is enabled
  console.log("Arguments Parsed");
}

var arg_format = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/; //regex formatting for latitude, longitude

//check arguments are in the correct format
//check pickup is in the correct format
if (!arg_format.test(args.pickup)) {
  console.error("'pickup' is not in correct format, use --help for help.")
  process.exit(1);
}
//check dropoff is in the correct format
if (!arg_format.test(args.dropoff)) {
  console.error("'dropoff' is not in correct format, use --help for help.")
  process.exit(1);
}

//use 'request' package in npm to perform our requests
var request = require('request');

//variables for requests, url, parameters etc.
//variables to hold the pickup and dropoff parameters
var pickup = args.pickup;
var dropoff = args.dropoff;
//url for apis
var api_url = "https://techtest.rideways.com/";
//supplier names
var supplier = ["dave", "eric", "jeff"];
//parameters for pickup and dropoff
var parameter_pickup = "pickup=" + pickup;
var parameter_dropoff = "dropoff=" + dropoff;
//request url to use when querying
var request_url = "";

var car_types = ['STANDARD','EXECUTIVE','LUXURY','PEOPLE_CARRIER','LUXURY_PEOPLE_CARRIER','MINIBUS'];

var responses = []; //hold the responses from our requests

var counter = 0; //counter for the number of responses received

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
      console.log(type+" - "+temp_supplier+" - "+temp_lowest_price); //print it out
    }
  });

}

function callback(options, supplier) { //callback to store the responses
  counter++; //increment a counter for each response
  responses.push(options); //push the response onto the array of responses
  if (counter == 3) { //when we have a response (or nothing) from all 3 suppliers
    processResponses(responses); //process the responses
  }
}

function doRequest(supplier_name, callback) {

  if (args.verbose) {
    console.log("Making request to " + supplier_name);
  }
  //create the request url
  request_url = api_url+supplier_name+'?'+parameter_pickup+'&'+parameter_dropoff;
  //make the request
  request(request_url, {timeout:2000}, function (error, response, body) {

    if (error != null) { //if there is an error

      if (error.code == 'ESOCKETTIMEDOUT') { //if the request times out
        console.error("Supplier took longer than 2 seconds to respond.");
      } else { //if some other unexpected error occurs
        console.error("Unknown error occured");
      }

      callback(null); //callback with a null so we know the request failed

    } else { //if there is no error

      if (args.verbose) { //if verbose print the return codevg
        console.log("Return Code: " + response.statusCode)
      }

      body = JSON.parse(body); //parse the body of the response

      if(response.statusCode == 400) { //if we get code 400 (client error)

        console.error("Error Code 400"); //print the error code
        if (args.verbose) { //if verbose, print out error details
          console.error("Error: " + body.error);
          console.error("Message: " + body.message);
        }

        callback(null); //callback with null so we know the request failed

      } else {

        if(response.statusCode == 500) { //if we get code 500 (server error)

          console.error("Error Code 500"); //print error code

          if (args.verbose) { //if verbose, print out error details
            console.error("Error: " + body.error);
            console.error("Message: " + body.message);
          }

          callback(null); //callback with null so we know the request failed

        } else {

          //if there are no errors then store the responses
          if (args.verbose) { //print the body of the response if verbose
            console.log("Adding body");
            console.log(body);
          }

          callback(body); //return the response using a callback

        }
      }
    }
  });
}

supplier.forEach(function(supplier_name) { //for each supplier, query their api
  doRequest(supplier_name, callback); //use the callback to process the responses
});
