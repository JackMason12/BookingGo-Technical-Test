#BookingGo-Technical-Test

##Setup

The application is build in node-js, using the argparse and request libraries.

The node project can be initialised through 'npm init', and the relevant libraries can be installed with 'npm install argparse' and 'npm install request'.


##Part1
###Dave's Taxis
The application can be run using the command 'node Part1.js' this command has the arguments:
-'-p'/'--pickup': The pickup location in the form latitude,longitude. (Required Argument)
-'-d'/'--dropoff': The dropoff location in the form latitude,longitude. (Required Argument)
-'-passengers': The number of passengers for this journey. Vehicle types with less capacity than this will be excluded.
-'-verbose': With this flag set the program will print additional information.
-'-h'/'--help': Print help information about the arguments given to the program.

Example:
'node Part1.js -p 20.0,20.0 -d 21.0,20.0 -passengers 4'

###Cheapest Option
The application can be run using the command 'node Part1-2.js' this command has similar arguments to the above:
-'-p'/'--pickup': The pickup location in the form latitude,longitude. (Required Argument)
-'-d'/'--dropoff': The dropoff location in the form latitude,longitude. (Required Argument)
-'-verbose': With this flag set the program will print additional information.
-'-h'/'--help': Print help information about the arguments given to the program.

Example:
'node Part1-2.js -p 20.0,20.0 -d 21.0,20.0'

##Part2
