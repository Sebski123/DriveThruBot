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

            case "pic":
                bot.uploadFile({
                    to: channelID,
                    message: "That will be " + 10 + "dkk",
                    file: "Images/Vester_Skerninge.jpg"
                });
                break;

            case "order":
                Order(user, args)
                break;

                // Just add any case commands if you want to..
        }
    }
});

function Order(user, args) {
    //Initialize variable 
    let cost = 0;
    let ignored = []

    // for each item in order
    for (let i of args) {
        let val = ""
        let result = menuParsed.find(i)

        if (result.value().length) {

            //Filter out meals
            for (let i of result.jsonQ_current) {
                if (!i.path.includes("meals")) {
                    val = menuParsed.pathValue(i.path)
                }
            }

            //logger.debug("Befor NaN check: " + val)

            if (isNaN(val)) {
                logger.debug(val + " is not a number")
                break
            } else {
                if (Array.isArray(val)) {
                    cost += val[0]
                } else {
                    cost += val
                }
            }
        } else {
            ignored.push(i)
        }
    }
    //Print final price and unknown items
    logger.info("Total value was: " + cost)
    logger.info("Ignored: " + ignored)
}