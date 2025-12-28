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

export function normalizeMoleculeKey(rawKey) {
    if (!rawKey) return null;

    // If it already exists as-is, return it
    if (molecules[rawKey]) return rawKey;

    // Convert snake_case or kebab-case to camelCase
    const camelKey = rawKey
        .toLowerCase()
        .replace(/[-_]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');

    // If converted key exists, return it
    if (molecules[camelKey]) return camelKey;

    // Fallback (still return camelKey for debugging)
    return camelKey;
}
