
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, SurveyResponse } from '../data/types';

interface SurveyContextType {
  leadData: Partial<Lead>;
  setLeadData: React.Dispatch<React.SetStateAction<Partial<Lead>>>;
  responses: SurveyResponse;
  setResponses: React.Dispatch<React.SetStateAction<SurveyResponse>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  resetSurvey: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leadData, setLeadData] = useState<Partial<Lead>>({});
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetSurvey = () => {
    setLeadData({});
    setResponses({});
    setCurrentStep(0);
    setIsSubmitting(false);
  };

  return (
    <SurveyContext.Provider value={{
      leadData,
      setLeadData,
      responses,
      setResponses,
      currentStep,
      setCurrentStep,
      isSubmitting,
      setIsSubmitting,
      resetSurvey
    }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};
