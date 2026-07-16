export type Role='ADMIN'|'DOCTOR'|'NURSE'|'RECEPTIONIST';
export interface User { id:string; firstName:string; lastName:string; email:string; role:Role; active:boolean }
export interface Patient { id:string; medicalRecordNumber:string; firstName:string; lastName:string; dateOfBirth:string; gender:string; phone?:string; email?:string; address?:string; emergencyContact?:string; allergies?:Allergy[]; records?:MedicalRecord[]; appointments?:Appointment[] }
export interface MedicalRecord { id:string; patientId:string; visitDate:string; chiefComplaint:string; diagnosis:string; notes:string; vitalSigns?:Record<string,unknown>; author:{firstName:string;lastName:string}; prescriptions?:Prescription[]; patient?:Pick<Patient,'id'|'firstName'|'lastName'|'medicalRecordNumber'> }
export interface Prescription { id:string; medication:string; dosage:string; frequency:string; duration:string; instructions?:string }
export interface Allergy { id:string; allergen:string; reaction?:string; severity:string }
export interface Appointment { id:string; patientId:string; clinicianId?:string; scheduledAt:string; durationMinutes:number; reason:string; status:string; notes?:string; patient:Pick<Patient,'id'|'firstName'|'lastName'|'medicalRecordNumber'>; clinician?:Pick<User,'firstName'|'lastName'> }

