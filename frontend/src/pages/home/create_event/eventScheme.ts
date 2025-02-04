import { z } from "zod";

const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

// Helper function to convert DD/MM/YYYY HH:mm to ISO string
const convertToISOString = (date: string, time: string): string => {
  const [day, month, year] = date.split('/').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  // Create date in local timezone
  const localDate = new Date(year, month - 1, day, hours, minutes);
  
  // Get the timezone offset in minutes
  const offset = localDate.getTimezoneOffset();
  
  // Adjust for timezone
  localDate.setMinutes(localDate.getMinutes() - offset);
  
  return localDate.toISOString();
};

// Helper function to convert ISO string to DD/MM/YYYY HH:mm
export const convertFromISOString = (isoString: string): {
  date: string;  // DD/MM/YYYY
  time: string;  // HH:mm
} => {
  const date = new Date(isoString);
  
  // Get date components
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  // Get time components
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`
  };
};

// Interface for the form inputs (what the user enters)
export interface EventFormInputs {
  event_name: string;
  event_description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string;
  jobs?: Record<string, number>;
}

// Interface for the API payload (what gets sent to backend)
export interface EventAPIPayload {
  name: string;
  description: string;
  start_datetime: string;  // ISO string
  end_datetime: string;    // ISO string
  location: string;
  jobs?: Record<string, number>;
}

//Interface for what being recieved from the backend
export interface RecievedEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  start_datetime: string;  // ISO string
  end_datetime: string;    // ISO string
  recruiter: string;
  status: string;
  jobs: {
    id: number;
    job_title: string;
    slots: number;
    openings: number;
  }[];
}

//Interface for the recived event from the backend, after conversion
export interface MyEventScheme {
  id: number;
  name: string;
  description: string;
  location: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  recruiter: string;
  status: string;
  jobs: {
    id: number;
    job_title: string;
    slots: number;
    openings: number;
  }[];
}

//Function to Convert RecievedEvent to MyEventScheme
export const convertRecivedEventToMyEvent = (apiEvent: RecievedEvent): MyEventScheme => {
  const startDateTime = convertFromISOString(apiEvent.start_datetime);
  const endDateTime = convertFromISOString(apiEvent.end_datetime);
  
  return {
    id: apiEvent.id,
    name: apiEvent.name,
    description: apiEvent.description,
    location: apiEvent.location,
    start_date: startDateTime.date,
    start_time: startDateTime.time,
    end_date: endDateTime.date,
    end_time: endDateTime.time,
    recruiter: apiEvent.recruiter,
    status: apiEvent.status,
    jobs: apiEvent.jobs
  };
};

//Z object for handeling errors in the form of the new event
export const eventSchema = z.object({
  event_name: z.string().min(4, "Event name must be at least 4 characters"),
  event_description: z.string().min(10, "Event description must be at least 10 characters"),
  start_date: z.string().regex(dateRegex, "Date must be in DD/MM/YYYY format"),
  start_time: z.string().regex(timeRegex, "Time must be in HH:mm format (24-hour)"),
  end_date: z.string().regex(dateRegex, "Date must be in DD/MM/YYYY format"),
  end_time: z.string().regex(timeRegex, "Time must be in HH:mm format (24-hour)"),
  location: z.string().min(3, "Must enter a city"),
  jobs: z.record(z.string(), z.number().min(1, "Number of openings must be at least 1")).optional(),
}).superRefine((data, ctx) => {
  // Only validate dates if all date/time fields are filled
  if (data.start_date && data.start_time && data.end_date && data.end_time) {
    try {
      const startDateTime = convertToISOString(data.start_date, data.start_time);
      const endDateTime = convertToISOString(data.end_date, data.end_time);
      const now = new Date();
      
      // Set time to start of current day for comparison
      now.setHours(0, 0, 0, 0);
      const startDate = new Date(startDateTime);
      startDate.setHours(0, 0, 0, 0);

      // Only validate if start date is in past
      if (startDate < now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date must be in the future",
          path: ["start_date"]
        });
      }

      // Only validate end date if start date is valid
      if (startDate >= now && new Date(endDateTime) <= new Date(startDateTime)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date and time must be after start date and time",
          path: ["end_date"]
        });
      }
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date/time format",
        path: ["start_date"]
      });
    }
  }
});

//Converts the event form to the format that should be sent to the backend
export const convertFormDataToAPIPayload = (formData: EventFormInputs): EventAPIPayload => {
  // Clean up the description by replacing newlines with spaces and trimming
  const cleanedDescription = formData.event_description
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const startDatetime = convertToISOString(formData.start_date, formData.start_time);
  const endDatetime = convertToISOString(formData.end_date, formData.end_time);
  
  // Only include the fields that the API expects
  const payload: EventAPIPayload = {
    name: formData.event_name,
    description: cleanedDescription,
    start_datetime: startDatetime,
    end_datetime: endDatetime,
    location: formData.location,
  };

  // Only add jobs if they exist
  if (formData.jobs && Object.keys(formData.jobs).length > 0) {
    payload.jobs = formData.jobs;
  }
  
  return payload;
};