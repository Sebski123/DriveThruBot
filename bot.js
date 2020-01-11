if (process.env.NODE_ENV != "test") {
    var Discord = require('discord.io');
    var auth = require('./auth.json');
}
var logger = require('winston');
var menu = require('./McD_Menu.json');
var menuParsed = require("jsonq")(menu);

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'info';

if (process.env.NODE_ENV != "test") {

    // Initialize Discord Bot
    var bot = new Discord.Client({
        token: auth.token,
        autorun: true
    });

    bot.on('ready', function (evt) {
        logger.info('Connected');
        logger.info('Logged in as: ');
        logger.info(bot.username + ' - (' + bot.id + ')');
    });

    bot.on('message', function (user, userID, channelID, message, evt) {
        message = message.toLowerCase()
        // Our bot needs to know if it will execute a command
        // It will listen for messages that will start with `!`
        if (message.substring(0, 1) == '!') {
            var args = message.substring(1).split(' ');
            var cmd = args[0];

            args = args.splice(1);
            switch (cmd) {
                // !ping
                case 'ping':
                    bot.sendMessage({
                        to: channelID,
                        message: 'Pong! '
                    });
                    break;

                case "order":
                    Order(user, userID, channelID, args)
                    break;
            }
        }
    });
}

let sizeConv = {
    "s": "small",
    "m": "medium",
    "l": "large"
}

function Order(user, userID, channelID, args) {
    //Initialize variables 
    let cost = 0;
    let ignored = []
    let val = ""
    let isMeal = false
    let size = ""

    // for each item in order
    for (let i of args) {
        val = ""
        isMeal = false
        size = ""


        //If last chars are ':m' (indicating meal), remove it and set flag
        if (i.slice(-2) == ":m") {
            isMeal = true
            i = i.slice(0, -2)
        }

        //If item has size (specified by '-s', '-m' or '-l') move it to variable
        if (i.slice(-2) == "-s" || i.slice(-2) == "-m" || i.slice(-2) == "-l") {
            size = i.slice(-1)
            i = i.slice(0, -2)
        }

        //Try to find item in menu
        let result = menuParsed.find(i)

        //If item was found in menu
        if (result.value().length) {


            //Filter meals
            for (let i of result.jsonQ_current) {
                if (!i.path.includes("meals")) {
                    if (!isMeal) {
                        val = menuParsed.pathValue(i.path)
                    }
                } else {
                    if (isMeal) {
                        val = menuParsed.pathValue(i.path)
                    }
                }
            }

            if (val == "" && isMeal) {
                logger.warn("Item \'" + i + "\' does not have a meal option")
                ignored.push("".concat(i, ":m"))
                val = 0
            }

            if (isNaN(val)) {
                if (val["small"] && val["medium"] && val["large"]) {
                    if (size) {
                        cost += val[sizeConv[size]]
                        continue
                    }
                }
                logger.debug("Your order of: " + val + " isn't valid")
                ignored.push(val)
                continue
            } else {
                if (Array.isArray(val)) {
                    cost += val[0]
                } else {
                    cost += val
                }
            }
            //If item wasn't found in menu, add item to ignored list
        } else {
            ignored.push(i)
        }
    }
    //Print final price and unknown items
    cost = parseFloat(cost.toPrecision(3))
    logger.info("Total value was: " + cost)
    logger.debug("Ignored: " + ignored)

    bot.sendMessage({
        to: channelID,
        message: "<@" + userID + "> Your order is ready\nThat will be $" + cost
    });

    return cost
}

module.exports = Order