// function CarbonEmissionFromMining(fuelConsumed, fuelType) {
//   if (fuelType == "Diesel") return fuelConsumed * 2.67;
//   else if (fuelType == "BioDiesel") return fuelConsumed * 2.39;
//   else return fuelConsumed * 0.82;
// }
// function methaneEmission(methaneEmission, gwp) {
//   return methaneEmission * gwp;
// }
// function CarbonCalculator(
//   fuelConsumed,
//   fuelType,
//   eletricityConsumedForMiningEquip,
//   methaneEmission
// ) {
//   FinalCarbonEmission =
//     CarbonEmissionFromMining(fuelConsumed, fuelType) +
//     CarbonEmissionFromMining(eletricityConsumedForMiningEquip, "electric");
//   FinalCarbonEmission += methaneEmission(methaneEmission, 25);
// }
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// List of supported carbon offset activities used for recommendations and calculations
var offsets = [
  "afforestation",
  "methaneCapture",
  "renewableEnergy",
  "soilCarbon",
  "carbonCredits",
  "enhancedWeathering",
  "biochar",
  "renewableDiesel",
  "wetlandsPeatlands",
];

// Calculates carbon emissions based on the type and amount of fuel consumed.
// Each fuel type has a specific emission factor (kg CO2 per unit).
export function CarbonEmissionFromFuel(fuelType, fuelConsumed) {
  switch (fuelType) {
    case "Natural Gas":
      return fuelConsumed * 2.75; // kg CO2 per kg
    case "Heating Oil":
      return fuelConsumed * 3.15; // kg CO2 per liter
    case "LPG":
      return fuelConsumed * 2.95;
    case "Other":
      return 0; // Or set a default value if you want
    case "diesel":
    case "Diesel":
      return fuelConsumed * 2.73;
    case "petrol":
    case "Petrol":
      return fuelConsumed * 2.31;
    case "CNG":
      return fuelConsumed * 2.75;
    case "Electric":
      return 0;
    case "anthracite":
      return fuelConsumed * 2.87;
    case "bituminous":
      return fuelConsumed * 2.57;
    case "lignite":
      return fuelConsumed * 1.53;
    case "subbituminous":
      return fuelConsumed * 1.85;
    case "Fuel Oil":
      return fuelConsumed * 2.9;
    case "Pet Coke":
      return fuelConsumed * 3.39;
    case "Rice Husk":
      return fuelConsumed * 2.28;
    case "Wood":
      return fuelConsumed * 1.81;
    default:
      return 0;
  }
}

// Returns the unit of measurement for a given carbon offset activity.
// Used to display recommendations in the correct units (e.g., hectares, MWh).
export function getUnit(offset) {
  switch (offset) {
    case "afforestation":
      // Return the unit for afforestation
      return "hectares";

    case "methaneCapture":
      // Return the unit for methane capture
      return "cubic meters";

    case "renewableEnergy":
      // Return the unit for renewable energy
      return "MWh";

    case "soilCarbon":
      // Return the unit for soil carbon sequestration
      return "hectares";

    case "carbonCredits":
      // Return the unit for carbon credits
      return "credits";

    case "enhancedWeathering":
      // Return the unit for enhanced weathering
      return "tons of rock";

    case "biochar":
      // Return the unit for biochar
      return "tons of biochar";

    case "renewableDiesel":
      // Return the unit for renewable diesel
      return "gallons";

    case "wetlandsPeatlands":
      // Return the unit for wetlands and peatlands restoration
      return "hectares";

    default:
      // Return a default value if the offset is not recognized
      return "unknown unit";
  }
}

// Randomly splits a value into n parts that sum up to the original value.
// Used to distribute total emissions across different offset activities for recommendations.
export function distributeValue(value, n) {
  if (n <= 0) {
    throw new Error("Number of parts must be greater than 0");
  }
  if (n === 1) {
    return [value];
  }

  // Generate n-1 random split points between 0 and 1, then sort them
  const splits = Array.from({ length: n - 1 }, () => Math.random()).sort(
    (a, b) => a - b
  );

  // Calculate the differences between split points to get each part
  const parts = splits.map(
    (split, index) => (split - (splits[index - 1] || 0)) * value
  );

  // Add the final part (from last split to 1)
  parts.push((1 - splits[splits.length - 1]) * value);

  return parts;
}

// Provides personalized recommendations for reducing carbon footprint.
// Distributes the total emission value across offset types and suggests how much of each activity to do.
export function giveRecommendation(carbonEmission) {
  const parts = distributeValue(carbonEmission, 9);
  return offsets.map((offset, index) => {
    const part = parts[index];
    const factor = getCarbonMultiplier(offset);
    // Suggests the amount of each offset activity needed to reduce the given part of emissions
    return `Reduce carbon footprint by doing ${(
      part.toFixed(2) / factor.toFixed(2)
    ).toFixed(2)} ${getUnit(offset)} of ${offset}.`;
  });
}

// Calculates carbon emissions from electricity consumption (in units).
// Uses a fixed emission factor for electricity.
export function CarbonEmissionFromElectricity(units) {
  return (units * 1.0035).toFixed(2);
}

// Returns the emission factor (kg CO2 per kg) for a given type of explosive.
// Used for calculating emissions from mining explosives.
export function getEmissionFactor(explosiveType) {
  // Log the explosive type to verify what is passed
  console.log("Explosive Type Received:", explosiveType);

  // Trim the input to avoid issues with extra spaces
  const trimmedType = explosiveType.trim();

  switch (trimmedType) {
    case "Dynamite (Nitroglycerin-based)":
      return 0.23; // kg CO2 per kg of dynamite
    case "Ammonium Nitrate Fuel Oil (ANFO)":
      return 0.16; // kg CO2 per kg of ANFO
    case "Emulsion Explosives":
      return 0.17; // kg CO2 per kg of emulsion explosives
    case "Water-gel Explosives (Slurries)":
      return 0.15; // kg CO2 per kg of water-gel explosives
    case "Pentolite":
      return 0.24; // kg CO2 per kg of pentolite
    case "TNT (Trinitrotoluene)":
      return 0.25; // kg CO2 per kg of TNT
    case "PETN (Pentaerythritol Tetranitrate)":
      return 0.21; // kg CO2 per kg of PETN
    case "Black Powder":
      return 0.3; // kg CO2 per kg of black powder
    default:
      console.log("Explosive type not found, returning default value");
      return 1; // default if explosive type is not recognized
  }
}

// Returns the average carbon offset multiplier for a given activity type.
// Used to convert offset activity units into equivalent CO2 reduction.
function getCarbonMultiplier(activity) {
  switch (activity) {
    case "afforestation":
      return (2 + 4) / 2; // 2-4 metric tons CO2/hectare/year

    case "methaneCapture":
      return (25 + 50) / 2; // 25-50 metric tons CO2e/cubic meter of methane captured/year

    case "renewableEnergy":
      return (0.5 + 1) / 2; // 0.5-1 metric ton CO2/MWh

    case "soilCarbon":
      return (0.2 + 1) / 2; // 0.2-1 metric ton CO2/hectare/year

    case "ccs":
      return 0.9; // Up to 90% of facility CO2 emissions

    case "beccs":
      return (1 + 2) / 2; // 1-2 metric tons CO2/MWh

    case "carbonCredits":
      return 1; // 1 metric ton CO2 per credit

    case "enhancedWeathering":
      return (0.5 + 1) / 2; // 0.5-1 metric ton CO2/ton of rock

    case "biochar":
      return (0.5 + 1) / 2; // 0.5-1 metric ton CO2/ton of biochar

    case "renewableDiesel":
      return (2.5 + 3.5) / 2; // 2.5-3.5 metric tons CO2e/1,000 gallons

    case "avoidedDeforestation":
      return (100 + 200) / 2; // 100-200 metric tons CO2/hectare/year

    case "oceanAlkalinity":
      return (0.5 + 1) / 2; // 0.5-1 metric ton CO2/ton of substance

    case "wetlandsPeatlands":
      return (3 + 6) / 2; // 3-6 metric tons CO2/hectare/year

    default:
      throw new Error("Unknown activity type");
  }
}

// Calculates the total carbon emissions for the user.
// Sums up emissions from transportation and equipment, subtracts all offsets, and saves the result.
export function totalCarbonEmission() {
  // Retrieve and shorten variable names for emissions from localStorage
  var transElecEm = Number(localStorage.getItem("electricityEmissions")) || 0;
  var transFuelEm = Number(localStorage.getItem("fuelEmissions")) || 0;
  var excElecEm = Number(localStorage.getItem("electricityEmission")) || 0;
  var excFuelEm = Number(localStorage.getItem("fuelEmission")) || 0;

  // Calculate the total emissions from all sources
  var totalEmission = transElecEm + transFuelEm + excElecEm + excFuelEm;

  // Retrieve the carbon offset values from localStorage and convert them to CO2 equivalents
  var offsets = [
    "afforestation",
    "methaneCapture",
    "renewableEnergy",
    "soilCarbon",
    "ccs",
    "beccs",
    "carbonCredits",
    "enhancedWeathering",
    "biochar",
    "renewableDiesel",
    "avoidedDeforestation",
    "oceanAlkalinity",
    "wetlandsPeatlands",
  ].map(
    (key) => (Number(localStorage.getItem(key)) || 0) * getCarbonMultiplier(key)
  );

  // Retrieve equipment emissions list from localStorage
  const equipmentListJSON = localStorage.getItem("equipmentList");
  const equipmentList = equipmentListJSON ? JSON.parse(equipmentListJSON) : [];
  // Add up emissions from each equipment item
  equipmentList.forEach((equipment) => {
    var emissionString = equipment.emissions;
    if (emissionString[0] === ".") emissionString = "0" + emissionString;
    var value = parseFloat(emissionString);
    totalEmission += value;
  });
  // Convert to tons (if original units are kg)
  totalEmission /= 1000;
  // Subtract all offsets from the total emission
  totalEmission -= offsets.reduce((acc, val) => acc + val, 0);

  totalEmission = totalEmission.toFixed(5);
  // Log and save the final total emission
  console.log("Total Carbon Emission:", totalEmission);
  addCarbonEmissionHistory(totalEmission, 0, 0);
  return totalEmission;
}

// Adds a new carbon emission history record to the user's Firestore document.
// Stores the emission, money saved, credits earned, and user-specific lifestyle data.
const addCarbonEmissionHistory = async (
  carbonEmission,
  moneySaved,
  carbonCreditsEarned
) => {
  try {
    // Get the currently authenticated user
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Get user's UID
      const userId = user.uid;

      // Prepare carbon emission history data
      const historyData = {
        carbonEmission,
        moneySaved,
        carbonCreditsEarned,
        createdAt: new Date(), // Timestamp
        // User-centric fields
        dietType: localStorage.getItem("dietType") || "",
        wasteGeneration: localStorage.getItem("wasteGeneration") || "",
        recycling: localStorage.getItem("recycling") || "",
        composting: localStorage.getItem("composting") || "",
        greenEnergy: localStorage.getItem("greenEnergy") || "",
        // Add more fields as needed
      };

      // Reference to the user's carbonEmissionHistory collection
      const historyCollectionRef = collection(
        db,
        "users",
        userId,
        "carbonEmissionHistory"
      );

      // Add a new document with an auto-generated ID
      await setDoc(doc(historyCollectionRef), historyData);

      console.log("Carbon emission history added successfully!");
    } else {
      console.log("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error adding carbon emission history: ", error);
  }
};

// Fetches all carbon emission history records for the user and sums their values.
// Returns the total carbon emissions, money saved, and credits earned across all records.
export const fetchAndSumCarbonEmissionHistory = async () => {
  try {
    // Get the currently authenticated user
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;

      // Reference to the user's carbonEmissionHistory collection
      const carbonEmissionHistoryRef = collection(
        db,
        "users",
        userId,
        "carbonEmissionHistory"
      );

      // Fetch all documents from carbonEmissionHistory
      const querySnapshot = await getDocs(carbonEmissionHistoryRef);

      // Initialize variables to store the sums
      let totalCarbonEmission = 0;
      let totalMoneySaved = 0;
      let totalCarbonCreditsEarned = 0;

      // Loop through each document in the collection
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalCarbonEmission += parseFloat(data.carbonEmission) || 0;
        totalMoneySaved += parseFloat(data.moneySaved) || 0;
        totalCarbonCreditsEarned += parseFloat(data.carbonCreditsEarned) || 0;
      });

      // Return the sums
      return {
        totalCarbonEmission,
        totalMoneySaved,
        totalCarbonCreditsEarned,
      };
    } else {
      console.log("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error fetching carbon emission history:", error);
  }
};

// Calls fetchAndSumCarbonEmissionHistory and logs the summed values.
// Useful for debugging or displaying the user's total impact.
export const getSummedValues = async () => {
  const { totalCarbonEmission, totalMoneySaved, totalCarbonCreditsEarned } =
    await fetchAndSumCarbonEmissionHistory();

  console.log("Carbon Emission:", totalCarbonEmission);
  console.log("Money Saved:", totalMoneySaved);
  console.log("Carbon Credits Earned:", totalCarbonCreditsEarned);

  // You can now use the three separate variables as needed
};

// Fetches the latest carbon emission history document for the user (for dashboard display)
export const fetchLatestCarbonEmissionHistory = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      // Reference to the user's carbonEmissionHistory collection
      const carbonEmissionHistoryRef = collection(
        db,
        "users",
        userId,
        "carbonEmissionHistory"
      );
      // Query for the latest document (ordered by createdAt descending, limit 1)
      const q = query(
        carbonEmissionHistoryRef,
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Return the data from the latest document
        return querySnapshot.docs[0].data();
      } else {
        return null; // No history found
      }
    } else {
      console.log("No authenticated user found.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching latest carbon emission history:", error);
    return null;
  }
};
