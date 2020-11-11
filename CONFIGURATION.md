# **Configuration Guide**

> This guide will give you a detailed information how to configure the script to your needs.

---

<br>

<!-- Table of Contents -->
<details>
    <summary>
        Table of Contents (click to expand)
    </summary>

- [**Configuration Guide**](#configuration-guide)
  - [**How does the script operate?**](#how-does-the-script-operate)
  - [**General Options**](#general-options)
  - [**Group Options**](#group-options)
</details>


## **How does the script operate?**
A good start to configure a script is to understand its functionality. Here are a few small points which are important if you want to set everything up correctly.

1. Right when the bot starts with the script, it will automatically check if there are currently any needs to assign servergroups. That means that the bot will validate all clients when it joins so you don't have to worry that clients won't be counted in case the bot was offline or crashed.
2. Additionally, the bot listens to an event that detects when clients join. Each time a client joins, the bot checks if it's a relevant date and then decides if groups have to be assigned or not.
3. To make sure that the script is always up to date, it has an integrated interval which checks if the date changed and will refresh itself once it detected a change.
4. Clients and groups can be blacklisted from the whole script. They won't be counted at all.
5. You can also notify clients when they joined on a special date. That way, you can say stuff like `Merry Christmas!`


## **General Options**
The first section is all about the general options. You configure every basic aspect of the script here.

Please click the option you want to configure to get more information.

<details>
    <summary>
        Date-Interval
    </summary>

*Details*:
- optional option | default value: `60`
- enter the time in seconds

*Info*:
- defines the interval in which the script checks if the day changed
- lower amounts make the script more precise but also drain more performance
- if you set it to 5 minutes (300 seconds), it might be that groups are added 4-5 minutes after a new day started (worst case)
</details>
<details>
    <summary>
        Blacklisted-Clients
    </summary>

*Details*:
- optional option | default value: `none`
- enter the client UIDs

*Info*:
- defines if a client is ignored by the script
- this means the client also gets no notifications
</details>
<details>
    <summary>
        Blacklisted-Groups
    </summary>

*Details*:
- optional option | default value: `none`
- enter the group IDs

*Info*:
- defines if a group is ignored by the script
- this means the group also gets no notifications
</details>


## **Group Options**
The second and last section is all about the holiday groups. You can set individual settings for each group here.

Please click the option you want to configure to get more information.

<details>
    <summary>
        IDs
    </summary>

*Details*:
- required option | default value: `none`
- enter the group IDs

*Info*:
- you can also define multiple group IDs so you can more than one group on a specific date
- if you don't enter an ID of a group or the ID does not refer to a valid group, the corresponding holiday group will be skipped and not be processed
</details>
<details>
    <summary>
        Annually
    </summary>

*Details*:
- optional option | default value: `Once`
- select `Annually` or `Once`

*Info*:
- defines whether a specific date should be counted only once or every year (annually)
- if you select annually, it doesn't matter what year you choose
</details>
<details>
    <summary>
        Day
    </summary>

*Details*:
- required option | default value: `none`
- enter the day of the month

*Info*:
- defines the day of the month for the date
- if it's not possible to form a valid date, the whole section will be skipped
</details>
<details>
    <summary>
        Month
    </summary>

*Details*:
- required option | default value: `none`
- select the month

*Info*:
- defines the the month for the date
- if it's not possible to form a valid date, the whole section will be skipped
</details>
<details>
    <summary>
        Year
    </summary>

*Details*:
- required option | default value: `none`
- enter the year
- this option is only shown if you selected `Once` for the *Annually*

*Info*:
- defines the year for the date
- if it's not possible to form a valid date, the whole section will be skipped
</details>
<details>
    <summary>
        Message-Type
    </summary>

*Details*:
- optional option | default value: `Disabled`
- select `Poke`, `Message` or `Disabled`

*Info*:
- defines how a client should be notified if they were assigned to a group
- keep in mind that a poke message is limited to 100 characters
</details>
<details>
    <summary>
        Message
    </summary>

*Details*:
- semi-required option | default value: `Merry Christmas! Thanks for joining us today.`
- enter the message text
- available placeholders:
  - %name% - the name of the client who got the group(s)
  - %amount% - the amount of groups the client got on the specific date; if they already have one of the groups, it won't be counted towards that number
  - %lb% - a linebreak, same like pressing the *Enter-key* in a text file

*Info*:
- defines the text which is used in the notification for the client
- keep in mind that a poke message is limited to 100 characters
</details>

---

**You are done with the configuration now!**
