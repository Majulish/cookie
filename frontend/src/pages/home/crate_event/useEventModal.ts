import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { EventFormInputs } from "./eventScheme";

const availableJobs = [
  "waiter",
  "cook",
  "cashier",
];

interface Job {
  job: string;
  amount: number;
}

const useEventModal = (onSubmit: (data: EventFormInputs) => void) => {
  const [jobList, setJobList] = useState<Job[]>([]);
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(dayjs());
  const [endDateTime, setEndDateTime] = useState<Dayjs | null>(dayjs());

  const handleAddJob = () => {
    if (jobList.some((job) => job.job === "")) {
      alert("Please select a job type for the previous entry before adding another.");
      return;
    }

    setJobList((prev) => {
      const existingJobs = prev.map((job) => job.job);
      const availableJobsToAdd = availableJobs.filter((job) => !existingJobs.includes(job));
      if (availableJobsToAdd.length === 0) {
        alert("All jobs have been added. Remove an existing job to add it again.");
        return prev;
      }
      return [...prev, { job: availableJobsToAdd[0], amount: 1 }];
    });
  };

  const handleJobChange = (index: number, key: "job" | "amount", value: string | number) => {
    setJobList((prev) => {
      if (key === "job" && prev.some((job, i) => i !== index && job.job === value)) {
        alert("This job has already been added. Choose another job.");
        return prev;
      }

      return prev.map((job, i) =>
        i === index ? { ...job, [key]: key === "amount" ? Number(value) : value } : job
      );
    });
  };

  const handleRemoveJob = (index: number) => {
    setJobList((prev) => prev.filter((_, i) => i !== index));
  };

  const getFormDataWithJobs = (data: EventFormInputs): EventFormInputs => {
    const jobsObject = jobList.reduce((acc, { job, amount }) => {
      if (job) acc[job] = amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...data,
      start_date: startDateTime?.toDate() || new Date(),
      end_date: endDateTime?.toDate() || new Date(),
      jobs: jobsObject,
    };
  };

  const handleFormSubmit = (data: EventFormInputs) => {
    const formData = getFormDataWithJobs(data);
    onSubmit(formData);
    resetModalState();
  };

  const resetModalState = () => {
    setJobList([]);
    setStartDateTime(dayjs());
    setEndDateTime(dayjs());
  };

  return {
    jobList,
    handleAddJob,
    handleJobChange,
    handleRemoveJob,
    handleFormSubmit,
    resetModalState,
    setStartDateTime,
    setEndDateTime,
    startDateTime,
    endDateTime,
    availableJobs,
  };
};

export default useEventModal;
