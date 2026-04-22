import { FileUpload } from "./components/FileUpload";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { PatientInfo } from "./components/PatientInfo";
import { BiomarkerTable } from "./components/BiomarkerTable";
import { useUploadReport } from "./hooks/useUploadReport";
import { Activity } from "lucide-react";

function App() {
  const { state, upload, reset } = useUploadReport();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Lab Report Analyzer
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your lab report PDF to get instant analysis with biomarker
            classification based on optimal health ranges
          </p>
        </header>

        {state.status === "idle" && (
          <FileUpload onFileSelect={upload} isUploading={false} />
        )}

        {state.status === "uploading" && <LoadingState />}

        {state.status === "error" && (
          <ErrorState message={state.message} onRetry={reset} />
        )}

        {state.status === "success" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Analysis Results
              </h2>
              <button
                onClick={reset}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Upload New Report
              </button>
            </div>

            <PatientInfo patient={state.data.patient} />
            <BiomarkerTable data={state.data} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
