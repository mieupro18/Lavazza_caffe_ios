// SERVER INFO
const IPADDRESS = '192.168.225.226';
const HTTPS = 'http';
const PORT = '9876';
const TOKEN = 'l@vA@zzacfd$';
const FEEDBACK_SERVER_ENDPOINT = 'https://mieupro.pythonanywhere.com/feedback';

// HTTPS STATUS CODE
const SUCCESS = 0;
const FAILURE = -1;

// OS types
const ANDROID = 'android';
const IOS = 'ios';

// FEEDBACK INTERVAL TIME in ms
//const INITIAL_FEEDBACK_INTERVAL = 86400000;
//const ROUTINE_FEEDBACK_INTERVAL = 604800000;
//const INTERVAL_BETWEEN_SENDING_FEEDBACK_DATA = 20000;

// POLLING INTERVAL FOR REST CALL in ms
const HTTP_POLLING_INTERVAL = 4000;
const SPLASHSCREEN_VISIBLE_TIME = 2000;

// Dispense timeout in sec
const timeoutForDispense = 30;

// FEEDBACK INTERVAL TIME in ms
const INITIAL_FEEDBACK_INTERVAL = 60000;
const ROUTINE_FEEDBACK_INTERVAL = 60000;
const INTERVAL_BETWEEN_SENDING_FEEDBACK_DATA = 5000;

// ORDER POSITIVE STATUS CODE
const BEFORE_PLACING_ORDER = 0;
const PLEASE_WAIT = 1;
const ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE = 2;
const WAITING_TO_DISPENSE = 3;
const DISPENSING = 4;
const ORDER_DISPENSED = 5;

// ORDER ERROR STATUS CODE
const SOMETHING_WENT_WRONG = 6;
const TIMEOUT_EXPIRED = 7;
const MACHINE_NOT_READY = 8;
const FOAMER_OFF = 9;
const RINSING = 10;
const MILK_NOT_READY = 11;
const MACHINE_DETAIL_MISMATCH = 12;

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

const productList = [
  {
    productId: 1,
    productName: 'Ristretto',
    src: require('../assets/Ristretto.jpg'),
  },
  {
    productId: 2,
    productName: 'Espresso',
    src: require('../assets/Espresso_or_Black_Coffee.jpg'),
  },
  {
    productId: 3,
    productName: 'Black Coffee',
    src: require('../assets/Espresso_or_Black_Coffee.jpg'),
  },
  {
    productId: 4,
    productName: 'South Indian Coffee Light',
    src: require('../assets/South_Indian_Coffee_Light_or_Filter_Coffee.jpg'),
  },
  {
    productId: 5,
    productName: 'South Indian Coffee Strong',
    src: require('../assets/South_Indian_Coffee_Strong.jpg'),
  },
  {
    productId: 6,
    productName: 'Caffe Latte',
    src: require('../assets/Caffe_Latte.jpg'),
  },
  {
    productId: 7,
    productName: 'Cappuccino',
    src: require('../assets/Cappuccino_or_Macchiato.jpg'),
  },
  {
    productId: 8,
    productName: 'Macchiato',
    src: require('../assets/Cappuccino_or_Macchiato.jpg'),
  },
  {
    productId: 9,
    productName: 'Tea Water',
    src: require('../assets/Tea_Water.jpg'),
  },
  {
    productId: 10,
    productName: 'Tea Milk',
    src: require('../assets/Tea_Milk.jpg'),
  },
  {
    productId: 11,
    productName: 'Green Tea',
    src: require('../assets/Green_Tea.jpg'),
  },
  {
    productId: 12,
    productName: 'Lemon Tea',
    src: require('../assets/Lemon_Tea.jpg'),
  },
  {
    productId: 13,
    productName: 'Hot Milk',
    src: require('../assets/Hot_Milk.jpg'),
  },
  {
    productId: 14,
    productName: 'Hot Water',
    src: require('../assets/Hot_Water.jpg'),
  },
  {
    productId: 15,
    productName: 'Black Tea',
    src: require('../assets/Black_Tea_or_Boiled_Tea.jpg'),
  },
  {
    productId: 16,
    productName: 'Horlicks',
    src: require('../assets/Horlicks.jpg'),
  },
  {
    productId: 17,
    productName: 'Hot Chocolate',
    src: require('../assets/Hot_Chocolate.jpg'),
  },
  {
    productId: 18,
    productName: 'Badam Milk',
    src: require('../assets/Badam_Milk.jpg'),
  },
  {
    productId: 19,
    productName: 'Filter Coffee',
    src: require('../assets/South_Indian_Coffee_Light_or_Filter_Coffee.jpg'),
  },
  {
    productId: 20,
    productName: 'Boiled Tea',
    src: require('../assets/Black_Tea_or_Boiled_Tea.jpg'),
  },
  {
    productId: 21,
    productName: 'Soup',
    src: require('../assets/Soup_or_Vegetable_Soup.jpg'),
  },
  {
    productId: 22,
    productName: 'Tomato Soup',
    src: require('../assets/Tomato_Soup.jpg'),
  },
  {
    productId: 23,
    productName: 'Vegetable Soup',
    src: require('../assets/Soup_or_Vegetable_Soup.jpg'),
  },
  {
    productId: 24,
    productName: 'Mug Smoodle',
    src: require('../assets/Cup_Noodles_or_Mug_Smoodle.jpg'),
  },
  {
    productId: 25,
    productName: 'Cup Noodles',
    src: require('../assets/Cup_Noodles_or_Mug_Smoodle.jpg'),
  },
  {
    productId: 26,
    productName: 'Corn Flakes',
    src: require('../assets/Corn_Flakes.jpg'),
  },
  {
    productId: 27,
    productName: 'Sugarless Cereals',
    src: require('../assets/Sugarless_Cereals.jpg'),
  },
  {
    productId: 28,
    productName: 'Steam',
    src: require('../assets/Steam.jpg'),
  },
];

export {
  IPADDRESS,
  HTTPS,
  PORT,
  TOKEN,
  FEEDBACK_SERVER_ENDPOINT,
  BEFORE_PLACING_ORDER,
  PLEASE_WAIT,
  ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
  DISPENSING,
  WAITING_TO_DISPENSE,
  ORDER_DISPENSED,
  SOMETHING_WENT_WRONG,
  TIMEOUT_EXPIRED,
  MACHINE_NOT_READY,
  FOAMER_OFF,
  RINSING,
  MILK_NOT_READY,
  MACHINE_DETAIL_MISMATCH,
  INITIAL_FEEDBACK_INTERVAL,
  ROUTINE_FEEDBACK_INTERVAL,
  INTERVAL_BETWEEN_SENDING_FEEDBACK_DATA,
  HTTP_POLLING_INTERVAL,
  SPLASHSCREEN_VISIBLE_TIME,
  orderStatus,
  productList,
  timeoutForDispense,
  ANDROID,
  IOS,
  SUCCESS,
  FAILURE,
};
