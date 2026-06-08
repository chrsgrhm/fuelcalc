const form = document.querySelector("#fuel-form");
const themeToggle = document.querySelector("#theme-toggle");
const distanceInput = document.querySelector("#distance");
const useManufacturerInput = document.querySelector("#use-manufacturer");
const manualMpgGroup = document.querySelector("#manual-mpg-group");
const mpgInput = document.querySelector("#mpg");
const manufacturerFields = document.querySelector("#manufacturer-fields");
const cityMpgInput = document.querySelector("#city-mpg");
const highwayMpgInput = document.querySelector("#highway-mpg");
const fuelPriceInput = document.querySelector("#fuel-price");
const roundTripInput = document.querySelector("#round-trip");
const combinedMpgOutput = document.querySelector("#combined-mpg");
const themeColorMeta = document.querySelector("#theme-color-meta");

const resultDistance = document.querySelector("#result-distance");
const resultFuel = document.querySelector("#result-fuel");
const resultCost = document.querySelector("#result-cost");
const resultMile = document.querySelector("#result-mile");
const storageKey = "fuel-tracker-theme";

function formatNumber(value, digits = 2) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getManufacturerCombinedMpg() {
  const cityMpg = Number(cityMpgInput.value);
  const highwayMpg = Number(highwayMpgInput.value);

  if (cityMpg <= 0 || highwayMpg <= 0) {
    return 0;
  }

  return 1 / ((0.55 / cityMpg) + (0.45 / highwayMpg));
}

function updateEfficiencyMode() {
  const useManufacturer = useManufacturerInput.checked;
  const combinedMpg = getManufacturerCombinedMpg();

  manualMpgGroup.hidden = useManufacturer;
  manufacturerFields.hidden = !useManufacturer;
  mpgInput.required = !useManufacturer;
  cityMpgInput.required = useManufacturer;
  highwayMpgInput.required = useManufacturer;
  combinedMpgOutput.textContent = combinedMpg > 0 ? formatNumber(combinedMpg, 1) : "--";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark-mode", isDark);
  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.checked = isDark;

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#0d1419" : "#f6f1e8");
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(storageKey);
  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (preferredDark ? "dark" : "light"));
}

function updateTheme() {
  const theme = themeToggle.checked ? "dark" : "light";
  localStorage.setItem(storageKey, theme);
  applyTheme(theme);
}

function calculateTrip(event) {
  if (event) {
    event.preventDefault();
  }

  const baseDistance = Number(distanceInput.value);
  const mpg = useManufacturerInput.checked ? getManufacturerCombinedMpg() : Number(mpgInput.value);
  const fuelPrice = Number(fuelPriceInput.value);
  const adjustedDistance = roundTripInput.checked ? baseDistance * 2 : baseDistance;

  if (baseDistance <= 0 || mpg <= 0 || fuelPrice < 0) {
    return;
  }

  const gallonsNeeded = adjustedDistance / mpg;
  const totalCost = gallonsNeeded * fuelPrice;
  const costPerMile = adjustedDistance === 0 ? 0 : totalCost / adjustedDistance;

  resultDistance.textContent = `${formatNumber(adjustedDistance, 1)} mi`;
  resultFuel.textContent = `${formatNumber(gallonsNeeded)} gal`;
  resultCost.textContent = formatCurrency(totalCost);
  resultMile.textContent = formatCurrency(costPerMile);
}

themeToggle.addEventListener("change", updateTheme);
useManufacturerInput.addEventListener("change", () => {
  updateEfficiencyMode();
  calculateTrip();
});
form.addEventListener("submit", calculateTrip);
form.addEventListener("input", () => {
  updateEfficiencyMode();
  calculateTrip();
});

initializeTheme();
updateEfficiencyMode();
calculateTrip();
