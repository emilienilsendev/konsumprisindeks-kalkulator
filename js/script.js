// KPI data from Statistics Norway (SSB)
// Base year: 2020 = 100
const kpiData = {
    "2000": 52.0,
    "2001": 53.5,
    "2002": 55.1,
    "2003": 56.2,
    "2004": 57.4,
    "2005": 58.7,
    "2006": 60.3,
    "2007": 61.8,
    "2008": 64.1,
    "2009": 65.7,
    "2010": 66.9,
    "2011": 68.4,
    "2012": 69.8,
    "2013": 71.2,
    "2014": 72.8,
    "2015": 74.3,
    "2016": 75.9,
    "2017": 77.8,
    "2018": 80.1,
    "2019": 82.3,
    "2020": 84.2,
    "2021": 86.9,
    "2022": 92.7,
    "2023": 98.4,
    "2024": 103.1 // Estimated
};

class KonsumprisindeksKalkulator {
    constructor() {
        this.initializeElements();
        this.populateYearOptions();
        this.attachEventListeners();
        this.setDefaultValues();
    }

    initializeElements() {
        this.amountInput = document.getElementById('amount');
        this.fromYearSelect = document.getElementById('from-year');
        this.toYearSelect = document.getElementById('to-year');
        this.calculateBtn = document.getElementById('calculate-btn');
        this.resultSection = document.getElementById('result');
        this.resultValue = document.getElementById('result-value');
        this.resultExplanation = document.getElementById('result-explanation');
        this.fromKpi = document.getElementById('from-kpi');
        this.toKpi = document.getElementById('to-kpi');
        this.changePercentage = document.getElementById('change-percentage');
    }

    populateYearOptions() {
        const years = Object.keys(kpiData).sort((a, b) => b - a);
        const currentYear = new Date().getFullYear();
        
        years.forEach(year => {
            const fromOption = new Option(year, year);
            const toOption = new Option(year, year);
            
            this.fromYearSelect.add(fromOption);
            this.toYearSelect.add(toOption);
        });
        
        // Set current year as default for "to" year
        const latestYear = years[0];
        this.toYearSelect.value = latestYear;
    }

    setDefaultValues() {
        // Set default from year to 5 years ago
        const currentYear = new Date().getFullYear();
        const defaultFromYear = Math.max(2000, currentYear - 5);
        
        if (kpiData[defaultFromYear]) {
            this.fromYearSelect.value = defaultFromYear;
        }
        
        // Focus on amount input
        this.amountInput.focus();
    }

    attachEventListeners() {
        this.calculateBtn.addEventListener('click', () => this.calculate());
        
        // Allow Enter key to trigger calculation
        this.amountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculate();
            }
        });
        
        // Real-time validation
        this.amountInput.addEventListener('input', () => {
            this.validateInput();
        });
    }

    validateInput() {
        const value = this.amountInput.value;
        if (value && parseFloat(value) < 0) {
            this.amountInput.value = Math.abs(parseFloat(value));
        }
    }

    async calculate() {
        const amount = parseFloat(this.amountInput.value);
        const fromYear = this.fromYearSelect.value;
        const toYear = this.toYearSelect.value;

        if (!this.validateForm(amount, fromYear, toYear)) {
            return;
        }

        this.setLoadingState(true);

        // Simulate API call delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const result = this.performCalculation(amount, fromYear, toYear);
            this.displayResult(result, amount, fromYear, toYear);
        } catch (error) {
            this.displayError('Det oppstod en feil under beregningen. Vennligst prøv igjen.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm(amount, fromYear, toYear) {
        if (!amount || amount <= 0) {
            this.showError('Vennligst skriv inn et gyldig beløp større enn 0.');
            this.amountInput.focus();
            return false;
        }

        if (amount > 1000000000) {
            this.showError('Beløpet er for stort. Vennligst skriv inn et beløp under 1 milliard.');
            return false;
        }

        if (fromYear === toYear) {
            this.showError('Vennligst velg forskjellige år for sammenligning.');
            return false;
        }

        return true;
    }

    performCalculation(amount, fromYear, toYear) {
        const fromKPI = kpiData[fromYear];
        const toKPI = kpiData[toYear];

        if (!fromKPI || !toKPI) {
            throw new Error('Mangler KPI-data for valgte år');
        }

        const equivalentAmount = (amount * toKPI / fromKPI);
        const percentageChange = ((toKPI - fromKPI) / fromKPI) * 100;

        return {
            equivalentAmount,
            fromKPI,
            toKPI,
            percentageChange
        };
    }

    displayResult(result, originalAmount, fromYear, toYear) {
        const formattedAmount = this.formatCurrency(result.equivalentAmount);
        const formattedOriginal = this.formatCurrency(originalAmount);
        const percentageText = this.formatPercentage(result.percentageChange);

        this.resultValue.textContent = `${formattedAmount} NOK`;
        this.resultExplanation.textContent = 
            `${formattedOriginal} NOK i ${fromYear} tilsvarer ca. ${formattedAmount} NOK i ${toYear} når man justerer for konsumprisindeksen.`;
        
        this.fromKpi.textContent = result.fromKPI.toFixed(1);
        this.toKpi.textContent = result.toKPI.toFixed(1);
        this.changePercentage.textContent = `${percentageText} (${result.percentageChange > 0 ? 'økning' : 'reduksjon'})`;
        
        this.resultSection.hidden = false;
        
        // Scroll to result
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Update page title for better UX
        document.title = `${formattedAmount} NOK i ${toYear} | Konsumprisindeks Kalkulator`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('no-NO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatPercentage(percentage) {
        return new Intl.NumberFormat('no-NO', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
            signDisplay: 'exceptZero'
        }).format(percentage) + '%';
    }

    showError(message) {
        alert(message); // In a real app, you might want a more sophisticated error display
    }

    displayError(message) {
        this.resultValue.textContent = 'Feil';
        this.resultExplanation.textContent = message;
        this.resultSection.hidden = false;
    }

    setLoadingState(loading) {
        this.calculateBtn.disabled = loading;
        this.calculateBtn.classList.toggle('loading', loading);
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KonsumprisindeksKalkulator();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
