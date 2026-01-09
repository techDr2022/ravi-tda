'use client';

import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionData {
  id: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string | null;
  doctorName: string;
  doctorQualification: string | null;
  clinicName: string;
  diagnosis: string | null;
  chiefComplaint: string | null;
  medicines: Medicine[];
  advice: string | null;
  followUpDate: Date | null;
  followUpNotes: string | null;
  appointmentDate: Date;
  createdAt: Date;
}

interface PrescriptionPrintProps {
  prescription: PrescriptionData;
}

export default function PrescriptionPrint({ prescription }: PrescriptionPrintProps) {
  useEffect(() => {
    // Auto-print when component mounts (optional - can be removed if you want manual print)
    // window.print();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Button - Hidden when printing */}
      <div className="no-print print-controls">
        <button
          onClick={handlePrint}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Prescription
        </button>
      </div>

      {/* Prescription Content */}
      <div className="prescription-container">
        {/* Header */}
        <div className="prescription-header">
          <div className="clinic-info">
            <h1 className="clinic-name">{prescription.clinicName}</h1>
            {prescription.doctorQualification && (
              <p className="clinic-address">{prescription.doctorQualification}</p>
            )}
          </div>
          <div className="prescription-title">
            <h2>PRESCRIPTION</h2>
          </div>
        </div>

        {/* Patient Info */}
        <div className="patient-info">
          <div className="info-row">
            <span className="label">Patient Name:</span>
            <span className="value">{prescription.patientName}</span>
          </div>
          <div className="info-row">
            <span className="label">Age:</span>
            <span className="value">
              {prescription.patientAge ? `${prescription.patientAge} years` : 'N/A'}
            </span>
            {prescription.patientGender && (
              <>
                <span className="label">Gender:</span>
                <span className="value">{prescription.patientGender}</span>
              </>
            )}
          </div>
          <div className="info-row">
            <span className="label">Date:</span>
            <span className="value">{format(prescription.appointmentDate, 'dd MMM yyyy')}</span>
          </div>
        </div>

        {/* Chief Complaint */}
        {prescription.chiefComplaint && (
          <div className="section">
            <h3 className="section-title">Chief Complaint:</h3>
            <p className="section-content">{prescription.chiefComplaint}</p>
          </div>
        )}

        {/* Diagnosis */}
        {prescription.diagnosis && (
          <div className="section">
            <h3 className="section-title">Diagnosis:</h3>
            <p className="section-content">{prescription.diagnosis}</p>
          </div>
        )}

        {/* Medicines */}
        <div className="section">
          <h3 className="section-title">Rx:</h3>
          <table className="medicines-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="medicine-name">{medicine.name}</td>
                  <td>{medicine.dosage}</td>
                  <td>{medicine.frequency}</td>
                  <td>{medicine.duration}</td>
                  <td>{medicine.instructions || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Advice */}
        {prescription.advice && (
          <div className="section">
            <h3 className="section-title">Advice:</h3>
            <p className="section-content">{prescription.advice}</p>
          </div>
        )}

        {/* Follow-up */}
        {prescription.followUpDate && (
          <div className="section">
            <h3 className="section-title">Follow-up:</h3>
            <p className="section-content">
              {format(prescription.followUpDate, 'dd MMM yyyy')}
              {prescription.followUpNotes && ` - ${prescription.followUpNotes}`}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="prescription-footer">
          <div className="doctor-signature">
            <div className="signature-line"></div>
            <p className="doctor-name">{prescription.doctorName}</p>
            {prescription.doctorQualification && (
              <p className="doctor-qual">{prescription.doctorQualification}</p>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Print-specific styles */
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .prescription-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
            font-size: 12pt;
            line-height: 1.5;
          }

          .prescription-header {
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }

          .clinic-name {
            font-size: 18pt;
            font-weight: bold;
            margin: 0 0 4px 0;
          }

          .prescription-title {
            text-align: center;
            margin-top: 10px;
          }

          .prescription-title h2 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0;
            letter-spacing: 2px;
          }

          .patient-info {
            margin-bottom: 20px;
          }

          .info-row {
            display: flex;
            gap: 8px;
            margin-bottom: 6px;
          }

          .info-row .label {
            font-weight: 600;
            min-width: 100px;
          }

          .info-row .value {
            flex: 1;
          }

          .section {
            margin-bottom: 18px;
          }

          .section-title {
            font-size: 13pt;
            font-weight: bold;
            margin: 0 0 8px 0;
            text-transform: uppercase;
          }

          .section-content {
            margin: 0;
            padding-left: 20px;
          }

          .medicines-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 11pt;
          }

          .medicines-table th {
            background-color: #f0f0f0;
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
          }

          .medicines-table td {
            border: 1px solid #000;
            padding: 8px;
            vertical-align: top;
          }

          .medicine-name {
            font-weight: 600;
          }

          .prescription-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
          }

          .doctor-signature {
            text-align: right;
            margin-top: 30px;
          }

          .signature-line {
            width: 200px;
            height: 1px;
            background: #000;
            margin: 0 0 40px auto;
          }

          .doctor-name {
            font-weight: bold;
            margin: 0;
            font-size: 12pt;
          }

          .doctor-qual {
            margin: 4px 0 0 0;
            font-size: 10pt;
          }

          /* Prevent page breaks inside sections */
          .section {
            page-break-inside: avoid;
          }

          .medicines-table tr {
            page-break-inside: avoid;
          }
        }

        /* Screen styles */
        @media screen {
          body {
            background: #f5f5f5;
            padding: 20px;
          }

          .prescription-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            color: #000;
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
          }

          .prescription-header {
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .clinic-info {
            flex: 1;
          }

          .clinic-name {
            font-size: 18pt;
            font-weight: bold;
            margin: 0 0 4px 0;
          }

          .clinic-address {
            font-size: 10pt;
            margin: 0;
            color: #333;
          }

          .prescription-title {
            text-align: center;
            flex: 1;
          }

          .prescription-title h2 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0;
            letter-spacing: 2px;
          }

          .patient-info {
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: auto 1fr auto 1fr;
            gap: 8px 16px;
            align-items: center;
          }

          .info-row {
            display: contents;
          }

          .info-row .label {
            font-weight: 600;
          }

          .info-row .value {
            flex: 1;
          }

          .section {
            margin-bottom: 18px;
          }

          .section-title {
            font-size: 13pt;
            font-weight: bold;
            margin: 0 0 8px 0;
            text-transform: uppercase;
          }

          .section-content {
            margin: 0;
            padding-left: 20px;
            white-space: pre-wrap;
          }

          .medicines-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 11pt;
          }

          .medicines-table th {
            background-color: #f0f0f0;
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
          }

          .medicines-table td {
            border: 1px solid #000;
            padding: 8px;
            vertical-align: top;
          }

          .medicine-name {
            font-weight: 600;
          }

          .prescription-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
          }

          .doctor-signature {
            text-align: right;
            margin-top: 30px;
          }

          .signature-line {
            width: 200px;
            height: 1px;
            background: #000;
            margin: 0 0 40px auto;
          }

          .doctor-name {
            font-weight: bold;
            margin: 0;
            font-size: 12pt;
          }

          .doctor-qual {
            margin: 4px 0 0 0;
            font-size: 10pt;
          }

          .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }
        }
      `}} />
    </>
  );
}
