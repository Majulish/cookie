import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormInputs } from "./eventScheme";
import { generateDescription } from "../../../api/eventApi";

interface UseEventFormProps {
  onSubmit: (data: EventFormInputs) => Promise<boolean>;
  getJobsObject: () => Record<string, number>;
  resetJobs: () => void;
}

export const useEventForm = ({ onSubmit, getJobsObject, resetJobs }: UseEventFormProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset: resetForm,
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
      location: "",
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
      console.log('Generating description with prompt:', prompt);
      const generatedDescription = await generateDescription(prompt);
      
      // Clean up the generated description before setting it
      const cleanedDescription = generatedDescription
          // .replace(/\n+/g, ' ')
          // .replace(/\s+/g, ' ')
          // .trim();
          
      console.log('Original generated description:', generatedDescription);
      console.log('Cleaned generated description:', cleanedDescription);

      setValue("event_description", cleanedDescription, {
        shouldValidate: true,
        shouldDirty: true,
      });

      console.log('Form values after setting cleaned description:', getValues());

    } catch (err) {
      const error = err as Error;
      console.error("Error generating description:", {
        error,
        message: error.message || 'Unknown error occurred'
      });
      alert("Failed to generate description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const processSubmit = async (data: EventFormInputs) => {
    console.log('Starting form submission. Current prompt state:', prompt);
    console.log('Form data at submission:', data);
    console.log('Form data event_description:', {
      content: data.event_description,
      length: data.event_description?.length,
      type: typeof data.event_description
    });
    
    const jobsObject = getJobsObject();
    console.log('Jobs object:', jobsObject);
    
    const formDataWithJobs = {
      ...data,
      jobs: jobsObject,
    };

    console.log('Complete form data with jobs:', JSON.stringify(formDataWithJobs, null, 2));
    
    try {
      const success = await onSubmit(formDataWithJobs);
      console.log('Form submission result:', success);
      
      if (success) {
        console.log('Setting success modal to true');
        setShowSuccessModal(true);
      } else {
        console.log('Form submission returned false, not showing success modal');
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error submitting form:", {
        error,
        message: error.message || 'Unknown error occurred'
      });
      alert("Failed to create event. Please try again.");
    }
  };

  return {
    register,
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