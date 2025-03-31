import { useState } from 'react';
import { assignWorkerToEvent } from '../../../api/eventApi';

interface ApprovedWorker {
  name: string;
  jobTitle: string;
}

interface SelectedWorker {
  id: number;
  name: string;
  jobTitle: string;
}

/**
 * Hook to manage worker actions such as approval, backup, and rating
 * @param {number | string | undefined} eventId - The event ID
 * @param {Function} refreshData - Function to refresh event data after actions
 * @returns Worker action states and handler functions
 */
const useWorkerActions = (
  eventId: number | string | undefined, 
  refreshData: () => Promise<void>
) => {
  const [approvalSuccess, setApprovalSuccess] = useState<boolean>(false);
  const [backupSuccess, setBackupSuccess] = useState<boolean>(false);
  const [approvedWorker, setApprovedWorker] = useState<ApprovedWorker>({
    name: '',
    jobTitle: ''
  });
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [selectedWorker, setSelectedWorker] = useState<SelectedWorker>({
    id: 0,
    name: '',
    jobTitle: ''
  });

  // Handle worker status changes (approve or backup)
  const handleWorkerStatusChange = async (
    workerId: number, 
    jobTitle: string, 
    workerName: string, 
    status: string
  ): Promise<void> => {
    try {
      if (!eventId) return;
      
      await assignWorkerToEvent({
        event_id: Number(eventId),
        worker_id: workerId,
        job_title: jobTitle,
        status: status
      });
      
      setApprovedWorker({
        name: workerName,
        jobTitle: jobTitle
      });
      
      // Show appropriate success modal based on status
      if (status === "APPROVED") {
        setApprovalSuccess(true);
      } else if (status === "BACKUP") {
        setBackupSuccess(true);
      }
      
      // Refresh event data after successful status change
      await refreshData();
    } catch (err) {
      console.error(`Error changing worker status to ${status}:`, err);
      // Error handling should be managed by the component using this hook
    }
  };
  
  // Modal control functions
  const handleCloseSuccessModal = (): void => {
    setApprovalSuccess(false);
  };

  const handleCloseBackupModal = (): void => {
    setBackupSuccess(false);
  };

  const handleOpenRatingModal = (workerId: number, workerName: string, jobTitle: string): void => {
    setSelectedWorker({
      id: workerId,
      name: workerName,
      jobTitle
    });
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = (): void => {
    setRatingModalOpen(false);
  };

  const handleRatingSuccess = async (): Promise<void> => {
    // Refresh event data after successful rating
    await refreshData();
  };

  return {
    // States
    approvalSuccess,
    backupSuccess,
    approvedWorker,
    ratingModalOpen,
    selectedWorker,
    
    // Event handlers
    handleWorkerStatusChange,
    handleCloseSuccessModal,
    handleCloseBackupModal,
    handleOpenRatingModal,
    handleCloseRatingModal,
    handleRatingSuccess
  };
};

export default useWorkerActions;