import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormInputs } from "./eventScheme";
import { generateDescription } from "../../../api/eventApi";

interface UseEventFormProps {
  onSubmit: (data: EventFormInputs) => void;
  getJobsObject: () => Record<string, number>;
  resetJobs: () => void;
}

export const useEventForm = ({ onSubmit, getJobsObject, resetJobs }: UseEventFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset: resetForm,
  } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
    },
  });

  const handleGenerateDescription = async () => {
    if (!prompt) {
      alert("Please enter a prompt for the AI to generate a description.");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedDescription = await generateDescription(prompt);
      setValue("event_description", generatedDescription);
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const processSubmit = (data: EventFormInputs) => {
    const formDataWithJobs = {
      ...data,
      jobs: getJobsObject(),
    };
    onSubmit(formDataWithJobs);
    resetForm();
    resetJobs();
    setPrompt("");
  };

  const reset = () => {
    resetForm();
    resetJobs();
    setPrompt("");
  };

  return {
    register,
    errors,
    prompt,
    setPrompt,
    isGenerating,
    handleGenerateDescription,
    reset,
    processSubmit,
    handleSubmit: handleSubmit(processSubmit),
  };
};