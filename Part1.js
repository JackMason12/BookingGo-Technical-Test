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

parser.addArgument(
  ['-passengers'],
  {
    help: 'Specify the number of passengers for this journey',
    type: 'int',
    defaultValue: 0
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

//set up filtering function for our array of options so we can filter for a set number of passengers
if (args.verbose) {
  console.log("Passengers: " + args.passengers);
}
function filter(entry) {
  if (args.passengers > 4) {
    //remove entries for <=4 passengers
    if (entry.car_type == "STANDARD") return false;
    if (entry.car_type == "EXECUTIVE") return false;
    if (entry.car_type == "LUXURY") return false;
  }
  if (args.passengers > 6) {
    //remove entries for <=6 passengers
    if (entry.car_type == "PEOPLE_CARRIER") return false;
    if (entry.car_type == "LUXURY_PEOPLE_CARRIER") return false;
  }
  if (args.passengers > 16) {
    //no entries can handle > 16 passengers
    return false;
  }
  return true;
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
var supplier_dave = "dave";
var supplier_eric = "eric";
var supplier_jeff = "jeff";
//parameters for pickup and dropoff
var parameter_pickup = "pickup=" + pickup;
var parameter_dropoff = "dropoff=" + dropoff;
//request url to use when querying daves api
var request_url = api_url+supplier_dave+'?'+parameter_pickup+'&'+parameter_dropoff;

if (args.verbose) { //print stuff if verbose is enabled
  console.log("Making request");
}

//make our request
request(request_url, {timeout:2000}, function (error, response, body) {
  //if there is an error with the request (mainly timeouts), handle it
  if (error != null) {
    //if we have a timeout error, print some stuff out
    if (error.code == 'ESOCKETTIMEDOUT') {
      console.error("Supplier took longer than 2 seconds to respond.");
      console.error("Exiting.");
    }
    //unknown errors are not handled
    //exit on code 1 if we have an error
    process.exit(1);
  }

  if (args.verbose) { //print stuff if verbose is enabled
    //print return code and current status
    console.log("Return Code: " + response.statusCode);
    console.log("Parsing response");
  }

  body = JSON.parse(body); //parse the response

  if(response.statusCode == 400) { //if we get code 400 (client error)
    console.error("Error Code 400"); //print the error code
    if (args.verbose) { //if verbose, print out error details
      console.error("Error: " + body.error);
      console.error("Message: " + body.message);
    }
    process.exit(1); //exit the process
  }

  if(response.statusCode == 500) { //if we get code 500 (server error)
    console.error("Error Code 500"); //print error code
    if (args.verbose) { //if verbose, print out error details
      console.error("Error: " + body.error);
      console.error("Message: " + body.message);
    }
    process.exit(1); //exit the process
  }

  if (args.verbose) {
    console.log("Unfiltered Results:");
    body.options.forEach(function(entry) {
      console.log(entry.car_type + ' - ' + entry.price);
    });
  }

  //if there are no errors
  //sort the responses by their price (descending)
  body.options.sort(function(a,b) { return parseFloat(b.price) - parseFloat(a.price) } );
  body.options = body.options.filter(filter); //apply filter
  console.log("Filtered Results:"); //print out each of the responses
  body.options.forEach(function(entry) {
    console.log(entry.car_type + ' - ' + entry.price);
  });

});
