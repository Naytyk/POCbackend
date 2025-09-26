// This is a valid async arrow function expression.
async (shared) => {
    let allData = [];
    const nameElements = document.querySelectorAll('span.zp_pHNm5');
    const roleDivs = document.querySelectorAll('div.zp_YGDgt');
    const emailElements = document.querySelectorAll('span.zp_xvo3G.zp_JTaUA');

    const validRoles = Array.from(roleDivs)
        .filter((_, i) => i % 2 === 0)
        .map(div => div.querySelector('span.zp_FEm_X')?.textContent.trim().replace(/&amp;/g, '&') || '');
        
    const maxLength = Math.max(nameElements.length, validRoles.length, emailElements.length);
    for (let i = 0; i < maxLength; i++) {
        const name = nameElements[i]?.textContent.trim() || '';
        const role = validRoles[i] || '';
        const email = emailElements[i]?.textContent.trim() || '';
        if (name || role || email) {
            allData.push({ pocRole: role, pocName: name, pocEmail: email });
        }
    }
    return allData;
}