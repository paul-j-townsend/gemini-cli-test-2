import { useState } from 'react';
import Layout from '../components/Layout';

export default function Calculators() {
  const [dogWeight, setDogWeight] = useState('');
  const [drugDose, setDrugDose] = useState('');
  const [patientWeight, setPatientWeight] = useState('');
  const [dehydrationPercent, setDehydrationPercent] = useState('');

  const calculateDrugDose = () => {
    const weight = parseFloat(dogWeight);
    const dose = parseFloat(drugDose);
    if (weight && dose) {
      return (weight * dose).toFixed(2);
    }
    return '';
  };

  const calculateFluidTherapy = () => {
    const weight = parseFloat(patientWeight);
    const dehydration = parseFloat(dehydrationPercent);
    if (weight && dehydration) {
      const maintenanceFluid = weight * 2; // 2ml/kg/hr maintenance
      const replacementFluid = (weight * 1000 * dehydration) / 100; // replacement over 24hrs
      const totalDaily = maintenanceFluid * 24 + replacementFluid;
      return {
        maintenance: maintenanceFluid.toFixed(1),
        replacement: replacementFluid.toFixed(0),
        totalDaily: totalDaily.toFixed(0)
      };
    }
    return null;
  };

  const fluidCalc = calculateFluidTherapy();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Veterinary Calculators</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Drug Dosage Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Drug Dosage Calculator</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={dogWeight}
                  onChange={(e) => setDogWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dose (mg/kg)
                </label>
                <input
                  type="number"
                  value={drugDose}
                  onChange={(e) => setDrugDose(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter dose in mg/kg"
                />
              </div>
              {calculateDrugDose() && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-blue-900">
                    Total Dose: {calculateDrugDose()} mg
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fluid Therapy Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fluid Therapy Calculator</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={patientWeight}
                  onChange={(e) => setPatientWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dehydration (%)
                </label>
                <input
                  type="number"
                  value={dehydrationPercent}
                  onChange={(e) => setDehydrationPercent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter dehydration percentage"
                />
              </div>
              {fluidCalc && (
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-green-900">
                    Maintenance: {fluidCalc.maintenance} ml/hr
                  </p>
                  <p className="text-sm font-medium text-green-900">
                    Replacement: {fluidCalc.replacement} ml over 24hrs
                  </p>
                  <p className="text-lg font-semibold text-green-900">
                    Total Daily: {fluidCalc.totalDaily} ml
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Body Condition Score Reference */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Body Condition Score Reference</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="font-medium">1-2: Underweight</span>
                <span className="text-red-600 text-sm">Ribs, spine visible</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="font-medium">3: Thin</span>
                <span className="text-yellow-600 text-sm">Ribs easily felt</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="font-medium">4-5: Ideal</span>
                <span className="text-green-600 text-sm">Ribs felt with pressure</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="font-medium">6-7: Overweight</span>
                <span className="text-orange-600 text-sm">Ribs hard to feel</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="font-medium">8-9: Obese</span>
                <span className="text-red-600 text-sm">Cannot feel ribs</span>
              </div>
            </div>
          </div>

          {/* Emergency Drug Doses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Drug Doses</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-900">Adrenaline (Cardiac Arrest)</h3>
                <p className="text-sm text-gray-600">0.01-0.02 mg/kg IV/IO</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">Atropine</h3>
                <p className="text-sm text-gray-600">0.02-0.04 mg/kg IV/IM</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-900">Diazepam (Seizures)</h3>
                <p className="text-sm text-gray-600">0.5-2 mg/kg IV/PR</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-medium text-gray-900">Furosemide</h3>
                <p className="text-sm text-gray-600">2-4 mg/kg IV/IM/SC</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Always verify doses and consult current protocols before administration
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 