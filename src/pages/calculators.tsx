import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Calculators() {
  const [dogWeight, setDogWeight] = useState('');
  const [drugDose, setDrugDose] = useState('');
  const [patientWeight, setPatientWeight] = useState('');
  const [dehydrationPercent, setDehydrationPercent] = useState('');

  const [chocolateWeight, setChocolateWeight] = useState('');
  const [chocolateAmount, setChocolateAmount] = useState('');
  const [chocolateType, setChocolateType] = useState('milk');
  const [bsaWeight, setBsaWeight] = useState('');
  const [anesthesiaWeight, setAnesthesiaWeight] = useState('');
  const [anesthesiaSpecies, setAnesthesiaSpecies] = useState('canine');
  const [calorieWeight, setCalorieWeight] = useState('');
  const [calorieSpecies, setCalorieSpecies] = useState('canine');
  const [calorieLifeStage, setCalorieLifeStage] = useState('adult');
  const [currentPCV, setCurrentPCV] = useState('');
  const [targetPCV, setTargetPCV] = useState('');
  const [transfusionWeight, setTransfusionWeight] = useState('');
  const [criWeight, setCriWeight] = useState('');
  const [criDrugAmount, setCriDrugAmount] = useState('');
  const [criFluidRate, setCriFluidRate] = useState('');
  const [criDesiredRate, setCriDesiredRate] = useState('');
  const [convertValue, setConvertValue] = useState('');
  const [convertFrom, setConvertFrom] = useState('kg');
  const [convertTo, setConvertTo] = useState('lbs');
  const [convertCategory, setConvertCategory] = useState('weight');

  const chocolateData = {
    white: { theobromine: 0.009, caffeine: 0.03 }, // mg per gram
    milk: { theobromine: 1.6, caffeine: 0.2 },     // mg per gram
    dark: { theobromine: 4.6, caffeine: 0.9 },     // mg per gram
    baking: { theobromine: 13.9, caffeine: 1.7 }   // mg per gram
  };

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

  const calculateChocolateToxicity = () => {
    const weight = parseFloat(chocolateWeight);
    const amount = parseFloat(chocolateAmount);
    const chocolate = chocolateData[chocolateType];
    
    if (weight && amount && chocolate) {
      const theobromineDose = (amount * chocolate.theobromine) / weight;
      const caffeineDose = (amount * chocolate.caffeine) / weight;
      const totalMethylxanthines = theobromineDose + caffeineDose;
      
      let severity = '';
      let recommendation = '';
      
      if (totalMethylxanthines < 20) {
        severity = 'Minimal Risk';
        recommendation = 'Monitor for symptoms. Treatment usually not necessary.';
      } else if (totalMethylxanthines < 40) {
        severity = 'Mild Toxicity';
        recommendation = 'Monitor closely. Induce vomiting if recent ingestion.';
      } else if (totalMethylxanthines < 60) {
        severity = 'Moderate Toxicity';
        recommendation = 'Emergency treatment advised. Cardiac monitoring needed.';
      } else {
        severity = 'Severe Toxicity';
        recommendation = 'EMERGENCY! Immediate treatment required. Neurological signs possible.';
      }
      
      return {
        theobromine: theobromineDose.toFixed(1),
        caffeine: caffeineDose.toFixed(1),
        total: totalMethylxanthines.toFixed(1),
        severity,
        recommendation
      };
    }
    return null;
  };

  const calculateBodySurfaceArea = () => {
    const weight = parseFloat(bsaWeight);
    if (weight) {
      // BSA = (weight in kg)^0.67 × 10.1 for dogs, × 10.0 for cats
      const bsa = Math.pow(weight, 0.67) * 10.1;
      return bsa.toFixed(2);
    }
    return '';
  };

  const calculateAnesthesiaGasFlow = () => {
    const weight = parseFloat(anesthesiaWeight);
    if (weight) {
      const tidalVolume = weight * 10; // 10ml/kg
      const minuteVolume = tidalVolume * (anesthesiaSpecies === 'canine' ? 12 : 18); // RR
      const gasFlow = minuteVolume * 3; // 3x minute volume for fresh gas flow
      
      return {
        tidalVolume: tidalVolume.toFixed(0),
        minuteVolume: minuteVolume.toFixed(0),
        gasFlow: gasFlow.toFixed(0),
        bagSize: weight < 7 ? '1L' : weight < 15 ? '2L' : weight < 30 ? '3L' : '5L',
        etTube: getETTubeSize(weight, anesthesiaSpecies)
      };
    }
    return null;
  };

  const getETTubeSize = (weight, species) => {
    if (species === 'feline') {
      if (weight < 2) return '3.0mm';
      if (weight < 3.5) return '3.5mm';
      if (weight < 5) return '4.0mm';
      return '4.5mm';
    } else {
      if (weight < 3) return '5.0mm';
      if (weight < 4) return '5.5mm';
      if (weight < 5) return '6.0mm';
      if (weight < 7) return '6.5mm';
      if (weight < 9) return '7.0mm';
      if (weight < 11) return '7.5mm';
      if (weight < 13) return '8.0mm';
      if (weight < 15) return '8.5mm';
      if (weight < 17) return '9.0mm';
      if (weight < 19) return '9.5mm';
      if (weight < 22) return '10.0mm';
      if (weight < 28) return '11.0mm';
      if (weight < 35) return '12.0mm';
      return '14.0mm';
    }
  };

  const calculateCalorieRequirements = () => {
    const weight = parseFloat(calorieWeight);
    if (weight) {
      let rer = 70 * Math.pow(weight, 0.75); // Resting Energy Requirement
      let multiplier = 1;
      
      // Adjust multiplier based on life stage and species
      if (calorieSpecies === 'canine') {
        switch (calorieLifeStage) {
          case 'puppy': multiplier = 2.0; break;
          case 'adult': multiplier = 1.6; break;
          case 'senior': multiplier = 1.4; break;
          case 'overweight': multiplier = 1.2; break;
          case 'pregnant': multiplier = 1.8; break;
          case 'lactating': multiplier = 3.0; break;
        }
      } else {
        switch (calorieLifeStage) {
          case 'kitten': multiplier = 2.5; break;
          case 'adult': multiplier = 1.4; break;
          case 'senior': multiplier = 1.2; break;
          case 'overweight': multiplier = 1.0; break;
          case 'pregnant': multiplier = 1.6; break;
          case 'lactating': multiplier = 2.5; break;
        }
      }
      
      const der = rer * multiplier; // Daily Energy Requirement
      
      return {
        rer: rer.toFixed(0),
        der: der.toFixed(0),
        multiplier: multiplier
      };
    }
    return null;
  };

  const calculateBloodTransfusion = () => {
    const weight = parseFloat(transfusionWeight);
    const current = parseFloat(currentPCV);
    const target = parseFloat(targetPCV);
    
    if (weight && current && target && target > current) {
      // Volume (ml) = weight (kg) × 90 ml/kg × (target PCV - current PCV) / donor PCV
      // Assuming donor PCV of 40%
      const donorPCV = 40;
      const volume = (weight * 90 * (target - current)) / donorPCV;
      
      return {
        volume: volume.toFixed(0),
        rate: (volume / 4).toFixed(0) // Over 4 hours
      };
    }
    return null;
  };

  const calculateCRI = () => {
    const weight = parseFloat(criWeight);
    const drugAmount = parseFloat(criDrugAmount);
    const fluidRate = parseFloat(criFluidRate);
    const desiredRate = parseFloat(criDesiredRate);
    
    if (weight && drugAmount && fluidRate && desiredRate) {
      // CRI calculation: (desired dose × weight × fluid rate) / drug concentration
      const drugToAdd = (desiredRate * weight * fluidRate) / drugAmount;
      
      return {
        drugToAdd: drugToAdd.toFixed(2),
        totalVolume: fluidRate.toFixed(0)
      };
    }
    return null;
  };

  const unitCategories = {
    weight: {
      units: ['kg', 'g', 'mg', 'lbs', 'oz'],
      conversions: {
        'kg-g': (v) => v * 1000,
        'g-kg': (v) => v / 1000,
        'kg-mg': (v) => v * 1000000,
        'mg-kg': (v) => v / 1000000,
        'g-mg': (v) => v * 1000,
        'mg-g': (v) => v / 1000,
        'kg-lbs': (v) => v * 2.20462,
        'lbs-kg': (v) => v / 2.20462,
        'g-oz': (v) => v * 0.035274,
        'oz-g': (v) => v / 0.035274,
        'lbs-oz': (v) => v * 16,
        'oz-lbs': (v) => v / 16
      }
    },
    volume: {
      units: ['ml', 'L', 'fl oz', 'gal'],
      conversions: {
        'ml-L': (v) => v / 1000,
        'L-ml': (v) => v * 1000,
        'ml-fl oz': (v) => v * 0.033814,
        'fl oz-ml': (v) => v / 0.033814,
        'L-gal': (v) => v * 0.264172,
        'gal-L': (v) => v / 0.264172
      }
    },
    temperature: {
      units: ['°C', '°F'],
      conversions: {
        '°C-°F': (v) => (v * 9/5) + 32,
        '°F-°C': (v) => (v - 32) * 5/9
      }
    }
  };

  const convertUnits = () => {
    const value = parseFloat(convertValue);
    if (value && convertFrom !== convertTo) {
      const category = unitCategories[convertCategory];
      const conversionKey = `${convertFrom}-${convertTo}`;
      const conversionFunc = category.conversions[conversionKey];
      
      if (conversionFunc) {
        return conversionFunc(value).toFixed(4).replace(/\.?0+$/, '');
      }
    }
    return '';
  };

  const handleCategoryChange = (newCategory) => {
    setConvertCategory(newCategory);
    const units = unitCategories[newCategory].units;
    setConvertFrom(units[0]);
    setConvertTo(units[1]);
  };

  const fluidCalc = calculateFluidTherapy();
  const chocolateTox = calculateChocolateToxicity();
  const anesthesiaCalc = calculateAnesthesiaGasFlow();
  const calorieCalc = calculateCalorieRequirements();
  const transfusionCalc = calculateBloodTransfusion();
  const criCalc = calculateCRI();

  return (
    <Layout>
      <Head>
        <title>UK Veterinary Calculators - Vet Sidekick</title>
        <meta name="description" content="Comprehensive UK veterinary calculators for drug dosages, fluid therapy, toxicity assessments, anaesthesia, nutrition and emergency medicine. Designed for UK veterinary practice." />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UK Veterinary Calculators</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Essential calculators for UK veterinary professionals covering drug dosing, emergency toxicity assessments, 
            anaesthesia planning, nutritional requirements and clinical procedures. Designed for use in UK veterinary practice.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Drug Dosage Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">💉</span>
              Drug Dosage Calculator
            </h2>
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

          {/* Chocolate Toxicity Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">⚠️</span>
              Chocolate Toxicity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={chocolateWeight}
                  onChange={(e) => setChocolateWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chocolate Type
                </label>
                <select
                  value={chocolateType}
                  onChange={(e) => setChocolateType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="white">White Chocolate</option>
                  <option value="milk">Milk Chocolate</option>
                  <option value="dark">Dark Chocolate</option>
                  <option value="baking">Baking Chocolate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Ingested (g)
                </label>
                <input
                  type="number"
                  value={chocolateAmount}
                  onChange={(e) => setChocolateAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter amount in grams"
                />
              </div>
              {chocolateTox && (
                <div className={`p-4 rounded-lg ${
                  chocolateTox.severity === 'Minimal Risk' ? 'bg-green-50' :
                  chocolateTox.severity === 'Mild Toxicity' ? 'bg-yellow-50' :
                  chocolateTox.severity === 'Moderate Toxicity' ? 'bg-orange-50' :
                  'bg-red-50'
                }`}>
                  <p className={`font-semibold mb-2 ${
                    chocolateTox.severity === 'Minimal Risk' ? 'text-green-900' :
                    chocolateTox.severity === 'Mild Toxicity' ? 'text-yellow-900' :
                    chocolateTox.severity === 'Moderate Toxicity' ? 'text-orange-900' :
                    'text-red-900'
                  }`}>
                    {chocolateTox.severity}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Total Methylxanthines: {chocolateTox.total} mg/kg
                  </p>
                  <p className="text-sm text-gray-600">
                    {chocolateTox.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Body Surface Area Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">📏</span>
              Body Surface Area
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={bsaWeight}
                  onChange={(e) => setBsaWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              {calculateBodySurfaceArea() && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-purple-900">
                    BSA: {calculateBodySurfaceArea()} cm²
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Used for chemotherapy and some drug dosing
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fluid Therapy Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🩹</span>
              Fluid Therapy Calculator
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={patientWeight}
                  onChange={(e) => setPatientWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

          {/* Anaesthesia Gas Flow Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🫁</span>
              Anaesthesia Calculator
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={anesthesiaWeight}
                  onChange={(e) => setAnesthesiaWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species
                </label>
                <select
                  value={anesthesiaSpecies}
                  onChange={(e) => setAnesthesiaSpecies(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="canine">Canine</option>
                  <option value="feline">Feline</option>
                </select>
              </div>
              {anesthesiaCalc && (
                <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-indigo-900">
                    Tidal Volume: {anesthesiaCalc.tidalVolume} ml
                  </p>
                  <p className="text-sm font-medium text-indigo-900">
                    Gas Flow: {anesthesiaCalc.gasFlow} ml/min
                  </p>
                  <p className="text-sm font-medium text-indigo-900">
                    ET Tube: {anesthesiaCalc.etTube}
                  </p>
                  <p className="text-sm font-medium text-indigo-900">
                    Bag Size: {anesthesiaCalc.bagSize}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Calorie Requirements Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🥘</span>
              Calorie Requirements
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={calorieWeight}
                  onChange={(e) => setCalorieWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species
                </label>
                <select
                  value={calorieSpecies}
                  onChange={(e) => setCalorieSpecies(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="canine">Canine</option>
                  <option value="feline">Feline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Life Stage
                </label>
                <select
                  value={calorieLifeStage}
                  onChange={(e) => setCalorieLifeStage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={calorieSpecies === 'canine' ? 'puppy' : 'kitten'}>
                    {calorieSpecies === 'canine' ? 'Puppy' : 'Kitten'}
                  </option>
                  <option value="adult">Adult</option>
                  <option value="senior">Senior</option>
                  <option value="overweight">Overweight</option>
                  <option value="pregnant">Pregnant</option>
                  <option value="lactating">Lactating</option>
                </select>
              </div>
              {calorieCalc && (
                <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-orange-900">
                    RER: {calorieCalc.rer} kcal/day
                  </p>
                  <p className="text-lg font-semibold text-orange-900">
                    DER: {calorieCalc.der} kcal/day
                  </p>
                  <p className="text-xs text-orange-700">
                    Multiplier: {calorieCalc.multiplier}x
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Blood Transfusion Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🔴</span>
              Blood Transfusion
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={transfusionWeight}
                  onChange={(e) => setTransfusionWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current PCV (%)
                </label>
                <input
                  type="number"
                  value={currentPCV}
                  onChange={(e) => setCurrentPCV(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Current PCV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target PCV (%)
                </label>
                <input
                  type="number"
                  value={targetPCV}
                  onChange={(e) => setTargetPCV(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Target PCV"
                />
              </div>
              {transfusionCalc && (
                <div className="bg-red-50 p-4 rounded-lg space-y-2">
                  <p className="text-lg font-semibold text-red-900">
                    Volume Needed: {transfusionCalc.volume} ml
                  </p>
                  <p className="text-sm font-medium text-red-900">
                    Rate: {transfusionCalc.rate} ml/hr (over 4 hours)
                  </p>
                  <p className="text-xs text-red-700">
                    Assumes donor PCV of 40%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CRI Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🧪</span>
              CRI Calculator
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={criWeight}
                  onChange={(e) => setCriWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter weight in kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drug Concentration (mg/ml)
                </label>
                <input
                  type="number"
                  value={criDrugAmount}
                  onChange={(e) => setCriDrugAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Drug concentration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fluid Rate (ml/hr)
                </label>
                <input
                  type="number"
                  value={criFluidRate}
                  onChange={(e) => setCriFluidRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Fluid rate ml/hr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Rate (mg/kg/hr)
                </label>
                <input
                  type="number"
                  value={criDesiredRate}
                  onChange={(e) => setCriDesiredRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Desired dose rate"
                />
              </div>
              {criCalc && (
                <div className="bg-teal-50 p-4 rounded-lg space-y-2">
                  <p className="text-lg font-semibold text-teal-900">
                    Add {criCalc.drugToAdd} ml to bag
                  </p>
                  <p className="text-sm font-medium text-teal-900">
                    Run at {criCalc.totalVolume} ml/hr
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Unit Conversion Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">⚖️</span>
              Unit Converter
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Category
                </label>
                <select
                  value={convertCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="weight">Weight</option>
                  <option value="volume">Volume</option>
                  <option value="temperature">Temperature</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value to Convert
                </label>
                <input
                  type="number"
                  value={convertValue}
                  onChange={(e) => setConvertValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter value"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <select
                    value={convertFrom}
                    onChange={(e) => setConvertFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {unitCategories[convertCategory].units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <select
                    value={convertTo}
                    onChange={(e) => setConvertTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {unitCategories[convertCategory].units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              {convertUnits() && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    Result: {convertUnits()} {convertTo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Body Condition Score Reference */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🐕</span>
              Body Condition Score
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-900">1-2: Underweight</span>
                <span className="text-red-600 text-sm">Ribs, spine visible</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-900">3: Thin</span>
                <span className="text-yellow-600 text-sm">Ribs easily felt</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">4-5: Ideal</span>
                <span className="text-green-600 text-sm">Ribs felt with pressure</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-orange-900">6-7: Overweight</span>
                <span className="text-orange-600 text-sm">Ribs hard to feel</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-900">8-9: Obese</span>
                <span className="text-red-600 text-sm">Cannot feel ribs</span>
              </div>
            </div>
          </div>

          {/* Emergency Drug Doses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🆘</span>
              Emergency Drug Doses
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                <h3 className="font-medium text-red-900">Adrenaline (Cardiac Arrest)</h3>
                <p className="text-sm text-red-700">0.01-0.02 mg/kg IV/IO (1:1000 solution)</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <h3 className="font-medium text-blue-900">Atropine Sulphate</h3>
                <p className="text-sm text-blue-700">0.02-0.04 mg/kg IV/IM/SC</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                <h3 className="font-medium text-green-900">Diazepam (Seizures)</h3>
                <p className="text-sm text-green-700">0.5-2 mg/kg IV slowly or 0.5-1 mg/kg rectally</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                <h3 className="font-medium text-purple-900">Furosemide (Frusemide)</h3>
                <p className="text-sm text-purple-700">2-4 mg/kg IV/IM/SC (cardiac failure: 1-2 mg/kg)</p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50">
                <h3 className="font-medium text-indigo-900">Prednisolone Sodium Succinate</h3>
                <p className="text-sm text-indigo-700">15-30 mg/kg IV (shock dose)</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800 flex items-center">
                <span className="mr-2">⚠️</span>
                Always verify doses and consult current protocols before administration
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Disclaimer - UK Veterinary Practice</h3>
          <p className="text-blue-800 text-sm mb-3">
            These calculators are provided for educational purposes only and should not replace clinical judgement. 
            Always verify calculations independently and consult current UK veterinary protocols, the BSAVA formulary, 
            and VMD-approved drug datasheets before administering any treatments. All calculations should be reviewed 
            in accordance with RCVS guidance on responsible prescribing.
          </p>
          <p className="text-blue-700 text-xs">
            For emergency cases, contact your local veterinary emergency service or the Veterinary Poisons Information Service (VPIS). 
            Always follow current UK legislation including the Veterinary Medicines Regulations (VMR).
          </p>
        </div>
      </div>
    </Layout>
  );
} 