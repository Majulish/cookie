import { useState } from "react";

export const availableJobs = ["waiter", "cook", "cashier"];

export interface Job {
  job: string;
  amount: number;
}

export const useEventJobs = () => {
  const [jobList, setJobList] = useState<Job[]>([]);

  const setInitialJobs = (jobs: Job[]) => {
    setJobList(jobs);
  };

  const handleAddJob = () => {
    if (jobList.some((job) => job.job === "")) {
      alert("Please select a job type for the previous entry before adding another.");
      return;
    }

    setJobList((prev) => {
      const existingJobs = prev.map((job) => job.job);
      const availableJobsToAdd = availableJobs.filter(
        (job) => !existingJobs.includes(job)
      );
      if (availableJobsToAdd.length === 0) {
        alert("All jobs have been added. Remove an existing job to add it again.");
        return prev;
      }
      return [...prev, { job: availableJobsToAdd[0], amount: 1 }];
    });
  };

  const handleJobChange = (
    index: number,
    key: "job" | "amount",
    value: string | number
  ) => {
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

  const getJobsObject = () => {
    return jobList.reduce((acc, { job, amount }) => {
      if (job) acc[job] = amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const resetJobs = () => {
    setJobList([]);
  };

  return {
    jobList,
    handleAddJob,
    handleJobChange,
    handleRemoveJob,
    getJobsObject,
    resetJobs,
    availableJobs,
    setInitialJobs,
  };
};