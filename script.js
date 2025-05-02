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
    const shortDurationEl = document.getElementById('short-duration');
    const shortConvexityEl = document.getElementById('short-convexity');
    const longDurationEl = document.getElementById('long-duration');
    const longConvexityEl = document.getElementById('long-convexity');
    const durationConvexityNarrativeEl = document.getElementById('duration-convexity-narrative');
    const breakEvenIpcaEl = document.getElementById('break-even-ipca');
    const breakEvenIpcaNarrativeEl = document.getElementById('breakeven-ipca-narrative');
    const stressIpcaChangeInput = document.getElementById('stress-ipca-change');
    const stressCdiChangeInput = document.getElementById('stress-cdi-change');
    const runStressTestBtn = document.getElementById('run-stress-test-btn');
    const stressTestResultsEl = document.getElementById('stress-test-results');

    let rentabilidadeChart = null; // Chart instance
    let simulationYears = 0;
    const MAX_SLIDER_YEARS = 4; // Current year + 3 future years (e.g., 2025-2028)
    let lastCalculationResults = null; // Store last results for toggles/export
    let currentAssumptions = null; // Store current assumptions
    let currentInputs = null; // Store current inputs

    // --- Event Listeners ---
    updateAssumptionsBtn.addEventListener('click', setupAssumptionSliders);
    calculateBtn.addEventListener('click', runSimulation);
    copyReportBtn.addEventListener('click', copyNarrative);
    exportCsvBtn.addEventListener('click', exportToCsv);
    toggleRealReturnCheckbox.addEventListener('change', toggleRealReturn);
    toggleHistoricalDataCheckbox.addEventListener('change', toggleHistoricalData); // Placeholder
    runStressTestBtn.addEventListener('click', runStressTest);

    analysisToggles.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            const isVisible = targetContent.style.display === 'block';
            targetContent.style.display = isVisible ? 'none' : 'block';
            button.innerHTML = isVisible ? `${button.textContent.slice(0,-1)} &#9662;` : `${button.textContent.slice(0,-1)} &#9652;`; // Toggle arrow
        });
    });

    // --- Functions ---

    function setupAssumptionSliders() {
        const shortTerm = parseFloat(shortTermInput.value);
        const longTerm = parseFloat(longTermInput.value);

        if (isNaN(shortTerm) || isNaN(longTerm) || shortTerm <= 0 || longTerm <= 0 || shortTerm >= longTerm) {
            alert('Por favor, insira prazos válidos (curto < longo, ambos > 0).');
            return;
        }

        simulationYears = Math.ceil(longTerm);
        slidersContainer.innerHTML = ''; // Clear previous sliders
        const currentYear = dayjs().year();
        const yearsToGenerate = Math.min(simulationYears + 1, MAX_SLIDER_YEARS); // +1 for current year, limit to MAX_SLIDER_YEARS

        for (let i = 0; i < yearsToGenerate; i++) {
            const year = currentYear + i;
            const isCurrentYear = i === 0;
            const yearLabel = isCurrentYear ? `${year} (Pro-rata)` : `${year}`;
            const sliderGroup = document.createElement('div');
            sliderGroup.classList.add('slider-group');
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

            // Add event listeners for slider value display
            const ipcaSlider = sliderGroup.querySelector(`#ipca-${year}`);
            const ipcaValueSpan = sliderGroup.querySelector(`#ipca-${year}-value`);
            ipcaSlider.addEventListener('input', () => ipcaValueSpan.textContent = `${parseFloat(ipcaSlider.value).toFixed(1)}%`);

            const cdiSlider = sliderGroup.querySelector(`#cdi-${year}`);
            const cdiValueSpan = sliderGroup.querySelector(`#cdi-${year}-value`);
            cdiSlider.addEventListener('input', () => cdiValueSpan.textContent = `${parseFloat(cdiSlider.value).toFixed(2)}%`);
        }

        assumptionsSection.style.display = 'block';
        outputSection.style.display = 'none'; // Hide results until calculated
        advancedAnalysisSection.style.display = 'none'; // Hide advanced analysis
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
        const durationConvexity = calculateDurationConvexity(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction);
        const breakEvenIpcaResult = calculateBreakEvenIpca(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction, nominalReturns.shortScenario.finalValue, nominalReturns.longScenario.finalValue);

        return {
            ...nominalReturns,
            realChartData: realReturns.realChartData,
            durationConvexity,
            breakEvenIpca: breakEvenIpcaResult.breakEvenIpca,
            breakEvenIpcaIterations: breakEvenIpcaResult.iterations
        };
    }

    function displayMainResults(results) {
        shortAnnualizedReturnEl.textContent = `${(results.shortScenario.annualizedReturn * 100).toFixed(2)}%`;
        longAnnualizedReturnEl.textContent = `${(results.longScenario.annualizedReturn * 100).toFixed(2)}%`;
        breakEvenCdiEl.textContent = `${(results.breakEvenCdi * 100).toFixed(2)}%`;
        narrativeOutputEl.value = generateNarrative(currentInputs.shortRate, currentInputs.shortTerm, currentInputs.longRate, currentInputs.longTerm, currentAssumptions, results, calculateFirstYearFraction());
    }

    function displayAdvancedAnalyses(results, assumptions, shortRate, shortTerm, longRate, longTerm, firstYearFraction) {
        // Duration & Convexity
        shortDurationEl.textContent = `${results.durationConvexity.short.duration.toFixed(2)} anos`;
        shortConvexityEl.textContent = `${results.durationConvexity.short.convexity.toFixed(2)}`;
        longDurationEl.textContent = `${results.durationConvexity.long.duration.toFixed(2)} anos`;
        longConvexityEl.textContent = `${results.durationConvexity.long.convexity.toFixed(2)}`;
        durationConvexityNarrativeEl.textContent = generateDurationNarrative(results.durationConvexity);

        // Break-even IPCA
        if (results.breakEvenIpca !== null) {
            breakEvenIpcaEl.textContent = `${(results.breakEvenIpca * 100).toFixed(2)}% a.a.`;
            breakEvenIpcaNarrativeEl.textContent = `Se a inflação média futura (IPCA) for de aproximadamente ${(results.breakEvenIpca * 100).toFixed(2)}% a.a., ambas as estratégias teriam o mesmo retorno final. Acima disso, a Opção Longa tende a ser melhor (assumindo taxa real positiva); abaixo, a Opção Curta + CDI tende a performar melhor. (Calculado em ${results.breakEvenIpcaIterations} iterações).`;
        } else {
            breakEvenIpcaEl.textContent = 'N/A';
            breakEvenIpcaNarrativeEl.textContent = 'Não foi possível calcular o IPCA de break-even (talvez a opção longa já seja inferior mesmo com IPCA zero, ou o cálculo não convergiu).';
        }

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

    function calculateDurationConvexity(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction) {
        // --- Simplified Calculation: Macaulay Duration for Zero-Coupon Bond with Real Rate ---
        // This is a major simplification, ignoring IPCA impact on cash flows and timing.
        // A proper calculation requires projecting cash flows based on IPCA assumptions.

        // Helper function (simplified)
        const calculateMetrics = (rate, term) => {
            // Using the formula for duration of a zero-coupon bond: D = T
            // Using a simplified convexity approximation
            const duration = term;
            const convexity = term * (term + 1) / Math.pow(1 + rate, 2); // Very rough approximation
            return { duration, convexity };
        };

        // We should use an effective discount rate combining real rate and expected IPCA,
        // but for simplicity, we'll just use the real rate here.
        const shortMetrics = calculateMetrics(shortRate, shortTerm);
        const longMetrics = calculateMetrics(longRate, longTerm);

        return {
            short: shortMetrics,
            long: longMetrics
        };
    }

    function generateDurationNarrative(durationConvexity) {
        let narrative = `A Duração de Macaulay estimada indica a sensibilidade do valor do título a variações nas taxas de juros. `; 
        narrative += `A Opção Curta (${durationConvexity.short.duration.toFixed(2)} anos) é menos sensível que a Opção Longa (${durationConvexity.long.duration.toFixed(2)} anos). `;
        narrative += `A Convexidade (${durationConvexity.short.convexity.toFixed(2)} vs ${durationConvexity.long.convexity.toFixed(2)}) reflete como essa sensibilidade muda; valores maiores indicam que o preço do título aumenta mais com quedas de juros do que cai com altas equivalentes. `;
        narrative += `(Nota: Cálculo simplificado, desconsidera o impacto das projeções de IPCA nos fluxos de caixa para duration/convexidade).`;
        return narrative;
    }

    function calculateBreakEvenIpca(shortRate, shortTerm, longRate, longTerm, assumptions, firstYearFraction, targetShortFinalValue, targetLongFinalValue) {
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
            alert('Por favor, execute o cálculo principal primeiro.');
            return;
        }

        const ipcaShock = parseFloat(stressIpcaChangeInput.value || 0) / 100;
        const cdiShock = parseFloat(stressCdiChangeInput.value || 0) / 100;

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
        let stressNarrative = `Resultados com Choque (IPCA: ${ipcaShock >= 0 ? '+' : ''}${(ipcaShock * 100).toFixed(1)}%, CDI: ${cdiShock >= 0 ? '+' : ''}${(cdiShock * 100).toFixed(1)}%):\n`;
        stressNarrative += `  - Novo Ret. Anual. Curto+CDI: ${(stressedResults.shortScenario.annualizedReturn * 100).toFixed(2)}% (Original: ${(lastCalculationResults.shortScenario.annualizedReturn * 100).toFixed(2)}%)\n`;
        stressNarrative += `  - Novo Ret. Anual. Longo: ${(stressedResults.longScenario.annualizedReturn * 100).toFixed(2)}% (Original: ${(lastCalculationResults.longScenario.annualizedReturn * 100).toFixed(2)}%)\n`;
        stressNarrative += `  - Novo CDI Break-even: ${(stressedResults.breakEvenCdi * 100).toFixed(2)}% (Original: ${(lastCalculationResults.breakEvenCdi * 100).toFixed(2)}%)\n`;

        const winnerChanged = (stressedResults.shortScenario.finalValue > stressedResults.longScenario.finalValue) !== (lastCalculationResults.shortScenario.finalValue > lastCalculationResults.longScenario.finalValue);
        if (winnerChanged) {
            stressNarrative += `  - Atenção: O cenário de estresse alterou qual opção apresenta maior retorno final!\n`;
        }

        stressTestResultsEl.innerHTML = `<pre>${stressNarrative}</pre>`; // Use pre for formatting
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
            updateChart();
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
        let narrative = `Relatório da Simulação Trade IPCA+\n`;
        narrative += `Data da Simulação: ${dayjs().format('DD/MM/YYYY')}\n\n`;
        narrative += `Opção Curta: IPCA + ${(shortRate * 100).toFixed(2)}% a.a. por ${shortTerm} anos.\n`;
        narrative += `Opção Longa: IPCA + ${(longRate * 100).toFixed(2)}% a.a. por ${longTerm} anos.\n\n`;

        narrative += `Premissas Futuras Anuais:\n`;
        const yearsToShow = Math.min(simulationYears + 1, MAX_SLIDER_YEARS);
        for (let i = 0; i < yearsToShow; i++) {
            const year = currentYear + i;
            // Read assumption directly from stored state for consistency
            const ipca = assumptions.ipca[i] !== undefined ? assumptions.ipca[i] : assumptions.ipca[assumptions.ipca.length - 1];
            const cdi = assumptions.cdi[i] !== undefined ? assumptions.cdi[i] : assumptions.cdi[assumptions.cdi.length - 1];
            const yearLabel = i === 0 ? `${year} (Pro-rata ${Math.round(firstYearFraction*100)}%)` : `${year}`;
            narrative += `  ${yearLabel}: IPCA = ${(ipca * 100).toFixed(1)}%, CDI = ${(cdi * 100).toFixed(2)}%\n`;
        }
        if (simulationYears >= MAX_SLIDER_YEARS) {
             const lastYearUsed = currentYear + MAX_SLIDER_YEARS - 1;
             const ipcaPerp = assumptions.ipca[assumptions.ipca.length - 1];
             const cdiPerp = assumptions.cdi[assumptions.cdi.length - 1];
             narrative += `  Perpetuidade (após ${lastYearUsed}): IPCA = ${(ipcaPerp * 100).toFixed(1)}%, CDI = ${(cdiPerp * 100).toFixed(2)}%\n`;
        }
        narrative += `\nResultados da Simulação ao longo de ${longTerm} anos (Nominal):\n`;
        narrative += `  - Rentabilidade Acumulada (Opção Curta + Rolagem CDI): ${(results.shortScenario.finalValue - 100).toFixed(2)}%\n`;
        narrative += `  - Rentabilidade Acumulada (Opção Longa): ${(results.longScenario.finalValue - 100).toFixed(2)}%\n`;
        narrative += `  - Rentabilidade Anualizada (Opção Curta + Rolagem CDI): ${(results.shortScenario.annualizedReturn * 100).toFixed(2)}% a.a.\n`;
        narrative += `  - Rentabilidade Anualizada (Opção Longa): ${(results.longScenario.annualizedReturn * 100).toFixed(2)}% a.a.\n`;
        narrative += `  - CDI Break-even (Taxa CDI média futura que igualaria os retornos): Aproximadamente ${(results.breakEvenCdi * 100).toFixed(2)}% a.a.\n\n`;

        narrative += `Análise:\n`;
        if (results.shortScenario.finalValue > results.longScenario.finalValue) {
            narrative += `Considerando as premissas informadas, a estratégia de investir na Opção Curta (IPCA + ${(shortRate * 100).toFixed(2)}%) e rolar o montante em CDI após ${shortTerm} anos tende a gerar um retorno nominal acumulado maior (${(results.shortScenario.finalValue - 100).toFixed(2)}%) ao final de ${longTerm} anos, comparado à Opção Longa (${(results.longScenario.finalValue - 100).toFixed(2)}%).\n`;
            narrative += `A rentabilidade anualizada nominal da estratégia curta + CDI (${(results.shortScenario.annualizedReturn * 100).toFixed(2)}% a.a.) supera a da opção longa (${(results.longScenario.annualizedReturn * 100).toFixed(2)}% a.a.). `;
        } else if (results.longScenario.finalValue > results.shortScenario.finalValue) {
            narrative += `Com base nas projeções de IPCA e CDI fornecidas, a Opção Longa (IPCA + ${(longRate * 100).toFixed(2)}%) apresenta um potencial de retorno nominal acumulado superior (${(results.longScenario.finalValue - 100).toFixed(2)}%) ao final dos ${longTerm} anos, em relação à estratégia de investir na Opção Curta e rolar em CDI (${(results.shortScenario.finalValue - 100).toFixed(2)}%).\n`;
            narrative += `A rentabilidade anualizada nominal da opção longa (${(results.longScenario.annualizedReturn * 100).toFixed(2)}% a.a.) é maior que a da estratégia curta + CDI (${(results.shortScenario.annualizedReturn * 100).toFixed(2)}% a.a.). `;
        } else {
            narrative += `Nas condições simuladas, ambas as estratégias apresentam retornos nominais acumulados e anualizados praticamente idênticos ao final de ${longTerm} anos. A escolha pode depender de outros fatores, como liquidez ou perfil de risco.\n`;
        }

        narrative += `O CDI break-even de aproximadamente ${(results.breakEvenCdi * 100).toFixed(2)}% a.a. indica a taxa média de CDI futura que tornaria indiferente a escolha entre as duas opções. Se a expectativa para o CDI médio for superior a este valor, a estratégia curta + rolagem tende a ser mais vantajosa; se for inferior, a opção longa tende a ser melhor.\n\n`;

        narrative += `Influência das Premissas:\n`;
        narrative += `  - Projeções de IPCA mais elevadas beneficiam ambas as opções (indexadas ao IPCA). O impacto relativo depende das taxas reais e do prazo.
`;
        narrative += `  - Projeções de CDI mais altas favorecem diretamente a estratégia de rolagem da opção curta após seu vencimento. O CDI break-even é um indicador chave dessa sensibilidade.
`;
        narrative += `  - A taxa real (acima do IPCA) de cada título é crucial. Diferenças significativas aqui podem direcionar a escolha independentemente de pequenas variações nas premissas de CDI/IPCA.
\n`;
        narrative += `Observação: Esta simulação é um modelo simplificado e não considera impostos, taxas de custódia, reinvestimento de cupons (se houver) ou custos de transação. Os resultados dependem fortemente das premissas de IPCA e CDI futuras, que são incertas. Consulte um profissional financeiro antes de tomar decisões de investimento.`;

        return narrative;
    }

    function copyNarrative() {
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

