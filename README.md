**BookingGo-Technical-Test**

**Setup**

The applications are built in node-js, using the argparse, request and express libraries. The applications were coded on linux, so windows compatibility is unknown.

In order to run the programs, simple create a directory to hold the files, move them in and run the command 'npm install'. This will use the existing package.json to install the dependencies for the programs.

**Part1**

**Dave's Taxis**

Code: Part1.js

The application can be run using the command 'node Part1.js' this command has the arguments:

-'-p'/'--pickup': The pickup location in the form latitude,longitude. (Required Argument)

-'-d'/'--dropoff': The dropoff location in the form latitude,longitude. (Required Argument)

-'-passengers': The number of passengers for this journey. Vehicle types with less capacity than this will be excluded.

-'-verbose': With this flag set the program will print additional information.

-'-h'/'--help': Print help information about the arguments given to the program.

Example:
'node Part1.js -p 20.0,20.0 -d 21.0,20.0 -passengers 4'

**Cheapest Option**

Code: Part1-2.js

The application can be run using the command 'node Part1-2.js' this command has similar arguments to the above:

-'-p'/'--pickup': The pickup location in the form latitude,longitude. (Required Argument)

-'-d'/'--dropoff': The dropoff location in the form latitude,longitude. (Required Argument)

-'-verbose': With this flag set the program will print additional information.

-'-h'/'--help': Print help information about the arguments given to the program.

Example:
'node Part1-2.js -p 20.0,20.0 -d 21.0,20.0'

**Part2**

Code: server.js

The server is opened using the command 'node server.js' the command has no arguments. The server is opened on port 3000, and querying the api is done as follows:

Exercise 1 - Sorted API results from any of the suppliers: Navigate to localhost:3000/[supplier name] with the GET parameters pickup and dropoff, formatted in the same way as in command line arguments for the previous parts. It also has the optional parameter passengers to filter out options that cannot carry the amount of passengers.

Example: localhost:3000/dave?pickup=20.0,20.0&dropoff=20.0,21.0&passengers=5

Exercise 2 - Cheapest supplier for each vehicle: Navite to localhost:3000/cheapest with the GET parameters pickup and dropoff as above.

Example: localhost:3000/cheapest?pickup=20.0,20.0&dropoff=20.0,20.0
