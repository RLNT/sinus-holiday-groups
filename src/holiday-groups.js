/*
    Author: RLNT
    Requested by: EinfachRobin
    License: GNU GPL v3.0
    Repository: https://github.com/RLNT/sinus-holiday-groups
    Resource-Page: https://forum.sinusbot.com/resources/holiday-groups/
    Discord: https://discord.com/invite/Q3qxws6
*/
registerPlugin(
    {
        name: 'Holiday Groups',
        version: '1.0.0',
        description: 'With this script, the bot will automatically assign servergroups on specific days.',
        author: 'RLNT',
        backends: ['ts3'],
        vars: [
            {
                name: 'required',
                title: 'All fields that are marked with (*) are required, fields with [*] are semi-required and all others are optional and have a default value.'
            },
            {
                name: 'configuration',
                title: 'A guide how to configure the script to your needs can be found here: https://github.com/RLNT/sinus-holiday-groups/blob/master/CONFIGURATION.md'
            },
            {
                name: 'spacer0',
                title: ''
            },
            {
                name: 'header0',
                title: '->>> General Options <<<-'
            },
            {
                name: 'dateInterval',
                title: 'Date-Interval > Define the time (in seconds) how often it should be checked if there is a new day! Lower amounts give the script more precision but take more performance.',
                type: 'number',
                placeholder: '60'
            },
            {
                name: 'blacklistedClients',
                title: 'Blacklisted-Clients > Define the list of client UIDs that are excluded from getting holiday groups!',
                type: 'strings'
            },
            {
                name: 'blacklistedGroups',
                title: 'Blacklisted-Groups > Define the list of group IDs that are excluded from getting holiday groups!',
                type: 'strings'
            },
            {
                name: 'spacer1',
                title: ''
            },
            {
                name: 'header1',
                title: '->>> Group Options <<<-'
            },
            {
                name: 'groups',
                title: 'Holiday Groups List',
                type: 'array',
                vars: [
                    {
                        name: 'ids',
                        title: 'IDs > Define the group IDs of the holiday groups! (*)',
                        indent: 2,
                        type: 'strings'
                    },
                    {
                        name: 'annually',
                        title: 'Annually > Do you want the holiday group(s) to be assigned annually or only once?',
                        indent: 2,
                        type: 'select',
                        options: ['Annually', 'Once']
                    },
                    {
                        name: 'day',
                        title: 'Day > Define the day of the month when the holiday group(s) should be assigned! (*)',
                        indent: 2,
                        type: 'number',
                        placeholder: '24'
                    },
                    {
                        name: 'month',
                        title: 'Month > Define the month when the holiday group(s) should be assigned! (*)',
                        indent: 2,
                        type: 'select',
                        options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                    },
                    {
                        name: 'year',
                        title: 'Year > Define the year when the holiday group(s) should be assigned! This option will be ignored if you chose it to be annually. (*)',
                        indent: 2,
                        type: 'number',
                        placeholder: '2021'
                    },
                    {
                        name: 'messageType',
                        title: 'Message-Type > How do you want to notify the client about the newly assigned Holiday Groups?',
                        indent: 2,
                        type: 'select',
                        options: ['Poke', 'Message', 'Disabled']
                    },
                    {
                        name: 'message',
                        title: 'Message > Define the message the client should get when the group(s) get(s) assigned! Keep in mind that poke messages can only be 100 characters long. [*]',
                        indent: 2,
                        type: 'multiline',
                        placeholder: 'Merry Christmas! Thanks for joining us today.'
                    }
                ]
            },
            {
                name: 'spacer2',
                title: ''
            },
            {
                name: 'header2',
                title: '->>> Dev Options <<<-'
            },
            {
                name: 'developer',
                title: "Don't change any of the following values if you have not been told to! This section is to identify problems faster and will drain performance."
            },
            {
                name: 'devEnabled',
                title: 'Do you want to enable the developer mode?',
                type: 'select',
                options: ['Yes', 'No']
            }
        ]
    },
    (_, scriptConfig) => {
        // DEPENDENCIES
        const engine = require('engine');
        const backend = require('backend');
        const event = require('event');

        // GLOBAL VARS
        let todayFull, todaySimple, todayAnnual;
        let groups = [];

        // CONFIG OPTIONS
        let config = {
            interval: scriptConfig.dateInterval || 60,
            blacklistedClients: scriptConfig.blacklistedClients || [],
            blacklistedGroups: scriptConfig.blacklistedGroups || [],
            groups: scriptConfig.groups,
            dev: scriptConfig.devEnabled == 0 || false
        };

        // FUNCTIONS
        /**
         * Send a message to the SinusBot instance log
         * @param {String} message > the message to send
         * @returns {void} > nothing
         */
        function log(message) {
            engine.log('Holiday-Groups > ' + message);
        }

        /**
         * Wait for the backend to be online/connected each given amount of time for a given amount of tries
         * @param {Number} attempts > the amount of tries the function should check for the backend to be online/connected
         * @param {Number} wait > the amount of time (in seconds) that should be waited between each try
         * @returns {Promise} > resolve when the backend is online/connected, reject when the backend was not online/connected in time
         */
        function waitForBackend(attempts, wait) {
            return new Promise((success, fail) => {
                let attempt = 1;
                const timer = setInterval(() => {
                    if (backend.isConnected()) {
                        clearInterval(timer);
                        if (config.dev) log('waitForBackend() took ' + attempt + ' attempts with a timer of ' + wait + ' seconds to resolve');
                        success();
                        return;
                    } else if (attempt > attempts) {
                        clearInterval(timer);
                        if (config.dev) log('waitForBackend() failed at ' + attempt + '. attempt with a timer of ' + wait + ' seconds');
                        fail('backend');
                        return;
                    }

                    attempt++;
                }, wait * 1000);
            });
        }

        /**
         * Check all holiday groups from the config if their entries are valid and if all IDs
         * reference valid objects on TeamSpeak;
         * Otherwise drop the whole config entry for the runtime
         * @returns {Array} > a list of all valid holiday group objects
         */
        function validateGroups() {
            const groups = [];
            let problemGroups = [];

            config.groups.forEach((group, index) => {
                // check if necessary config options are set
                if (!group.ids || !group.ids.length) return problemGroups.push(index);
                if (!group.day) return problemGroups.push(index);
                if (!group.month) return problemGroups.push(index);
                if (!group.annually || group.annually == 1) {
                    group.annually = false;
                } else {
                    group.annually = true;
                }
                if (!group.annually && !group.year) return problemGroups.push(index);

                // check if holiday group ids point to valid groups on teamspeak
                group.ids = group.ids.filter(id => backend.getServerGroupByID(id) !== undefined);
                if (!group.ids.length) return problemGroups.push(index);

                // use config entries to form a proper date
                if (!group.annually) {
                    group.date = `${group.year}-${parseInt(group.month) + 1}-${group.day}`;
                } else {
                    group.date = `2000-${parseInt(group.month) + 1}-${group.day}`;
                }

                // apply defaults to messages
                if (!group.messageType || group.messageType == 2) group.messageType = false;
                if (group.messageType && (!group.message || group.message === '')) return problemGroups.push(index);

                // if all error checks passed, mark it as valid
                groups.push(group);
            });

            // notify the script user that there are invalid groups in the configuration
            if (problemGroups.length)
                log(
                    "There was at least one entry in your configuration which is invalid! This can happen if a required field is empty or if your group IDs don't point to a valid group on your TeamSpeak server! Any invalid entries will be skipped. The entries with the following indexes are invalid: " +
                        problemGroups
                );

            return groups;
        }

        /**
         * Updates the global date storages with proper formatting
         * @returns {void} > nothing
         */
        function updateDate() {
            todayFull = new Date();
            todaySimple = `${todayFull.getFullYear()}-${todayFull.getMonth() + 1}-${todayFull.getDate()}`;
            todayAnnual = `2000-${todayFull.getMonth() + 1}-${todayFull.getDate()}`;
        }

        /**
         * Handles the whole process of checking a client on specific events
         * The function does blacklist checks, adds the client to the specific groups
         * and also notifies the client when groups were assigned to them.
         * @param {*} client > the client to process
         * @returns {void} > nothing
         */
        function processClient(client) {
            // skip if bot, blacklisted client or blacklisted group
            if (client.isSelf()) return;
            if (config.blacklistedClients.includes(client.uid())) return;
            const clientGroups = client.getServerGroups().map(group => group.id());
            if (clientGroups.some(group => config.blacklistedGroups.includes(group))) return;

            // check what groups need to be added on the current date
            let fittingEntries = [];
            groups.forEach(group => {
                if (group.annually) {
                    if (group.date === todayAnnual) return (fittingEntries = fittingEntries.concat(group));
                } else {
                    if (group.date === todaySimple) return (fittingEntries = fittingEntries.concat(group));
                }
            });

            // add groups to client and notify
            fittingEntries.forEach(entry => {
                let addedGroups = 0;
                entry.ids.forEach(id => {
                    if (!clientGroups.includes(id)) {
                        client.addToServerGroup(id);
                        addedGroups++;
                    }
                });

                if (!entry.messageType || !addedGroups) return;
                if (entry.messageType == 0) {
                    client.poke(entry.message);
                } else {
                    client.chat(entry.message);
                }
            });
        }

        // LOADING EVENT
        event.on('load', () => {
            // dev mode config dump
            if (config.dev) {
                console.log('Script-Config:', Object.entries(scriptConfig));
                console.log('Validated-Config:', Object.entries(config));
            }

            // error prevention that needs script deactivation
            if (!engine.version().includes('1.0.0')) {
                return log(
                    'This script is only compatible with SinusBot 1.0.0 and above! Please upgrade to the latest version. | Linux: https://forum.sinusbot.com/resources/internal-linux-beta.1/ | Windows: https://forum.sinusbot.com/resources/internal-windows-beta-64bit.150/'
                );
            } else if (engine.version().toLowerCase().includes('alpha')) {
                return log(
                    'This script is not compatible with the alpha version of the SinusBot! Please upgrade to the beta version. | Linux: https://forum.sinusbot.com/resources/internal-linux-beta.1/ | Windows: https://forum.sinusbot.com/resources/internal-windows-beta-64bit.150/'
                );
            } else if (!config.groups || !config.groups.length) {
                return log('There are no holiday groups configured! Deactivating script...');
            } else {
                // start the script
                waitForBackend(10, 3)
                    .then(() => {
                        log('The script has loaded successfully!');
                        main();
                    })
                    .catch(error => {
                        if (error === 'backend') {
                            log(
                                'The bot was not able to connect to the backend in time! To use this script, the bot needs to be connected to your TeamSpeak server. Make sure it can connect. Deactivating script...'
                            );
                        } else {
                            log('Unknown error occured! Please report this to the script author: https://discord.com/invite/Q3qxws6');
                            console.log(error);
                        }
                    });
            }
        });

        // MAIN FUNCTION
        function main() {
            // VARIABLES
            groups = validateGroups();
            const dates = groups.map(group => group.date);

            // exit the script if no valid holiday groups were found
            if (!groups.length) return log('There are no valid holiday groups set in your script configuration! There might be further output in the log. Deactivating script...');

            // validated groups config dump
            if (config.dev) console.log('groups:', Object.entries(groups));

            // get current date
            updateDate();

            // start interval to check for a new date
            setInterval(() => {
                const today = new Date();
                if (todaySimple !== `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`) updateDate();
            }, config.interval * 1000);

            // check if groups need to be assigned on start
            if (dates.includes(todaySimple) || dates.includes(todayAnnual)) {
                backend.getClients().forEach(client => {
                    processClient(client);
                });
            }

            /**
             * MOVE EVENT
             * fired when a client switches channels or joins/leaves the server
             */
            event.on('clientMove', event => {
                if (event.fromChannel !== undefined) return;

                if (dates.includes(todaySimple) || dates.includes(todayAnnual)) {
                    processClient(event.client);
                }
            });
        }
    }
);
