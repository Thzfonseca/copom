document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const shortRateInput = document.getElementById('short-rate');
    const shortTermInput = document.getElementById('short-term');
    const longRateInput = document.getElementById('long-rate');
    const longTermInput = document.getElementById('long-term');
    const updateAssumptionsBtn = document.getElementById('update-assumptions-btn');
    const assumptionsSection = document.getElementById('assumptions-section');
    const slidersContainer = document.getElementById('sliders-container');
    const calculateBtn = document.getElementById('calculate-btn');
    const outputSection = document.getElementById('output-section');
    const shortAnnualizedReturnEl = document.getElementById('short-annualized-return');
    const longAnnualizedReturnEl = document.getElementById('long-annualized-return');
    const breakEvenCdiEl = document.getElementById('break-even-cdi');
    const narrativeOutputEl = document.getElementById('narrativeOutput');
    const copyReportBtn = document.getElementById('copy-report-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const rentabilidadeChartCanvas = document.getElementById('rentabilidadeChart');
    const toggleRealReturnCheckbox = document.getElementById('toggle-real-return');
    const toggleHistoricalDataCheckbox = document.getElementById('toggle-historical-data'); // Placeholder
    const advancedAnalysisSection = document.getElementById('advanced-analysis-section');
    const analysisToggles = document.querySelectorAll('.analysis-toggle');

    // Advanced Analysis Elements
    const shortDurationEl = document.getElementById("short-duration");
    // const shortConvexityEl = document.getElementById("short-convexity"); // Removed
    const longDurationEl = document.getElementById("long-duration");
    // const longConvexityEl = document.getElementById("long-convexity"); // Removed
    const durationNarrativeEl = document.getElementById("duration-narrative"); // ID updated
    // const breakEvenIpcaEl = document.getElementById("break-even-ipca"); // Removed
    // const breakEvenIpcaNarrativeEl = document.getElementById("breakeven-ipca-narrative"); // Removed
    const stressIpcaChangeInput = document.getElementById("stress-ipca-change");
    const stressCdiChangeInput = document.getElementById('stress-cdi-change');
    const runStressTestBtn = document.getElementById('run-stress-test-btn');
    const stressTestResultsEl = document.getElementById('stress-test-results');

    let rentabilidadeChart = null; // Chart instance
    let stressTestChart = null; // Stress test chart instance
    let simulationYears = 0;
    const MAX_SLIDER_YEARS = 4; // Current year + 3 future years (e.g., 2025-2028)
    let lastCalculationResults = null; // Store last results for toggles/export
    let currentAssumptions = null; // Store current assumptions
    let currentInputs = null; // Store current inputs

    // --- Event Listeners ---
    if (updateAssumptionsBtn) {
        updateAssumptionsBtn.addEventListener("click", setupAssumptionSliders);
        console.log("Event listener added to updateAssumptionsBtn"); // Debug log
    } else {
        console.error("updateAssumptionsBtn element not found!"); // Debug log
    }
    // updateAssumptionsBtn.addEventListener("click", setupAssumptionSliders); // Original line
    calculateBtn.addEventListener("click", runSimulation);
    copyReportBtn.addEventListener("click", copyNarrative);
    exportCsvBtn.addEventListener("click", exportToCsv);
    toggleRealReturnCheckbox.addEventListener("change", toggleRealReturn);
    toggleHistoricalDataCheckbox.disabled = true; // Disable until historical data source is implemented

    analysisToggles.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            const isVisible = targetContent.style.display === 'block';
            targetContent.style.display = isVisible ? 'none' : 'block';
            button.innerHTML = isVisible ? `${button.textContent.slice(0,-1)} &#9662;` : `${button.textContent.slice(0,-1)} &#9652;`; // Toggle arrow
        });
    });

    runStressTestBtn.addEventListener("click", runStressTest);

    // --- Functions ---

    function setupAssumptionSliders() {
        console.log("setupAssumptionSliders called"); // Debug log
        const shortTerm = parseFloat(shortTermInput.value);
        const longTerm = parseFloat(longTermInput.value);
        console.log("Short Term:", shortTerm, "Long Term:", longTerm); // Debug log

        if (isNaN(shortTerm) || isNaN(longTerm) || shortTerm <= 0 || longTerm <= 0 || shortTerm >= longTerm) {
            alert("Por favor, insira prazos válidos (curto < longo, ambos > 0).");
            console.error("Invalid terms provided."); // Debug log
            return;
        }

        simulationYears = Math.ceil(longTerm);
        console.log("Simulation Years:", simulationYears); // Debug log

        if (!slidersContainer) {
            console.error("slidersContainer element not found!"); // Debug log
            return;
        }
        slidersContainer.innerHTML = ""; // Clear previous sliders
        console.log("Cleared slidersContainer."); // Debug log

        const currentYear = dayjs().year();
        const yearsToGenerate = Math.min(simulationYears + 1, MAX_SLIDER_YEARS);
        console.log("Years to generate sliders for:", yearsToGenerate); // Debug log

        for (let i = 0; i < yearsToGenerate; i++) {
            const year = currentYear + i;
            const isCurrentYear = i === 0;
            const yearLabel = isCurrentYear ? `${year} (Pro-rata)` : `${year}`;
            const sliderGroup = document.createElement("div");
            sliderGroup.classList.add("slider-group");
            sliderGroup.innerHTML = `
                <h4>${yearLabel}</h4>
                <div class="slider-wrapper">
                    <label for="ipca-${year}">IPCA:</label>
                    <input type="range" id="ipca-${year}" name="ipca-${year}" min="0" max="15" step="0.5" value="5">
                    <span id="ipca-${year}-value">5.0%</span>
                </div>
                <div class="slider-wrapper">
                    <label for="cdi-${year}">CDI:</label>
                    <input type="range" id="cdi-${year}" name="cdi-${year}" min="0" max="20" step="0.25" value="10">
                    <span id="cdi-${year}-value">10.00%</span>
                </div>
            `;
            slidersContainer.appendChild(sliderGroup);
            console.log(`Generated slider for year ${year}`); // Debug log

            // Add event listeners for slider value display
            const ipcaSlider = sliderGroup.querySelector(`#ipca-${year}`);
            const ipcaValueSpan = sliderGroup.querySelector(`#ipca-${year}-value`);
            ipcaSlider.addEventListener("input", () => ipcaValueSpan.textContent = `${parseFloat(ipcaSlider.value).toFixed(1)}%`);

            const cdiSlider = sliderGroup.querySelector(`#cdi-${year}`);
            const cdiValueSpan = sliderGroup.querySelector(`#cdi-${year}-value`);
            cdiSlider.addEventListener("input", () => cdiValueSpan.textContent = `${parseFloat(cdiSlider.value).toFixed(2)}%`);
        }

        console.log("Finished generating sliders."); // Debug log

        if (!assumptionsSection) {
            console.error("assumptionsSection element not found!"); // Debug log
            return;
        }
        assumptionsSection.style.display = "block";
        console.log("Set assumptionsSection display to block."); // Debug log

        outputSection.style.display = "none"; // Hide results until calculated
        advancedAnalysisSection.style.display = "none"; // Hide advanced analysis
    }

    function getAssumption(type, year, assumptionsOverride = null) {
        const currentYear = dayjs().year();
        const targetYear = Math.min(year, currentYear + MAX_SLIDER_YEARS - 1); // Use last slider value for perpetuity

        if (assumptionsOverride && assumptionsOverride[type] && assumptionsOverride[type][targetYear - currentYear] !== undefined) {
             // Use override if available (for stress test)
             const rate = assumptionsOverride[type][targetYear - currentYear];
             // Ensure rate is not below 0 after stress test
             return Math.max(0, rate);
        }

        const slider = document.getElementById(`${type}-${targetYear}`);
        if (slider) {
            return parseFloat(slider.value) / 100;
        }
        // Fallback if slider somehow doesn't exist (shouldn't happen)
        return type === 'ipca' ? 0.05 : 0.10;
    }

    function runSimulation() {
        // --- Read Inputs ---
        const shortRate = parseFloat(shortRateInput.value) / 100;
        const shortTerm = parseFloat(shortTermInput.value);
        const longRate = parseFloat(longRateInput.value) / 100;
        const longTerm = parseFloat(longTermInput.value);

        currentInputs = { shortRate, shortTerm, longRate, longTerm }; // Store inputs

        // --- Basic Validation ---
        if (isNaN(shortRate) || isNaN(shortTerm) || isNaN(longRate) || isNaN(longTerm) ||
            shortTerm <= 0 || longTerm <= 0 || shortRate < 0 || longRate < 0 || shortTerm >= longTerm) {
            alert('Por favor, verifique os valores de taxa e prazo. Taxas devem ser >= 0, Prazos > 0 e Prazo Curto < Prazo Longo.');
            return;
        }

        // --- Get Assumptions ---
        const assumptions = { ipca: [], cdi: [] };
        const currentYear = dayjs().year();
        const dayOfYear = dayjs().dayOfYear();
        const daysInYear = dayjs().isLeapYear() ? 366 : 365;
        const remainingYearFraction = (daysInYear - dayOfYear) / daysInYear;

        // Ensure simulationYears is set (might not be if assumptions weren't updated)
        if (simulationYears === 0) simulationYears = Math.ceil(longTerm);

        for (let i = 0; i < simulationYears; i++) {
            const year = currentYear + i;
            assumptions.ipca.push(getAssumption('ipca', year));
            assumptions.cdi.push(getAssumption('cdi', year));
        }
        currentAssumptions = assumptions; // Store assumptions

        // --- Calculations ---
        const results = calculateAllMetrics(shortRate, shortTerm, longRate, longTerm, assumptions, remainingYearFraction);
        lastCalculationResults = results; // Store results

        // --- Display Results ---
        displayMainResults(results);
        displayAdvancedAnalyses(results, assumptions, shortRate, shortTerm, longRate, longTerm, remainingYearFraction);

        // --- Update Chart ---
        updateChart(); // Initial chart update (nominal)

        // --- Show Sections ---
        outputSection.style.display = 'block';
        advancedAnalysisSection.style.display = 'block';
    }

    function calculateAllMetrics(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction) {
        const nominalReturns = calculateNominalReturns(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction);
        const realReturns = calculateRealReturns(nominalReturns.chartData, assumptions, firstYearFraction);
        const durationMetrics = calculateDuration(shortRate, shortTerm, longRate, longTerm); // Updated function name
        // const breakEvenIpcaResult = calculateBreakEvenIpca(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction, nominalReturns.shortScenario.finalValue, nominalReturns.longScenario.finalValue); // Removed

        return {
            ...nominalReturns,
            realChartData: realReturns.realChartData,
            durationMetrics, // Updated property name
            // breakEvenIpca: breakEvenIpcaResult.breakEvenIpca, // Removed
            // breakEvenIpcaIterations: breakEvenIpcaResult.iterations // Removed
        };
    }

    function displayMainResults(results) {
        shortAnnualizedReturnEl.textContent = `${(results.shortScenario.annualizedReturn * 100).toFixed(2)}%`;
        longAnnualizedReturnEl.textContent = `${(results.longScenario.annualizedReturn * 100).toFixed(2)}%`;
        breakEvenCdiEl.textContent = `${(results.breakEvenCdi * 100).toFixed(2)}%`;
        narrativeOutputEl.value = generateNarrative(currentInputs.shortRate, currentInputs.shortTerm, currentInputs.longRate, currentInputs.longTerm, currentAssumptions, results, calculateFirstYearFraction());
    }

    function displayAdvancedAnalyses(results, assumptions, shortRate, shortTerm, longRate, longTerm, firstYearFraction) {
        // Duration
        shortDurationEl.textContent = `${results.durationMetrics.short.duration.toFixed(2)} anos`;
        // shortConvexityEl.textContent = `${results.durationConvexity.short.convexity.toFixed(2)}`; // Removed
        longDurationEl.textContent = `${results.durationMetrics.long.duration.toFixed(2)} anos`;
        // longConvexityEl.textContent = `${results.durationConvexity.long.convexity.toFixed(2)}`; // Removed
        durationNarrativeEl.textContent = generateDurationNarrative(results.durationMetrics); // Updated function name and element ID

        // Break-even IPCA section removed
        /*
        if (results.breakEvenIpca !== null) {
            breakEvenIpcaEl.textContent = `${(results.breakEvenIpca * 100).toFixed(2)}% a.a.`;
            breakEvenIpcaNarrativeEl.textContent = `Se a inflação média futura (IPCA) for de aproximadamente ${(results.breakEvenIpca * 100).toFixed(2)}% a.a., ambas as estratégias teriam o mesmo retorno final. Acima disso, a Opção Longa tende a ser melhor (assumindo taxa real positiva); abaixo, a Opção Curta + CDI tende a performar melhor. (Calculado em ${results.breakEvenIpcaIterations} iterações).`;
        } else {
            breakEvenIpcaEl.textContent = 'N/A';
            breakEvenIpcaNarrativeEl.textContent = 'Não foi possível calcular o IPCA de break-even (talvez a opção longa já seja inferior mesmo com IPCA zero, ou o cálculo não convergiu).';
        }
        */

        // Reset Stress Test Results
        stressTestResultsEl.innerHTML = '<p>Aguardando teste...</p>';
    }

    function calculateNominalReturns(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction) {
        const months = Math.ceil(longTerm * 12);
        const chartData = { labels: [], short: [], long: [] };
        let shortValue = 100;
        let longValue = 100;
        let shortRolloverValue = 0;
        let shortTermEnded = false;
        let cumulativeIpcaFactor = 1.0;

        const today = dayjs();
        chartData.labels.push(today.format('MMM/YYYY'));
        chartData.short.push(shortValue);
        chartData.long.push(longValue);

        let currentYearIndex = 0;
        let fractionOfYearProcessed = 1.0 - firstYearFraction; // Track progress within the first year

        for (let m = 1; m <= months; m++) {
            const currentDate = today.add(m, 'month');
            const currentYear = currentDate.year();
            const monthFraction = 1 / 12;

            // Determine current year's assumptions
            const yearIndexForAssumptions = Math.min(currentYearIndex, assumptions.ipca.length - 1);
            const ipcaRate = assumptions.ipca[yearIndexForAssumptions];
            const cdiRate = assumptions.cdi[yearIndexForAssumptions];

            // Calculate monthly factors (approximation using geometric average for the year)
            const monthlyIpcaFactor = Math.pow(1 + ipcaRate, monthFraction) - 1;
            const monthlyCdiFactor = Math.pow(1 + cdiRate, monthFraction) - 1;
            const monthlyShortRealFactor = Math.pow(1 + shortRate, monthFraction) - 1;
            const monthlyLongRealFactor = Math.pow(1 + longRate, monthFraction) - 1;

            // Adjust for pro-rata in the first year
            let effectiveMonthlyIpcaFactor = monthlyIpcaFactor;
            let effectiveMonthlyCdiFactor = monthlyCdiFactor;
            if (currentYear === today.year() && firstYearFraction < 1.0) {
                 // Simple scaling for the first partial year - more accurate methods exist
                 effectiveMonthlyIpcaFactor = Math.pow(1 + ipcaRate, monthFraction * firstYearFraction / (1-fractionOfYearProcessed + Number.EPSILON)) - 1; // Scale based on remaining fraction
                 effectiveMonthlyCdiFactor = Math.pow(1 + cdiRate, monthFraction * firstYearFraction / (1-fractionOfYearProcessed + Number.EPSILON)) - 1;
                 // This pro-rata needs careful validation
            }

            cumulativeIpcaFactor *= (1 + effectiveMonthlyIpcaFactor);

            // Long Option Calculation: (1 + Real Rate) * (1 + IPCA)
            longValue *= (1 + monthlyLongRealFactor) * (1 + effectiveMonthlyIpcaFactor);

            // Short Option Calculation
            if (!shortTermEnded && m / 12 <= shortTerm) {
                shortValue *= (1 + monthlyShortRealFactor) * (1 + effectiveMonthlyIpcaFactor);
                if (m / 12 >= shortTerm) {
                    shortTermEnded = true;
                    shortRolloverValue = shortValue; // Value at maturity to rollover
                }
            } else {
                // Rollover in CDI
                if (shortRolloverValue === 0) shortRolloverValue = shortValue; // Ensure rollover starts if term is fractional month
                shortRolloverValue *= (1 + effectiveMonthlyCdiFactor);
                shortValue = shortRolloverValue;
            }

            // Update chart data (monthly)
            chartData.labels.push(currentDate.format('MMM/YYYY'));
            chartData.short.push(shortValue);
            chartData.long.push(longValue);

            // Update year index if new year starts
            if (currentDate.month() === 0 && m > 1) { // Check month 0 (January)
                 currentYearIndex++;
                 fractionOfYearProcessed = 0.0; // Reset for the new year
            }
            if (currentYear === today.year()) {
                 fractionOfYearProcessed += monthFraction;
            }
        }

        const finalShortValue = shortValue;
        const finalLongValue = longValue;

        // Calculate Annualized Returns (using geometric mean)
        const shortAnnualized = Math.pow(finalShortValue / 100, 1 / longTerm) - 1;
        const longAnnualized = Math.pow(finalLongValue / 100, 1 / longTerm) - 1;

        // Calculate Break-Even CDI (approximation)
        let breakEvenCdiApprox = 0;
        const shortTermMonths = Math.ceil(shortTerm * 12);
        if (longTerm > shortTerm && chartData.short[shortTermMonths] > 0) {
             const valueAtShortMaturity = chartData.short[shortTermMonths];
             const requiredReturnPostShort = Math.pow(finalLongValue / valueAtShortMaturity, 1 / (longTerm - shortTerm)) - 1;
             breakEvenCdiApprox = requiredReturnPostShort; // Approximating CDI = required return
        } else {
            breakEvenCdiApprox = NaN; // Cannot calculate if longTerm <= shortTerm or value is zero
        }

        return {
            shortScenario: {
                finalValue: finalShortValue,
                annualizedReturn: shortAnnualized
            },
            longScenario: {
                finalValue: finalLongValue,
                annualizedReturn: longAnnualized
            },
            breakEvenCdi: isNaN(breakEvenCdiApprox) ? 0 : breakEvenCdiApprox, // Return 0 if NaN
            chartData: chartData,
            cumulativeIpcaFactor: cumulativeIpcaFactor
        };
    }

    function calculateRealReturns(nominalChartData, assumptions, firstYearFraction) {
        const realChartData = { labels: [...nominalChartData.labels], short: [], long: [] };
        let cumulativeIpca = 1.0;
        const today = dayjs();
        let currentYearIndex = 0;
        let fractionOfYearProcessed = 1.0 - firstYearFraction;

        realChartData.short.push(100);
        realChartData.long.push(100);

        for (let m = 1; m < nominalChartData.labels.length; m++) {
            const currentDate = dayjs(nominalChartData.labels[m], 'MMM/YYYY');
            const currentYear = currentDate.year();
            const monthFraction = 1 / 12;

            const yearIndexForAssumptions = Math.min(currentYearIndex, assumptions.ipca.length - 1);
            const ipcaRate = assumptions.ipca[yearIndexForAssumptions];
            let effectiveMonthlyIpcaFactor = Math.pow(1 + ipcaRate, monthFraction) - 1;

            if (currentYear === today.year() && firstYearFraction < 1.0) {
                 effectiveMonthlyIpcaFactor = Math.pow(1 + ipcaRate, monthFraction * firstYearFraction / (1-fractionOfYearProcessed + Number.EPSILON)) - 1;
            }

            cumulativeIpca *= (1 + effectiveMonthlyIpcaFactor);

            realChartData.short.push(nominalChartData.short[m] / cumulativeIpca);
            realChartData.long.push(nominalChartData.long[m] / cumulativeIpca);

            if (currentDate.month() === 0 && m > 0) {
                 currentYearIndex++;
                 fractionOfYearProcessed = 0.0;
            }
             if (currentYear === today.year()) {
                 fractionOfYearProcessed += monthFraction;
            }
        }
        return { realChartData };
    }

    // --- Advanced Calculation Functions (Placeholders/Simplified) ---

    function calculateDuration(shortRate, shortTerm, longRate, longTerm) {
        // --- Simplified Calculation: Macaulay Duration for Zero-Coupon Bond with Real Rate ---
        // This is a major simplification, ignoring IPCA impact on cash flows and timing.
        // A proper calculation requires projecting cash flows based on IPCA assumptions.

        // Helper function (simplified)
        const calculateMetrics = (rate, term) => {
            // Using the formula for duration of a zero-coupon bond: D = T
            const duration = term;
            // const convexity = term * (term + 1) / Math.pow(1 + rate, 2); // Removed
            return { duration }; // Return only duration
        };

        // We should use an effective discount rate combining real rate and expected IPCA,
        // but for simplicity, we'll just use the real rate here.
        const shortMetrics = calculateMetrics(shortRate, shortTerm);
        const longMetrics = calculateMetrics(longRate, longTerm);

        return {
            short: shortMetrics,
            long: longMetrics
        };
    }    function generateDurationNarrative(durationMetrics) { // Parameter name updated
        let narrative = `A Duração de Macaulay estimada indica a sensibilidade do valor do título a variações nas taxas de juros. `; 
        narrative += `A Opção Curta (${durationMetrics.short.duration.toFixed(2)} anos) é menos sensível que a Opção Longa (${durationMetrics.long.duration.toFixed(2)} anos). `;
        narrative += `Isso significa que, para uma mesma variação na taxa de juros esperada, o preço da Opção Longa tende a variar mais (positiva ou negativamente) do que o da Opção Curta.`;
        // Convexity part removed
        return narrative;
    }

    function calculateBreakEvenIpca(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction, targetShortFinalValue) {targetLongFinalValue) {
        // Iterative approach to find IPCA that makes finalLongValue equal targetShortFinalValue
        let lowerBoundIpca = -0.10; // Allow for deflation
        let upperBoundIpca = 0.50; // 50% IPCA upper limit
        let bestGuessIpca = null;
        let iterations = 0;
        const MAX_ITERATIONS = 100;
        const TOLERANCE = 0.01; // Tolerance in final value difference (e.g., 0.01 for base 100)

        // Check if long is already worse even with zero IPCA
        const assumptionsZeroIpca = { ...assumptions, ipca: assumptions.ipca.map(() => 0) };
        const returnsZeroIpca = calculateNominalReturns(shortRate, shortTerm, longRate, longTerm, assumptionsZeroIpca, firstYearFraction);
        if (returnsZeroIpca.longScenario.finalValue < targetShortFinalValue) {
             // If long is worse even at 0% IPCA, break-even might be negative or non-existent in practical terms
             // Try with lower bound
             const assumptionsLowerBoundIpca = { ...assumptions, ipca: assumptions.ipca.map(() => lowerBoundIpca) };
             const returnsLowerBoundIpca = calculateNominalReturns(shortRate, shortTerm, longRate, longTerm, assumptionsLowerBoundIpca, firstYearFraction);
             if (returnsLowerBoundIpca.longScenario.finalValue < targetShortFinalValue) {
                 return { breakEvenIpca: null, iterations: 0 }; // Break-even likely negative, return null
             }
        }
         // Check if long is better even with high IPCA
        const assumptionsUpperBoundIpca = { ...assumptions, ipca: assumptions.ipca.map(() => upperBoundIpca) };
        const returnsUpperBoundIpca = calculateNominalReturns(shortRate, shortTerm, longRate, longTerm, assumptionsUpperBoundIpca, firstYearFraction);
        if (returnsUpperBoundIpca.longScenario.finalValue > targetShortFinalValue) {
             // If long is still better at high IPCA, maybe break-even is higher?
             // Keep iterating, but this suggests high sensitivity or high real rate difference.
        }


        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const midIpca = (lowerBoundIpca + upperBoundIpca) / 2;
            const tempAssumptions = { ...assumptions, ipca: assumptions.ipca.map(() => midIpca) };

            const tempReturns = calculateNominalReturns(shortRate, shortTerm, longRate, longTerm, tempAssumptions, firstYearFraction);
            const difference = tempReturns.longScenario.finalValue - targetShortFinalValue;

            if (Math.abs(difference) < TOLERANCE) {
                bestGuessIpca = midIpca;
                break;
            }

            if (difference < 0) {
                // Long value is too low, need higher IPCA
                lowerBoundIpca = midIpca;
            } else {
                // Long value is too high, need lower IPCA
                upperBoundIpca = midIpca;
            }
        }

        return { breakEvenIpca: bestGuessIpca, iterations };
    }

    function runStressTest() {
        if (!lastCalculationResults || !currentInputs || !currentAssumptions) {
            alert("Por favor, execute o cálculo principal primeiro.");
            return;
        }

        const ipcaShock = parseFloat(stressIpcaChangeInput.value || 0) / 100;
        const cdiShock = parseFloat(stressCdiChangeInput.value || 0) / 100;

        // Get durations from the main calculation results
        const shortDuration = lastCalculationResults.durationMetrics.short.duration;
        const longDuration = lastCalculationResults.durationMetrics.long.duration;

        const stressedAssumptions = {
            ipca: currentAssumptions.ipca.map(rate => Math.max(0, rate + ipcaShock)), // Ensure non-negative
            cdi: currentAssumptions.cdi.map(rate => Math.max(0, rate + cdiShock))  // Ensure non-negative
        };

        const firstYearFraction = calculateFirstYearFraction();
        const stressedResults = calculateNominalReturns(
            currentInputs.shortRate,
            currentInputs.shortTerm,
            currentInputs.longRate,
            currentInputs.longTerm,
            stressedAssumptions,
            firstYearFraction
        );

        // Display stressed results
        let stressNarrative = `**Resultados com Choque (IPCA: ${ipcaShock >= 0 ? "+" : ""}${(ipcaShock * 100).toFixed(1)}%, CDI: ${cdiShock >= 0 ? "+" : ""}${(cdiShock * 100).toFixed(1)}%):**\n\n`;
        stressNarrative += `  - Novo Ret. Anual. Curto+CDI: **${(stressedResults.shortScenario.annualizedReturn * 100).toFixed(2)}%** (Original: ${(lastCalculationResults.shortScenario.annualizedReturn * 100).toFixed(2)}%)\n`;
        stressNarrative += `  - Novo Ret. Anual. Longo: **${(stressedResults.longScenario.annualizedReturn * 100).toFixed(2)}%** (Original: ${(lastCalculationResults.longScenario.annualizedReturn * 100).toFixed(2)}%)\n`;
        stressNarrative += `  - Novo CDI Break-even: **${(stressedResults.breakEvenCdi * 100).toFixed(2)}%** (Original: ${(lastCalculationResults.breakEvenCdi * 100).toFixed(2)}%)\n\n`;

        // Explain impact based on duration (simplified)
        stressNarrative += `**Impacto da Sensibilidade (Duração):**\n`;
        if (cdiShock !== 0) {
            stressNarrative += `  - O choque no CDI afeta diretamente a rentabilidade da rolagem da Opção Curta. 
`;
            stressNarrative += `  - Além disso, mudanças nas taxas de juros (refletidas no CDI) impactam o valor dos títulos IPCA+ no mercado secundário (embora esta simulação foque no carrego até o vencimento). A Opção Longa, com duração maior (${longDuration.toFixed(2)} anos), é teoricamente mais sensível a essas variações do que a Opção Curta (${shortDuration.toFixed(2)} anos). Um aumento nas taxas de juros tende a desvalorizar mais o título longo, enquanto uma queda tende a valorizá-lo mais.
`;
        }
        if (ipcaShock !== 0) {
             stressNarrative += `  - O choque no IPCA impacta diretamente a rentabilidade de ambos os títulos, pois são indexados à inflação. O efeito no retorno final dependerá da magnitude do choque e do prazo de cada opção.
`;
        }
        stressNarrative += `\n`;

        const winnerChanged = (stressedResults.shortScenario.finalValue > stressedResults.longScenario.finalValue) !== (lastCalculationResults.shortScenario.finalValue > lastCalculationResults.longScenario.finalValue);
        if (winnerChanged) {
            const newWinner = stressedResults.shortScenario.finalValue > stressedResults.longScenario.finalValue ? "Curta + CDI" : "Longa";
            stressNarrative += `  - **Atenção:** O cenário de estresse **alterou** qual estratégia apresenta maior retorno final! A opção **${newWinner}** passou a ser a mais rentável neste cenário estressado.\n`;
        } else {
             const currentWinner = lastCalculationResults.shortScenario.finalValue > lastCalculationResults.longScenario.finalValue ? "Curta + CDI" : "Longa";
             stressNarrative += `  - A estratégia **${currentWinner}** permaneceu como a mais rentável mesmo após o choque simulado.\n`;
        }

        stressTestResultsEl.innerHTML = `<pre>${stressNarrative}</pre>`; // Use pre for formatting

        // Update stress test chart
        updateStressTestChart(lastCalculationResults.chartData, stressedResults.chartData);
    }

    // --- Chart Functions ---
    function updateChart() {
        if (!lastCalculationResults) return;

        const showReal = toggleRealReturnCheckbox.checked;
        const dataToShow = showReal ? lastCalculationResults.realChartData : lastCalculationResults.chartData;
        const yAxisLabel = showReal ? 'Valor Real Acumulado (Base 100, descontado IPCA)' : 'Valor Nominal Acumulado (Base 100)';

        const ctx = rentabilidadeChartCanvas.getContext('2d');

        if (rentabilidadeChart) {
            rentabilidadeChart.destroy(); // Destroy previous chart instance
        }

        const datasets = [
            {
                label: `Opção Curta + Rolagem CDI${showReal ? ' (Real)' : ''}`,
                data: dataToShow.short,
                borderColor: '#007ACC', // Blue
                backgroundColor: 'rgba(0, 122, 204, 0.1)',
                borderWidth: 2,
                pointRadius: 1,
                tension: 0.1
            },
            {
                label: `Opção Longa${showReal ? ' (Real)' : ''}`,
                data: dataToShow.long,
                borderColor: '#FF8C00', // Orange
                backgroundColor: 'rgba(255, 140, 0, 0.1)',
                borderWidth: 2,
                pointRadius: 1,
                tension: 0.1
            }
        ];

        // Placeholder for historical data overlay
        if (toggleHistoricalDataCheckbox.checked) {
            // datasets.push({ ... dataset for historical IPCA ... });
            // datasets.push({ ... dataset for historical CDI ... });
            console.warn('Historical data overlay not implemented yet.');
        }

        rentabilidadeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dataToShow.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Rentabilidade Acumulada ${showReal ? '(Real)' : '(Nominal)'}`,
                        font: { size: 16 }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += `${context.parsed.y.toFixed(2)}`;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Tempo'
                        },
                        ticks: {
                           autoSkip: true,
                           maxTicksLimit: 15
                       }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabel
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function toggleRealReturn() {
        if (lastCalculationResults) {
            updateChart(toggleRealReturnCheckbox.checked); // Passa o estado do checkbox
        }
    }

    function toggleHistoricalData() {
        // Placeholder: Needs actual historical data source and implementation
        if (lastCalculationResults) {
             alert('Funcionalidade de sobreposição de dados históricos ainda não implementada.');
             toggleHistoricalDataCheckbox.checked = false; // Revert checkbox state
            // updateChart(); // Would redraw chart with/without historical data
        }
    }

    // --- Utility Functions ---
    function calculateFirstYearFraction() {
        const dayOfYear = dayjs().dayOfYear();
        const daysInYear = dayjs().isLeapYear() ? 366 : 365;
        return (daysInYear - dayOfYear) / daysInYear;
    }

    function generateNarrative(shortRate, shortTerm, longRate, longTerm, assumptions, results, firstYearFraction) {
        const currentYear = dayjs().year();
        const showReal = toggleRealReturnCheckbox.checked;
        const returnType = showReal ? "Real (acima da inflação)" : "Nominal (bruto)";

        // Use real or nominal results based on checkbox
        const shortFinalValue = showReal ? results.realChartData.short[results.realChartData.short.length - 1] : results.shortScenario.finalValue;
        const longFinalValue = showReal ? results.realChartData.long[results.realChartData.long.length - 1] : results.longScenario.finalValue;
        const shortAnnualized = showReal ? Math.pow(shortFinalValue / 100, 1 / longTerm) - 1 : results.shortScenario.annualizedReturn;
        const longAnnualized = showReal ? Math.pow(longFinalValue / 100, 1 / longTerm) - 1 : results.longScenario.annualizedReturn;

        let narrative = `**Análise Simplificada: Comparando Investimentos IPCA+**\n\n`;
        narrative += `Olá! Esta simulação compara duas opções de investimento que pagam a inflação (IPCA) mais uma taxa fixa ao ano. O objetivo é ver qual pode ser mais vantajosa no longo prazo, considerando suas projeções para a inflação e a taxa básica de juros (CDI).\n\n`;
        narrative += `**As Opções:**\n`;
        narrative += `1.  **Opção Curta:** Paga IPCA + ${(shortRate * 100).toFixed(2)}% ao ano, vencendo em ${shortTerm} anos. Após o vencimento, simulamos que o dinheiro é reinvestido a 100% do CDI até o final do prazo da Opção Longa.
`;
        narrative += `2.  **Opção Longa:** Paga IPCA + ${(longRate * 100).toFixed(2)}% ao ano, vencendo em ${longTerm} anos.
\n`;

        narrative += `**Suas Premissas (O que você acha que vai acontecer?):**\n`;
        narrative += `Para os próximos anos, você projetou os seguintes cenários anuais:\n`;
        const yearsToShow = Math.min(simulationYears + 1, MAX_SLIDER_YEARS);
        for (let i = 0; i < yearsToShow; i++) {
            const year = currentYear + i;
            const ipca = assumptions.ipca[i] !== undefined ? assumptions.ipca[i] : assumptions.ipca[assumptions.ipca.length - 1];
            const cdi = assumptions.cdi[i] !== undefined ? assumptions.cdi[i] : assumptions.cdi[assumptions.cdi.length - 1];
            const yearLabel = i === 0 ? `${year} (Restante do ano)` : `${year}`;
            narrative += `  - ${yearLabel}: Inflação (IPCA) de ${(ipca * 100).toFixed(1)}%, Taxa CDI de ${(cdi * 100).toFixed(2)}%\n`;
        }
        if (simulationYears >= MAX_SLIDER_YEARS) {
             const lastYearUsed = currentYear + MAX_SLIDER_YEARS - 1;
             const ipcaPerp = assumptions.ipca[assumptions.ipca.length - 1];
             const cdiPerp = assumptions.cdi[assumptions.cdi.length - 1];
             narrative += `  - A partir de ${lastYearUsed + 1}: Inflação de ${(ipcaPerp * 100).toFixed(1)}%, CDI de ${(cdiPerp * 100).toFixed(2)}% (usado para anos futuros)\n`;
        }
        narrative += `\n**Resultado Simulado (Retorno ${returnType}):**\n`;
        narrative += `Ao final dos ${longTerm} anos, a simulação indica o seguinte:\n`;
        narrative += `  - **Estratégia Curta + CDI:** Seu dinheiro teria virado R$ ${shortFinalValue.toFixed(2)} (para cada R$ 100 investidos). Isso equivale a um ganho médio de **${(shortAnnualized * 100).toFixed(2)}% ao ano**.
`;
        narrative += `  - **Estratégia Longa:** Seu dinheiro teria virado R$ ${longFinalValue.toFixed(2)} (para cada R$ 100 investidos). Isso equivale a um ganho médio de **${(longAnnualized * 100).toFixed(2)}% ao ano**.
\n`;

        narrative += `**Conclusão da Simulação:**\n`;
        const difference = shortFinalValue - longFinalValue;
        if (Math.abs(difference) < 0.01) { // Consider near-equal results
            narrative += `Com base nas suas projeções, as duas estratégias apresentaram resultados muito parecidos! O retorno final foi praticamente o mesmo. Neste caso, a escolha pode depender de outros fatores, como a sua preferência por ter o dinheiro de volta mais cedo (Opção Curta) ou travar uma taxa por mais tempo (Opção Longa).
`;
        } else if (difference > 0) {
            narrative += `Considerando o cenário que você projetou, a **Estratégia Curta + CDI parece mais vantajosa**. Investir no título mais curto e depois aplicar no CDI rendeu mais (R$ ${shortFinalValue.toFixed(2)}) do que manter o título longo até o final (R$ ${longFinalValue.toFixed(2)}).
`;
            narrative += `Isso geralmente acontece quando a taxa CDI que você espera receber após o vencimento do título curto é alta o suficiente para compensar a taxa talvez menor do título curto.
`;
        } else {
            narrative += `Com base nas suas projeções, a **Opção Longa se mostrou mais interessante**. Manter o investimento no título mais longo até o vencimento gerou um resultado melhor (R$ ${longFinalValue.toFixed(2)}) do que pegar o título curto e depois aplicar no CDI (R$ ${shortFinalValue.toFixed(2)}).
`;
            narrative += `Isso costuma ocorrer quando a taxa do título longo é significativamente maior que a do curto, ou quando a taxa CDI esperada para o período após o vencimento do título curto não é tão alta.
`;
        }
        narrative += `\n**O Ponto de Equilíbrio (CDI Break-even):**\n`;
        narrative += `Calculamos que a taxa CDI média futura que faria as duas estratégias empatarem é de aproximadamente **${(results.breakEvenCdi * 100).toFixed(2)}% ao ano**. 
`;
        narrative += `  - Se você acha que o CDI médio será **MAIOR** que isso, a estratégia Curta + CDI tende a ganhar.
`;
        narrative += `  - Se você acha que o CDI médio será **MENOR** que isso, a Opção Longa tende a ser melhor.
`;
        narrative += `Isso ajuda a entender o quão sensível o resultado é à sua expectativa para o CDI.
\n`;

        narrative += `**Como suas Premissas Influenciam:**\n`;
        narrative += `  - **Inflação (IPCA):** Se a inflação for maior do que você previu, ambos os investimentos tendem a render mais (pois pagam IPCA + taxa). O contrário também é verdade.
`;
        narrative += `  - **Taxa CDI:** Se o CDI for maior do que o previsto, a estratégia de reinvestir o título curto no CDI fica mais atraente.
`;
        narrative += `  - **Taxa Fixa (o "%" acima do IPCA):** Uma diferença grande na taxa fixa entre os títulos curto e longo pode ser o fator decisivo, mesmo que suas previsões de IPCA/CDI mudem um pouco.
\n`;
        narrative += `**Importante:** Lembre-se que esta é apenas uma simulação! Ela não considera impostos (como Imposto de Renda), taxas (custódia, etc.) e o mercado pode se comportar de forma diferente do previsto. Use esta análise como um ponto de partida e converse com seu assessor financeiro antes de decidir.`;

        return narrative;
    }   function copyNarrative() {
        narrativeOutputEl.select();
        try {
            document.execCommand('copy');
            alert('Relatório copiado para a área de transferência!');
        } catch (err) {
            alert('Erro ao copiar o relatório. Seu navegador pode não suportar esta funcionalidade ou requerer permissão.');
        }
    }

    function exportToCsv() {
        if (!lastCalculationResults) {
            alert('Por favor, execute o cálculo principal primeiro.');
            return;
        }

        const results = lastCalculationResults;
        const inputs = currentInputs;
        const assumptions = currentAssumptions;
        const firstYearFraction = calculateFirstYearFraction();
        const showReal = toggleRealReturnCheckbox.checked;
        const chartDataSource = showReal ? results.realChartData : results.chartData;

        let csvContent = "data:text/csv;charset=utf-8,";

        // --- Header Info ---
        csvContent += "Trade IPCA+ Simulation Report\n";
        csvContent += `Simulation Date:,"${dayjs().format('YYYY-MM-DD HH:mm:ss')}"\n`;
        csvContent += `Short Option:,"IPCA + ${(inputs.shortRate * 100).toFixed(2)}% for ${inputs.shortTerm} years"\n`;
        csvContent += `Long Option:,"IPCA + ${(inputs.longRate * 100).toFixed(2)}% for ${inputs.longTerm} years"\n\n`;

        // --- Assumptions ---
        csvContent += "Assumptions\n";
        csvContent += "Year,IPCA (%),CDI (%)\n";
        const currentYear = dayjs().year();
        const yearsToShow = Math.min(simulationYears + 1, MAX_SLIDER_YEARS);
        for (let i = 0; i < yearsToShow; i++) {
            const year = currentYear + i;
            const ipca = assumptions.ipca[i] !== undefined ? assumptions.ipca[i] : assumptions.ipca[assumptions.ipca.length - 1];
            const cdi = assumptions.cdi[i] !== undefined ? assumptions.cdi[i] : assumptions.cdi[assumptions.cdi.length - 1];
            const yearLabel = i === 0 ? `${year} (Pro-rata ${Math.round(firstYearFraction*100)}%)` : `${year}`;
            csvContent += `"${yearLabel}",${(ipca * 100).toFixed(1)},${(cdi * 100).toFixed(2)}\n`;
        }
         if (simulationYears >= MAX_SLIDER_YEARS) {
             const lastYearUsed = currentYear + MAX_SLIDER_YEARS - 1;
             const ipcaPerp = assumptions.ipca[assumptions.ipca.length - 1];
             const cdiPerp = assumptions.cdi[assumptions.cdi.length - 1];
             csvContent += `"Perpetuity (after ${lastYearUsed})",${(ipcaPerp * 100).toFixed(1)},${(cdiPerp * 100).toFixed(2)}\n`;
        }
        csvContent += "\n";

        // --- Summary Results ---
        csvContent += "Summary Results\n";
        csvContent += "Metric,Short + CDI Rollover,Long Option\n";
        csvContent += `Final Value (Nominal),${results.shortScenario.finalValue.toFixed(4)},${results.longScenario.finalValue.toFixed(4)}\n`;
        csvContent += `Annualized Return (Nominal %),${(results.shortScenario.annualizedReturn * 100).toFixed(4)},${(results.longScenario.annualizedReturn * 100).toFixed(4)}\n`;
        csvContent += `CDI Break-even (%),${(results.breakEvenCdi * 100).toFixed(4)},N/A\n`;
        csvContent += `IPCA Break-even (%),${results.breakEvenIpca !== null ? (results.breakEvenIpca * 100).toFixed(4) : 'N/A'},N/A\n`;
        csvContent += `Duration (Short),${results.durationConvexity.short.duration.toFixed(4)},N/A\n`;
        csvContent += `Convexity (Short),${results.durationConvexity.short.convexity.toFixed(4)},N/A\n`;
        csvContent += `Duration (Long),N/A,${results.durationConvexity.long.duration.toFixed(4)}\n`;
        csvContent += `Convexity (Long),N/A,${results.durationConvexity.long.convexity.toFixed(4)}\n\n`;

        // --- Chart Data ---
        csvContent += `Chart Data (${showReal ? 'Real' : 'Nominal'})\n`;
        csvContent += "Date,Short + CDI Rollover Value,Long Option Value\n";
        for (let i = 0; i < chartDataSource.labels.length; i++) {
            csvContent += `"${chartDataSource.labels[i]}",${chartDataSource.short[i].toFixed(4)},${chartDataSource.long[i].toFixed(4)}\n`;
        }

        // --- Create and Download Link ---
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `trade_ipca_plus_report_${dayjs().format('YYYYMMDD_HHmmss')}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    }

});




    function updateStressTestChart(baseData, stressedData) {
        const ctx = document.getElementById("stressTestChart").getContext("2d");

        if (stressTestChart) {
            stressTestChart.destroy(); // Destroy previous chart instance
        }

        stressTestChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: baseData.labels, // Assuming labels are the same
                datasets: [
                    {
                        label: "Curto+CDI (Base)",
                        data: baseData.short,
                        borderColor: "#007ACC", // Blue
                        borderWidth: 2,
                        pointRadius: 0, // Hide points for clarity
                        tension: 0.1
                    },
                    {
                        label: "Longo (Base)",
                        data: baseData.long,
                        borderColor: "#FF8C00", // Orange
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.1
                    },
                    {
                        label: "Curto+CDI (Estresse)",
                        data: stressedData.short,
                        borderColor: "#87CEEB", // Light Blue
                        borderWidth: 2,
                        borderDash: [5, 5], // Dashed line for stressed
                        pointRadius: 0,
                        tension: 0.1
                    },
                    {
                        label: "Longo (Estresse)",
                        data: stressedData.long,
                        borderColor: "#FFA07A", // Light Salmon (Light Orange)
                        borderWidth: 2,
                        borderDash: [5, 5], // Dashed line for stressed
                        pointRadius: 0,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Comparativo: Cenário Base vs. Cenário Estressado (Nominal)",
                        font: { size: 14 }
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || "";
                                if (label) {
                                    label += ": ";
                                }
                                if (context.parsed.y !== null) {
                                    label += `${context.parsed.y.toFixed(2)}`;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: false // Keep it clean, main chart has title
                        },
                         ticks: {
                           autoSkip: true,
                           maxTicksLimit: 10 // Fewer ticks for smaller chart
                       }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Valor Acumulado (Base 100)"
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    }

