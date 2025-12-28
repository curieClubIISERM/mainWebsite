export const drive = {
    extractFileId(driveLink) {
        const fileIdMatch = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (!fileIdMatch) {
            throw new Error('Invalid Google Drive link');
        }
        return fileIdMatch[1];
    },
    toDownload(driveLink) {
        const fileId = this.extractFileId(driveLink);
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    },
    toView(driveLink) {
        const fileId = this.extractFileId(driveLink);
        return `https://drive.google.com/file/d/${fileId}/view`;
    }
};

export function formatStudentInfo(jsonObj) {
    // Extract name and registration number
    const fullName = jsonObj.Name.trim(); // Remove any extra spaces
    const regNum = jsonObj["Registration Number"].trim(); // Remove extra spaces

    // Check if name exceeds 20 characters
    const name =
        fullName.length > 20 ? fullName.split(" ")[0] : fullName;

    // Extract the first 4 characters of the registration number
    const regPrefix = regNum.substring(0, 4);

    // Construct the formatted string
    return `${name} (${regPrefix})`;
}

export function extractDateFromISO(isoDate) {
    const date = new Date(isoDate);
    return date.toDateString();
}

export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export function normalizeMoleculeKey(rawKey) {
    if (!rawKey) return null;

    return rawKey
        .trim()
        .replace(/[-_]+(.)?/g, (_, char) =>
            char ? char.toUpperCase() : ''
        );
}
