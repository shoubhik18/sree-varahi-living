// CALCULATOR JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get all input elements
    const monthlyAmountInput = document.getElementById('monthlyAmount');
    const monthlySlider = document.getElementById('monthlySlider');
    const annualReturnInput = document.getElementById('annualReturn');
    const returnSlider = document.getElementById('returnSlider');
    const timePeriodInput = document.getElementById('timePeriod');
    const timeSlider = document.getElementById('timeSlider');
    const calculateBtn = document.getElementById('calculateBtn');

    // Result display elements
    const totalInvestedEl = document.getElementById('totalInvested');
    const totalReturnsEl = document.getElementById('totalReturns');
    const totalValueEl = document.getElementById('totalValue');
    const breakdownTableEl = document.getElementById('breakdownTable');

    // Chart canvas
    const chartCanvas = document.getElementById('sipChart');
    const chartCtx = chartCanvas.getContext('2d');

    // Synchronize input fields with sliders
    function syncInputs() {
        monthlyAmountInput.addEventListener('input', function() {
            monthlySlider.value = this.value;
            calculateSIP();
        });

        monthlySlider.addEventListener('input', function() {
            monthlyAmountInput.value = this.value;
            calculateSIP();
        });

        annualReturnInput.addEventListener('input', function() {
            returnSlider.value = this.value;
            calculateSIP();
        });

        returnSlider.addEventListener('input', function() {
            annualReturnInput.value = this.value;
            calculateSIP();
        });

        timePeriodInput.addEventListener('input', function() {
            timeSlider.value = this.value;
            calculateSIP();
        });

        timeSlider.addEventListener('input', function() {
            timePeriodInput.value = this.value;
            calculateSIP();
        });
    }

    // Format number to Indian currency format
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Calculate SIP returns
    function calculateSIP() {
        const monthlyAmount = parseFloat(monthlyAmountInput.value) || 0;
        const annualReturn = parseFloat(annualReturnInput.value) || 0;
        const timePeriod = parseInt(timePeriodInput.value) || 0;
        
        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = timePeriod * 12;
        
        // SIP Future Value calculation using compound interest formula
        let futureValue = 0;
        if (monthlyReturn > 0) {
            futureValue = monthlyAmount * (((1 + monthlyReturn) ** totalMonths - 1) / monthlyReturn) * (1 + monthlyReturn);
        } else {
            futureValue = monthlyAmount * totalMonths;
        }
        
        const totalInvested = monthlyAmount * totalMonths;
        const totalReturns = futureValue - totalInvested;

        // Update result displays
        totalInvestedEl.textContent = formatCurrency(totalInvested);
        totalReturnsEl.textContent = formatCurrency(totalReturns);
        totalValueEl.textContent = formatCurrency(futureValue);

        // Generate year-wise breakdown
        generateBreakdown(monthlyAmount, monthlyReturn, timePeriod);

        // Draw chart
        drawChart(monthlyAmount, monthlyReturn, timePeriod);
    }

    // Generate year-wise breakdown table
    function generateBreakdown(monthlyAmount, monthlyReturn, timePeriod) {
        let html = '<div class="breakdown-row header"><span>Year</span><span>Invested</span><span>Value</span></div>';
        
        let cumulativeInvestment = 0;
        let cumulativeValue = 0;
        
        for (let year = 1; year <= timePeriod; year++) {
            const monthsInYear = year * 12;
            cumulativeInvestment = monthlyAmount * monthsInYear;
            
            if (monthlyReturn > 0) {
                cumulativeValue = monthlyAmount * (((1 + monthlyReturn) ** monthsInYear - 1) / monthlyReturn) * (1 + monthlyReturn);
            } else {
                cumulativeValue = cumulativeInvestment;
            }
            
            html += `<div class="breakdown-row">
                <span>Year ${year}</span>
                <span>${formatCurrency(cumulativeInvestment)}</span>
                <span>${formatCurrency(cumulativeValue)}</span>
            </div>`;
        }
        
        breakdownTableEl.innerHTML = html;
    }

    // Draw simple chart using canvas
    function drawChart(monthlyAmount, monthlyReturn, timePeriod) {
        const canvas = chartCanvas;
        const ctx = chartCtx;
        
        // Set canvas size
        canvas.width = canvas.offsetWidth * 2; // For retina displays
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate data points
        const dataPoints = [];
        const investmentPoints = [];
        let maxValue = 0;
        
        for (let year = 0; year <= timePeriod; year++) {
            const months = year * 12;
            const investment = monthlyAmount * months;
            let value = 0;
            
            if (monthlyReturn > 0 && months > 0) {
                value = monthlyAmount * (((1 + monthlyReturn) ** months - 1) / monthlyReturn) * (1 + monthlyReturn);
            } else {
                value = investment;
            }
            
            dataPoints.push({ year, value });
            investmentPoints.push({ year, investment });
            maxValue = Math.max(maxValue, value);
        }
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= timePeriod; i++) {
            const x = padding + (i / timePeriod) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw investment line (straight line)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        investmentPoints.forEach((point, index) => {
            const x = padding + (point.year / timePeriod) * chartWidth;
            const y = height - padding - (point.investment / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw SIP value line (curved)
        ctx.strokeStyle = '#00FF88';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        dataPoints.forEach((point, index) => {
            const x = padding + (point.year / timePeriod) * chartWidth;
            const y = height - padding - (point.value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw legend
        ctx.font = '12px Roboto';
        
        // Investment legend
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(padding, 10, 15, 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Total Investment', padding + 20, 20);
        
        // Returns legend
        ctx.fillStyle = '#00FF88';
        ctx.fillRect(padding + 150, 10, 15, 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Total Value', padding + 170, 20);
    }

    // Initialize
    syncInputs();
    calculateSIP(); // Calculate with default values

    // Calculate button click handler
    calculateBtn.addEventListener('click', calculateSIP);

    // Dropdown functionality - HOVER BASED (matching index.html)
    const dropdownContainer = document.querySelector('.dropdown-container');
    const dropdownButton = document.querySelector('.dropdown-button');
    const dropdownContent = document.querySelector('.dropdown-content');
    let hoverTimeout;

    if (dropdownContainer && dropdownButton && dropdownContent) {
        // Add hover functionality to the entire dropdown container
        dropdownContainer.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            dropdownButton.classList.add('active');
            dropdownContent.classList.add('show');
        });

        dropdownContainer.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                dropdownButton.classList.remove('active');
                dropdownContent.classList.remove('show');
            }, 150);
        });

        // Prevent dropdown from closing when hovering over button
        dropdownButton.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
        });

        // Prevent dropdown from closing when hovering over content
        dropdownContent.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
        });

        // Handle dropdown links - close on click for navigation
        dropdownContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                clearTimeout(hoverTimeout);
                dropdownButton.classList.remove('active');
                dropdownContent.classList.remove('show');
            });
        });

        // Close dropdown when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                clearTimeout(hoverTimeout);
                dropdownButton.classList.remove('active');
                dropdownContent.classList.remove('show');
            }
        });
    }

    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navRight = document.querySelector('.nav-right');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (hamburger && navRight) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navRight.classList.toggle('active');
            document.body.style.overflow = navRight.classList.contains('active') ? 'hidden' : 'auto';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navRight.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navRight.contains(e.target) && navRight.classList.contains('active')) {
                hamburger.classList.remove('active');
                navRight.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Modal functionality
    const modal = document.getElementById('contactModal');
    const contactBtn = document.getElementById('contactBtn');
    const span = document.getElementsByClassName('close-modal')[0];

    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    if (contactBtn) {
        contactBtn.onclick = function() {
            openModal();
        };
    }

    if (span) {
        span.onclick = function() {
            closeModal();
        };
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };

    // Recalculate chart on window resize
    window.addEventListener('resize', function() {
        setTimeout(calculateSIP, 100);
    });
}); 