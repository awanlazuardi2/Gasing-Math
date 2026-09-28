import React from 'react';
import { OperationType } from '../types';
import { LetsReadGasingHome, UserRole } from './LetsReadGasingHome';

export type { UserRole };

export interface OnboardingRoleHeroProps {
  onSelectRole: (role: UserRole) => void;
  onOpenCompetitionModal?: () => void;
  onSkip?: () => void;
  onStartPractice?: (operation?: OperationType, materialId?: string, resumeIndex?: number) => void;
  onStartPrintable?: (operation?: OperationType, materialId?: string) => void;
  onOpenPhilosophy?: () => void;
  onOpenSettings?: () => void;
  selectedRole?: UserRole | null;
}

export const OnboardingRoleHero: React.FC<OnboardingRoleHeroProps> = ({
  onSelectRole,
  onSkip,
  onStartPractice,
  onStartPrintable,
  onOpenPhilosophy,
  onOpenSettings,
  selectedRole
}) => {
  return (
    <div className="w-full min-h-screen bg-white" id="epic-onboarding-hero">
      <LetsReadGasingHome
        selectedRole={selectedRole}
        onSelectRole={onSelectRole}
        onStartPractice={(op, matId, resumeIndex) => {
          if (onStartPractice) {
            onStartPractice(op, matId, resumeIndex);
          } else {
            onSelectRole('student');
          }
        }}
        onStartPrintable={(op, matId) => {
          if (onStartPrintable) {
            onStartPrintable(op, matId);
          } else {
            onSelectRole('teacher');
          }
        }}
        onOpenPhilosophy={() => {
          if (onOpenPhilosophy) {
            onOpenPhilosophy();
          } else {
            onSelectRole('parent');
          }
        }}
        onOpenSettings={onOpenSettings}
        onCloseHome={onSkip}
      />
    </div>
  );
};

export default OnboardingRoleHero;
