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
