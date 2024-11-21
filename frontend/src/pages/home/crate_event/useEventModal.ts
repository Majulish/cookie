import { useState } from 'react';
import { EventFormInputs } from './eventScheme';

const availableJobs = [
  'waiter',
  'cook',
  'cashier',
  // Add more jobs here in the future
];

interface Job {
  job: string;
  amount: number;
}

const useEventModal = () => {
  const [jobList, setJobList] = useState<Job[]>([]);

  const handleAddJob = () => {
    if (jobList.some((job) => job.job === '')) {
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

  const handleJobChange = (index: number, key: 'job' | 'amount', value: string | number) => {
    setJobList((prev) => {
      if (key === 'job' && prev.some((job, i) => i !== index && job.job === value)) {
        alert("This job has already been added. Choose another job.");
        return prev;
      }

      return prev.map((job, i) =>
        i === index ? { ...job, [key]: key === 'amount' ? Number(value) : value } : job
      );
    });
  };

  const handleRemoveJob = (index: number) => {
    setJobList((prev) => prev.filter((_, i) => i !== index));
  };

  const getFormDataWithJobs = (data: EventFormInputs) => {
    const jobsObject = jobList.reduce((acc, { job, amount }) => {
      if (job) acc[job] = amount;
      return acc;
    }, {} as Record<string, number>);

    return { ...data, jobs: jobsObject };
  };

  const resetJobList = () => {
    setJobList([]);
  };

  return {
    jobList,
    handleAddJob,
    handleJobChange,
    handleRemoveJob,
    getFormDataWithJobs,
    resetJobList,
    availableJobs,
  };
};

export default useEventModal;
