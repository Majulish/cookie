import { z } from "zod";

// Validate that start datetime is in the future
const isFutureDateTime = (startDateTime: Date) => {
  const currentDateTime = new Date();
  return startDateTime > currentDateTime;
};

// Validate that end datetime is after start datetime
const validateEventTimes = (startDateTime: Date, endDateTime: Date) => {
  return endDateTime > startDateTime;
};

export const eventSchema = z
  .object({
    event_name: z.string().min(4, "Event name must be at least 4 characters"),
    event_description: z.string().min(10, "Event description must be at least 10 characters"),
    start_date: z.date(), // Combined date and time
    end_date: z.date(),   // Combined date and time
    location: z.string().min(3, "Must enter a city"),
    jobs: z.record(z.string(), z.number().min(1, "Number of openings must be at least 1")),
  })
  .refine(
    (data) => isFutureDateTime(data.start_date),
    { message: "Start date and time must be in the future", path: ["start_date"] }
  )
  .refine(
    (data) => validateEventTimes(data.start_date, data.end_date),
    { message: "End date and time must be after the start date and time", path: ["end_date"] }
  );

export type EventFormInputs = z.infer<typeof eventSchema>;
