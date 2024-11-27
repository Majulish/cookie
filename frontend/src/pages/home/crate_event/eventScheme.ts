// eventScheme.ts
import { z } from "zod";

const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

// Helper function to convert DD/MM/YYYY HH:mm to ISO string
const convertToISOString = (date: string, time: string): string => {
  const [day, month, year] = date.split('/').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};

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

//!!!!!!!!!!!!!!!!!!
// Function to convert API response to form format - change it to recieve the new interface
export const convertAPIEventToFormEvent = (apiEvent: RecievedEvent): MyEvent => {
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

// Interface for the form inputs (what user enters)
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
  event_name: string;
  event_description: string;
  start_datetime: string;  // ISO string
  end_datetime: string;    // ISO string
  location: string;
  jobs?: Record<string, number>;
}

export interface RecievedEvent{
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

 export interface MyEvent{
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
  try {
    const startDateTime = convertToISOString(data.start_date, data.start_time);
    const endDateTime = convertToISOString(data.end_date, data.end_time);
    
    // Validate that end is after start
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date and time must be after start date and time",
        path: ["end_date"]
      });
    }

    // Validate that start is in the future
    if (new Date(startDateTime) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date and time must be in the future",
        path: ["start_date"]
      });
    }
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid date/time format",
      path: ["start_date"]
    });
  }
});

// Function to convert form data to API payload
export const convertFormDataToAPIPayload = (formData: EventFormInputs): EventAPIPayload => {
  return {
    event_name: formData.event_name,
    event_description: formData.event_description,
    start_datetime: convertToISOString(formData.start_date, formData.start_time),
    end_datetime: convertToISOString(formData.end_date, formData.end_time),
    location: formData.location,
    jobs: formData.jobs
  };
};