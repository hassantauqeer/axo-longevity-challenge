import { User, Calendar, Droplet } from "lucide-react";
import type { Patient } from "../types";

interface PatientInfoProps {
  patient: Patient;
}

export function PatientInfo({ patient }: PatientInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Patient Information
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Age</p>
            <p className="text-sm font-medium text-gray-900">
              {patient.age} years
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Sex</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {patient.sex}
            </p>
          </div>
        </div>
        {patient.bloodType && (
          <div className="flex items-center gap-3">
            <Droplet className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Blood Type</p>
              <p className="text-sm font-medium text-gray-900">
                {patient.bloodType}
                {patient.rhFactor}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-600" />
          <div>
            <p className="text-xs text-gray-500">Report Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(patient.reportDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
