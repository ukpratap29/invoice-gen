const clientAddrArea = document.getElementById('clientAddr');
const forDetailsArea = document.getElementById('forDetails');
const bankDetailsArea = document.getElementById('bankDetails');

let itemRowIds = ["item-row-1"];
let gstItemMap = new Map();

// Function to auto-adjust the height of the textarea
clientAddrArea.addEventListener('input', function () {
    this.style.height = 'auto';  // Reset height to auto so that it can shrink when needed
    this.style.height = (this.scrollHeight) + 'px';  // Set the height based on scrollHeight
});

forDetailsArea.addEventListener('input', function () {
    this.style.height = 'auto';  // Reset height to auto so that it can shrink when needed
    this.style.height = (this.scrollHeight) + 'px';  // Set the height based on scrollHeight
});

bankDetailsArea.addEventListener('input', function () {
    this.style.height = 'auto';  // Reset height to auto so that it can shrink when needed
    this.style.height = (this.scrollHeight) + 'px';  // Set the height based on scrollHeight
});

let itemRowCount = 1;
let gstRowCount = 0;

function addItem() {
    itemRowCount++;
    const tableBody = document.querySelector('table tbody');
    const newRow = document.createElement('tr');
    newRow.classList.add('item-row');
    const iRId = `item-row-${itemRowCount}`
    newRow.id = iRId;
    newRow.innerHTML = `
    <td class="col-1 text-center srno">${itemRowCount}</td>
                        <td class="col-5">
                            <select class="form-select desc" aria-label="Default select example">
                                <option value="" disabled selected>Select your option</option>
                                <option value="item-1">Day outing with Food</option>
                                <option value="item-2">Adventure Activities</option>
                                <option value="item-3">Dorm Stay</option>
                                <option value="item-4">Cottage Stay</option>
                                <option value="item-5">Extra Activities</option>
                                <option value="item-6">Day outing with Food, trek & activities</option>
                            </select>
                        </td>
                        <td class="col-2 text-center">
                            <input name="rate" type="text" class="form-control item-rate"
                                oninput="calculateAmount(this)" onchange="updateGSTAmt(this)">
                        </td>
                        <td class="col-2 text-center">
                            <input name="headcount" type="text" class="form-control item-headcount"
                                oninput="calculateAmount(this)" onchange="updateGSTAmt(this)">
                        </td>
                        <td name="amount" class="col-2 text-center item-amount">0.00</td>
        `;
    tableBody.insertBefore(newRow, document.getElementById('total-amt-row'));
    itemRowIds.push(iRId);
}


function calculateAmount(input) {
    const row = input.closest('tr'); // Get the current row
    const rateInput = row.querySelector('.item-rate');
    const headcountInput = row.querySelector('.item-headcount');
    const amountCell = row.querySelector('.item-amount');

    // Parse values
    const rate = parseFloat(rateInput.value) || 0; // Default to 0 if NaN
    const headcount = parseFloat(headcountInput.value) || 0; // Default to 0 if NaN

    // Calculate amount and round up to two decimal places
    const amount = Math.ceil(rate * headcount * 100) / 100;

    // Update the amount cell
    amountCell.textContent = amount.toFixed(2); // Format to 2 decimal places
    calculateTotalAmt();
}

function calculateTotalAmt() {
    const itemAmounts = document.querySelectorAll('.item-amount');
    const gstAmounts = document.querySelectorAll('.gst-amt');
    let total = 0;

    itemAmounts.forEach(amountCell => {
        total += parseFloat(amountCell.textContent) || 0; // Sum up itemAmounts
    });
    gstAmounts.forEach(amountCell => {
        total += parseFloat(amountCell.textContent) || 0; // Sum up gstAmounts
    });

    // Update the total row
    document.querySelector('.total-amount').textContent = total.toFixed(2); // Format to 2 decimal places
    amtInWords = convertAmtToWords(total.toFixed(2));
    upsertAmtToWordsRow(amtInWords);
}


function addGSTRow() {
    gstRowCount++;
    const gstRId = `gst-row-${gstRowCount}`
    addNewRow(gstRId, 'GST');
    // gstAppliedAmount = amountWithGST(newRow);
    // newRow.querySelector('.gst-amt').textContent = gstAppliedAmount;
    gstItemMap.set(gstRId, [...itemRowIds]); // Store the item row IDs with the GST row ID
    itemRowIds = []; // Clear the item row array after the GST row is applied

}

function addCGST_SGSTRow() {
    gstRowCount++;
    const cgstRId = `cgst-row-${gstRowCount}`
    addNewRow(cgstRId, 'CGST');

    gstRowCount++;
    const sgstRId = `sgst-row-${gstRowCount}`
    addNewRow(sgstRId, 'SGST');
    // gstAppliedAmount = amountWithGST(newRow);
    // newRow.querySelector('.gst-amt').textContent = gstAppliedAmount;
    gstItemMap.set(cgstRId, [...itemRowIds]); // Store the item row IDs with the GST row ID
    gstItemMap.set(sgstRId, [...itemRowIds]);
    itemRowIds = []; // Clear the item row array after the GST row is applied

}

function addNewRow(gstRId, taxType) {
    const tableBody = document.querySelector('table tbody');
    const newRow = document.createElement('tr');
    newRow.classList.add('gst-row');
    newRow.id = gstRId;
    newRow.innerHTML = `
    <td colspan="3" class="text-end align-middle">${taxType}</td>
                    <td class="text-center">
                        <select class="form-select gst-rate-value" style="width: auto;" oninput="calAmountWithGST(this)">
                            <option value="">Select rate...</option>
                            <option value="0.125">0.125 %</option>
                            <option value="0.25">0.25 %</option>
                            <option value="1.5">1.5 %</option>
                            <option value="2.5">2.5 %</option>
                            <option value="3">3 %</option>
                            <option value="5">5 %</option>
                            <option value="6">6 %</option>
                            <option value="9">9 %</option>
                            <option value="12">12 %</option>
                            <option value="14">14 %</option>
                            <option value="18">18 %</option>
                            <option value="28">28 %</option>
                        </select>
                    </td>
                    <td class="text-center gst-amt"></td>
    `;
    tableBody.insertBefore(newRow, document.getElementById('total-amt-row'));
}

function calAmountWithGST(inp) {
    var currGSTRow = inp;
    var getGSTRate = inp.querySelector('.gst-rate-value'); // Select the GST rate dropdown
    if (getGSTRate == null) {
        currGSTRow = inp.closest('tr');
        getGSTRate = currGSTRow.querySelector('.gst-rate-value');
    }

    const selectedGSTRate = getGSTRate.options[getGSTRate.selectedIndex].value; // Get the selected option text

    let itemsWithAmount = gstItemMap.get(currGSTRow.id);

    let totalItemAmt = 0;
    itemsWithAmount.forEach(item => {
        const itemWithAmtRow = document.getElementById(item);

        const amountInItemRow = itemWithAmtRow.querySelector('.item-amount');
        const amountInItem = parseFloat(amountInItemRow.textContent) || 0;

        totalItemAmt += amountInItem;
    });

    gstRate = selectedGSTRate / 100;
    const gstAppliedAmount = Math.ceil(gstRate * totalItemAmt)
    currGSTRow.querySelector('.gst-amt').textContent = gstAppliedAmount.toFixed(2);
    calculateTotalAmt();
}

var transformedMap = new Map();
function mapGstRowToItemRow() {
    gstItemMap.forEach((items, gstRow) => {
        items.forEach(item => {
            // Check if the item already exists in the transformed map
            if (!transformedMap.has(item)) {
                transformedMap.set(item, []); // Initialize with an empty array
            }
            // Push the gstRow to the item's array
            transformedMap.get(item).push(gstRow);
        });
    });
}

function updateGSTAmt(inp) {
    // Shows console error when row has no valu for rate and headcount
    mapGstRowToItemRow();
    const currItemRow = inp.closest('tr');

    let gstRowsAssocWithItem = transformedMap.get(currItemRow.id);
    gstRowsAssocWithItem.forEach(row => {
        const gstRow = document.getElementById(row);
        calAmountWithGST(gstRow)
    });

    transformedMap = new Map();
}



function convertAmtToWords(amt) {
    return numberToWords(amt);
}

function upsertAmtToWordsRow(amtInWords) {
    const amtInWordRow = document.getElementById('total-amt-in-wrd')
    amtInWordRow.textContent = `Amount In words: ${amtInWords}`; 
}

const numberToWords = (num) => {
    const belowTwenty = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 
        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 
        'eighteen', 'nineteen'
    ];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'lakh', 'crore'];

    const convertToWords = (n) => {
        if (n === 0) return '';
        if (n < 20) return belowTwenty[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + belowTwenty[n % 10] : '');
        if (n < 1000) return belowTwenty[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '');
        return '';
    };

    const convertLargeNumbers = (n) => {
        let result = '';
        let i = 0;
        while (n > 0) {
            let part = n % 1000;
            if (part !== 0) {
                result = convertToWords(part) + (thousands[i] ? ' ' + thousands[i] : '') + ' ' + result;
            }
            n = Math.floor(n / 1000);
            i++;
        }
        return result.trim();
    };

    const splitNumber = num.toString().split('.'); // Split integer and decimal part
    const integerPart = parseInt(splitNumber[0], 10); // Convert integer part to number
    const decimalPart = splitNumber[1] ? splitNumber[1].substr(0, 2) : null; // Get the first two digits of decimal part
    
    const rupees = convertLargeNumbers(integerPart);
    let result = rupees + ' rupees';

    if (decimalPart && parseInt(decimalPart, 10) > 0) {
        const paise = convertToWords(parseInt(decimalPart, 10));
        result += ' and ' + paise + ' paise';
    }

    return result.charAt(0).toUpperCase() + result.slice(1); // Capitalize the first letter
};


function downloadPDF() {
    const element = document.querySelector('html'); // Select the form content

    const invoiceNumber = document.querySelector('.inv-num').value;

    document.body.classList.add('print-mode');
    var opt = {
        margin:       0.5,           // Margins around the content
        filename:     `Invoice-${invoiceNumber}.pdf`, // Name of the file
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },  // Canvas resolution
        jsPDF:        { unit: 'in', format: 'a3', orientation: 'portrait' }
    };

    // Generate the PDF
    html2pdf().from(element).set(opt).save().then(() => {
        // Remove the 'print-mode' class to restore original styles
        document.body.classList.remove('print-mode');
    });
}
