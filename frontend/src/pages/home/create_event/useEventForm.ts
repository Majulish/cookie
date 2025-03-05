import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormInputs } from "./eventScheme";
import { generateDescription } from "../../../api/eventApi";

interface UseEventFormProps {
  onSubmit: (data: EventFormInputs) => Promise<boolean>;
  getJobsObject: () => Record<string, number>;
  resetJobs: () => void;
  mode: 'create' | 'edit';
}

export const useEventForm = ({ onSubmit, getJobsObject, resetJobs, mode }: UseEventFormProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const {
    control,
    setValue,
    getValues,
    formState: { errors },
    reset: resetForm,
    handleSubmit,
  } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      event_name: "",
      event_description: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      city: "",
      address: "",
    },
  });

  const resetAll = () => {
    resetForm();
    resetJobs();
    setPrompt("");
    setShowSuccessModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    resetAll();
  };

  const handleGenerateDescription = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt for the AI to generate a description.");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedDescription = await generateDescription(prompt);
      
      const cleanedDescription = generatedDescription
          .replace(/\n+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      setValue("event_description", cleanedDescription, {
        shouldValidate: true,
        shouldDirty: true,
      });

    } catch (err) {
      const error = err as Error;
      console.error("Error generating description:", error);
      alert("Failed to generate description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const processSubmit = async (data: EventFormInputs) => {
    const jobsObject = getJobsObject();
    
    const formDataWithJobs = {
      ...data,
      jobs: jobsObject,
    };
    
    try {
      const success = await onSubmit(formDataWithJobs);
      
      if (success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error submitting form:", error);
      alert(`Failed to ${mode === 'create' ? 'create' : 'update'} event. Please try again.`);
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(processSubmit),
    errors,
    prompt,
    setPrompt,
    isGenerating,
    handleGenerateDescription,
    reset: resetAll,
    showSuccessModal,
    handleCloseSuccessModal,
    setValue,
  };
};