// Promisify to properly await reading the file
const fs = require('fs').promises;
const moment = require('moment');

// Default values for the time format 
const timeFormat = "HH:mm"
const dayEnd = moment("17:59", timeFormat);

/**
 * Function to parse and load the text file of appointments into a map
 * @returns {Map<String, Array>} - Mapping of days to the appointments for that day
 */
const loadAppointments = async () => {
    const filename = "input.txt";
    const appointments = (await fs.readFile(filename, "utf-8")).split('\r\n');

    let appointmentsMap = new Map();

    // load each appointment for each day into a map
    // map the day to the list of appointments
    appointments.forEach(appointment => {
        const day = appointment[0];
        const time = appointment.slice(2);

        if(!appointmentsMap.get(day)) {
            appointmentsMap.set(day, [time]);
        }
        else {
            appointmentsMap.get(day).push(time);
        }
    })
    return appointmentsMap;
}


/**
 * Take in a potential time slot and check if it is valid
 * @param {object} timeSlot - Object containing the start and end moments for the time slot to check 
 * @param {object} appointmentTime - Object containing the start and end moments for the appointment time
 * @returns {boolean} - True if it is a valid time
 */
const isOpenTimeSlot = (timeSlot, appointmentTime) => {
    return (timeSlot.start < appointmentTime.appointmentStart &&
            timeSlot.end < appointmentTime.appointmentStart)
            ||
            (timeSlot.start > appointmentTime.appointmentEnd &&
             timeSlot.end <= dayEnd); 
}

/**
 * Get the current appointment start/end as moment object
 * @param {string} appointmentTime - the raw appointment time as a string 
 * @returns {object} - Object containing start and end moment for the appointment
 */
const getAppointmentMoment = (appointmentTime) => {
    return {
        appointmentStart: moment(appointmentTime.substring(0, appointmentTime.indexOf('-')), timeFormat),
        appointmentEnd: moment(appointmentTime.substring(appointmentTime.indexOf('-')+1), timeFormat)
    }
}

/**
 * Takes in the day and list of appointments for that day
 * Determines if there is an open hour time slot for that day
 * @param {string} currentTimeBlock - the current time block
 * @param {Array[string]} appointments - list of appointments for that day
 * @returns {string | undefined} - timeslot string if there is a valid slot, otherwise undefined
 */
const isTimeBlockOpen = (day, appointments) => {
    // Base case - return the first hour of that day if no appointments exist
    if(!appointments || appointments.length === 0) {
        return `${day} 8:00-8:59`; 
    }

    // Start the with the first hour of the day
    let timeSlot = {
        start: moment("08:00", "HH:mm"),
        end: moment("08:59", "HH:mm")
    };

    // Default case - check if there is a timeslot before the first appointment
    const firstAppointment = getAppointmentMoment(appointments[0]);
    if(isOpenTimeSlot(timeSlot, firstAppointment)) {
        return `${day} 8:00-8:59`;
    }

    // update the next time slot
    timeSlot.start = firstAppointment.appointmentEnd.clone().add(1, 'minutes');
    timeSlot.end = firstAppointment.appointmentEnd.clone().add(1, 'hours');

    let counter = 1;
    let openingFound = false;
    let firstPass = true;

    while(!openingFound) {
        // If there are no more appointments, check if the next hour slot is not past the end of the day
        if(counter >= appointments.length-1 && (!firstPass || appointments.length === 1)) {

            const lastAppt = getAppointmentMoment(appointments[appointments.length-1]);
            timeSlot.start = lastAppt.appointmentEnd.clone().add(1, 'minutes');
            timeSlot.end = lastAppt.appointmentEnd.clone().add(1, 'hours');
    
            // If there is time after the last appointment for an hour slot, return that
            if(isOpenTimeSlot(timeSlot, getAppointmentMoment(appointments[appointments.length-1]))) {
                return `${day} ${timeSlot.start.format(timeFormat)}:${timeSlot.end.format(timeFormat)}`;
            }
            // If there is no time after the last appointment (i.e. too late, return undefined)
            return undefined;
        }
        const appointmentMoment = getAppointmentMoment(appointments[counter]);

        openingFound = isOpenTimeSlot(timeSlot, appointmentMoment);

        if(openingFound) {
            return `${day} ${timeSlot.start.format(timeFormat)}:${timeSlot.end.format(timeFormat)}`;
        }
        
        // Check for time between appointments if there is one following
        if(counter < appointments.length - 1) {
            const nextAppointment = getAppointmentMoment(appointments[counter+1]);
            timeSlot.start = appointmentMoment.appointmentEnd.clone().add(1, 'minutes');
            timeSlot.end = appointmentMoment.appointmentEnd.clone().add(1, 'hours');

            if(isOpenTimeSlot(timeSlot, nextAppointment)) {
                return `${day} ${timeSlot.start.format(timeFormat)}:${timeSlot.end.format(timeFormat)}`;
            }
        }
        
        // Increment the counter and falsify the first pass through variable
        counter++;
        firstPass = false;

        // update the next time slot
        timeSlot.start = appointmentMoment.appointmentEnd.clone().add(1, 'minutes');
        timeSlot.end = appointmentMoment.appointmentEnd.clone().add(1, 'hours');
    }

    return undefined;
}

/**
 * Function to loop until a valid appointment is found
 * @param {Map} appointments - the map of appointments to days 
 * @returns {string} - the timeslot string for the first open timeslot
 */
const findOpenSlot =(appointments) => {
    let day = 1;
    let validTimeBlock = '';
    while(!validTimeBlock) {
        validTimeBlock = isTimeBlockOpen(day, appointments.get(day.toString()));
        if(validTimeBlock !== undefined) {
            return validTimeBlock;
        }
        day++;
    }
}

/**
 * Function for starting point to run the application
 */
const start = async () => {
    const appointments = await loadAppointments();
    const openSlot = findOpenSlot(appointments);
    
    // Write the timeslot to a file
    fs.writeFile('timeslot.txt', openSlot);
}

start();