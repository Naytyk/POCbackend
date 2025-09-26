// This is a valid async arrow function expression.
async (shared) => {
    // Platform-specific logic starts here.
    const extractTableData = async (tableContainer) => {
        const extractedData = [];
        const rows = tableContainer.querySelectorAll('.comp--gridtable__row');
        for (const row of rows) {
            const nameCell = row.querySelector('[data-walk-through-id*="-cell-name"]');
            const designationCell = row.querySelector('[data-walk-through-id*="-cell-designation"]');
            if (!nameCell) continue;
            let nameText = nameCell.textContent.trim().replace(/^\d+\.\s*/, '').split('\n')[0].trim();
            const designation = designationCell ? designationCell.textContent.trim() : '';
            const emailIcon = nameCell.querySelector('span.fa-envelope');
            let email = '';
            if (emailIcon) {
                document.querySelectorAll('.listDropdown__wrapper').forEach(d => d.style.display = 'none');
                emailIcon.click();
                await shared.delay(500);
                const emailDropdown = document.querySelector('.listDropdown__wrapper:not([style*="display: none"])');
                if (emailDropdown) {
                    email = emailDropdown.querySelector('a[href^="mailto:"]')?.textContent.trim() || '';
                }
                document.body.click();
                await shared.delay(200);
            }
            extractedData.push({ pocRole: designation, pocName: nameText, pocEmail: email });
        }
        return extractedData;
    };
    
    // Main execution logic for this scraper
    const targetSections = ["Founders & Key People", "Senior Management"];
    let allData = [];
    const headers = document.querySelectorAll('.txn--dp-subheader');
    for (const header of headers) {
        const sectionTitle = header.textContent.trim();
        if (targetSections.includes(sectionTitle)) {
            let tableContainer = header.parentElement.querySelector('.comp--gridtable__wrapper-v2') || header.parentElement.nextElementSibling?.querySelector('.comp--gridtable__wrapper-v2');
            if (tableContainer) {
                allData.push(...await extractTableData(tableContainer));
            }
        }
    }
    return allData;
}