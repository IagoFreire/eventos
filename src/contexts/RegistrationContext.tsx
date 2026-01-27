import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  event_id: string;
}

interface RegistrationContextType {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData | ((prev: RegistrationFormData) => RegistrationFormData)) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  registrationId: string | null;
  setRegistrationId: (id: string | null) => void;
  resetRegistration: () => void;
}

const initialFormData: RegistrationFormData = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  event_id: '',
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const resetRegistration = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setRegistrationId(null);
  };

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        setFormData,
        currentStep,
        setCurrentStep,
        registrationId,
        setRegistrationId,
        resetRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
