// SERVER INFO
const IPADDRESS = '192.168.5.1';
const HTTPS = 'http';
const PORT = '9876';
const FEEDBACK_SERVER_ENDPOINT = 'https://mieupro.pythonanywhere.com/feedback';

// FEEDBACK INTERVAL TIME
//const INITIAL_FEEDBACK_INTERVAL = 10800000;
//const ROUTINE_FEEDBACK_INTERVAL = 86400000;
const INTERVAL_BETWEEN_SENDING_FEEDBACK_DATA = 5000;

// POLLING INTERVAL FOR REST CALL
const HTTP_POLLING_INTERVAL = 4000;
const SPLASHSCREEN_VISIBLE_TIME = 3000;

// FEEDBACK INTERVAL TIME
const INITIAL_FEEDBACK_INTERVAL = 60000;
const ROUTINE_FEEDBACK_INTERVAL = 60000;

// ORDER POSITIVE STATUS CODE
const BEFORE_PLACING_ORDER = 0;
const PLEASE_WAIT = 1;
const ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE = 2;
const PLACE_THE_CUP = 3;
const DISPENSING = 4;
const ORDER_DISPENSED = 5;

// ORDER ERROR STATUS CODE
const SOMETHING_WENT_WRONG = 6;
const TIMEOUT_EXPIRED = 7;
const MACHINE_NOT_READY = 8;
const FOAMER_OFF = 9;
const RINSING = 10;
const MILK_NOT_READY = 11;

const orderStatus = {
  0: 'Order your Beverage',
  1: 'Please wait !',
  2: 'Order received\n  Please wait !',
  3: 'Please place the cup and\n         Press Dispense',
  4: 'Dispensing !',
  5: 'Beverage dispensed\nEnjoy your Beverage !',
  6: '     Something went wrong\nPlease check the connection',
  7: 'Timeout Expired',
  8: '     Machine is not ready\nPlease try after sometime',
  9: 'Please turn on the Foamer',
  10: 'Rinsing',
  11: '         Milk is not ready\nPlease try after sometime',
};
export {
  IPADDRESS,
  HTTPS,
  PORT,
  FEEDBACK_SERVER_ENDPOINT,
  BEFORE_PLACING_ORDER,
  PLEASE_WAIT,
  ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
  DISPENSING,
  PLACE_THE_CUP,
  ORDER_DISPENSED,
  SOMETHING_WENT_WRONG,
  TIMEOUT_EXPIRED,
  MACHINE_NOT_READY,
  FOAMER_OFF,
  RINSING,
  MILK_NOT_READY,
  INITIAL_FEEDBACK_INTERVAL,
  ROUTINE_FEEDBACK_INTERVAL,
  INTERVAL_BETWEEN_SENDING_FEEDBACK_DATA,
  HTTP_POLLING_INTERVAL,
  SPLASHSCREEN_VISIBLE_TIME,
  orderStatus,
};
