var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var menu = require('./McD_Menu.json');
var menuParsed = require("jsonq")(menu);

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';
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
                Order(user, args)
                break;
        }
    }
});

let sizeConv = {
    "s": "small",
    "m": "medium",
    "l": "large"
}

function Order(user, args) {
    //Initialize variables 
    let cost = 0;
    let ignored = []
    let val = ""
    let isMeal = false
    let size = ""

    for (let i of args){console.log(i)}

    // for each item in order
    for (let i of args) {
        val = ""
        isMeal = false
        size = ""

        logger.debug("Now testing: " + i)

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
                ignored.push("".concat(i,":m"))
                val = 0
            }

            //logger.debug("Befor NaN check: " + val)

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
    logger.info("Ignored: " + ignored)

    return cost
}